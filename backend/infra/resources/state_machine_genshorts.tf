# ========================================
# Step Functions State Machine for Video Processing
# ========================================
# Orchestrates parent-child Fargate task execution:
# 1. Run parent task to prepare video segments
# 2. Run n child tasks in parallel to process each segment
# ========================================

# IAM Role for Step Functions
resource "aws_iam_role" "step_functions_role" {
  name = "klippers-step-functions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "states.amazonaws.com"
      }
    }]
  })
}

# Policy to allow Step Functions to run ECS tasks
resource "aws_iam_role_policy" "step_functions_ecs_policy" {
  name = "ecs-task-execution"
  role = aws_iam_role.step_functions_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:RunTask",
          "ecs:StopTask",
          "ecs:DescribeTasks"
        ]
        Resource = [
          aws_ecs_task_definition.klippers_task.arn,
          "arn:aws:ecs:${var.region}:${data.aws_caller_identity.current.account_id}:task/klippers-cluster/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = [
          aws_iam_role.ecs_task_execution_role.arn,
          aws_iam_role.ecs_task_role.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "events:PutTargets",
          "events:PutRule",
          "events:DescribeRule"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = [
          "${aws_s3_bucket.videos_warehouse.arn}/*"
        ]
      }
    ]
  })
}

# Policy to allow Step Functions to write to CloudWatch Logs
resource "aws_iam_role_policy" "step_functions_logs_policy" {
  name = "cloudwatch-logs-access"
  role = aws_iam_role.step_functions_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogDelivery",
          "logs:GetLogDelivery",
          "logs:UpdateLogDelivery",
          "logs:DeleteLogDelivery",
          "logs:ListLogDeliveries",
          "logs:PutResourcePolicy",
          "logs:DescribeResourcePolicies",
          "logs:DescribeLogGroups"
        ]
        Resource = "*"
      }
    ]
  })
}

# CloudWatch Logs for Step Functions
resource "aws_cloudwatch_log_group" "step_functions_logs" {
  name              = "/aws/stepfunctions/klippers-video-processing"
  retention_in_days = 3
}

# Step Functions State Machine
resource "aws_sfn_state_machine" "video_processing" {
  name     = "klippers-video-processing"
  role_arn = aws_iam_role.step_functions_role.arn

  logging_configuration {
    log_destination        = "${aws_cloudwatch_log_group.step_functions_logs.arn}:*"
    include_execution_data = true
    level                  = "ALL"
  }

  definition = jsonencode({
    Comment = "Video processing workflow with parent-child Fargate tasks"
    StartAt = "RunParentTask"
    States = {
      # Step 1: Run Parent Task
      RunParentTask = {
        Type     = "Task"
        Resource = "arn:aws:states:::ecs:runTask.sync"
        Parameters = {
          LaunchType     = "FARGATE"
          Cluster        = aws_ecs_cluster.klippers.arn
          TaskDefinition = aws_ecs_task_definition.klippers_task.arn
          NetworkConfiguration = {
            AwsvpcConfiguration = {
              Subnets        = data.aws_subnets.default.ids
              SecurityGroups = [aws_security_group.klippers_fargate_sg.id]
              AssignPublicIp = "ENABLED"
            }
          }
          Overrides = {
            ContainerOverrides = [
              {
                Name = "klipperscmd"
                Environment = [
                  {
                    Name      = "TASK_INPUT"
                    "Value.$" = "States.JsonToString($.task_input)"
                  },
                  {
                    Name  = "FARGATE_EXECUTION_ROLE"
                    Value = "parent"
                  }
                ]
              }
            ]
          }
        }
        ResultPath = "$.parentTaskResult"
        Next       = "ReadSegmentCount"
        Catch = [
          {
            ErrorEquals = ["States.ALL"]
            ResultPath  = "$.error"
            Next        = "ParentTaskFailed"
          }
        ]
      }

      # Read segment_count from S3 (shorts_config.json)
      ReadSegmentCount = {
        Type     = "Task"
        Resource = "arn:aws:states:::aws-sdk:s3:getObject"
        Parameters = {
          "Bucket.$" = "$.task_input.VIDEO_WAREHOUSE_S3_BUCKET_NAME"
          "Key.$"    = "States.Format('{}/{}/{}/shorts_config.json', $.task_input.S3_WAREHOUSE_PREFIX, $.task_input.user_id, $.task_input.video_id)"
        }
        ResultSelector = {
          "config.$" = "States.StringToJson($.Body)"
        }
        ResultPath = "$.shortsConfig"
        Next       = "PrepareChildTasks"
        Catch = [
          {
            ErrorEquals = ["States.ALL"]
            ResultPath  = "$.error"
            Next        = "ReadConfigFailed"
          }
        ]
      }

      # Prepare array of segment numbers for parallel execution
      PrepareChildTasks = {
        Type = "Pass"
        Parameters = {
          "task_input.$"      = "$.task_input"
          "segment_count.$"   = "States.MathAdd(0, $.shortsConfig.config.config_json.segment_count)"
          "segment_numbers.$" = "States.ArrayRange(1, States.MathAdd(0, $.shortsConfig.config.config_json.segment_count), 1)"
        }
        Next = "RunChildTasksInParallel"
      }

      # Step 2: Run Child Tasks in Parallel
      RunChildTasksInParallel = {
        Type           = "Map"
        ItemsPath      = "$.segment_numbers"
        MaxConcurrency = 15 # Adjust based on your AWS account limits
        Parameters = {
          "task_input.$"     = "$.task_input"
          "segment_number.$" = "$$.Map.Item.Value"
        }
        Iterator = {
          StartAt = "RunChildTask"
          States = {
            RunChildTask = {
              Type     = "Task"
              Resource = "arn:aws:states:::ecs:runTask.sync"
              Parameters = {
                LaunchType     = "FARGATE"
                Cluster        = aws_ecs_cluster.klippers.arn
                TaskDefinition = aws_ecs_task_definition.klippers_task.arn
                NetworkConfiguration = {
                  AwsvpcConfiguration = {
                    Subnets        = data.aws_subnets.default.ids
                    SecurityGroups = [aws_security_group.klippers_fargate_sg.id]
                    AssignPublicIp = "ENABLED"
                  }
                }
                Overrides = {
                  ContainerOverrides = [
                    {
                      Name = "klipperscmd"
                      Environment = [
                        {
                          Name      = "TASK_INPUT"
                          "Value.$" = "States.JsonToString($.task_input)"
                        },
                        {
                          Name      = "SEGMENT_NUMBER"
                          "Value.$" = "States.Format('{}', $.segment_number)"
                        },
                        {
                          Name  = "FARGATE_EXECUTION_ROLE"
                          Value = "child"
                        }
                      ]
                    }
                  ]
                }
              }
              End = true
              Retry = [
                {
                  ErrorEquals     = ["States.TaskFailed"]
                  IntervalSeconds = 30
                  MaxAttempts     = 2
                  BackoffRate     = 2.0
                }
              ]
            }
          }
        }
        ResultPath = "$.childTasksResult"
        Next       = "SendCompletionMessage"
        Catch = [
          {
            ErrorEquals = ["States.ALL"]
            ResultPath  = "$.error"
            Next        = "ChildTasksFailed"
          }
        ]
      }

      # Step 3: Send completion message via Lambda
      SendCompletionMessage = {
        Type     = "Task"
        Resource = "arn:aws:states:::lambda:invoke"
        Parameters = {
          FunctionName = aws_lambda_function.send_completion_message.arn
          Payload = {
            "task_input.$" = "$.task_input"
          }
        }
        ResultPath = "$.lambdaResult"
        Next       = "AllTasksCompleted"
        Catch = [
          {
            ErrorEquals = ["States.ALL"]
            ResultPath  = "$.error"
            Next        = "AllTasksCompleted" # Continue even if Lambda fails
          }
        ]
      }

      # Success state
      AllTasksCompleted = {
        Type = "Succeed"
      }

      # Error states
      ParentTaskFailed = {
        Type  = "Fail"
        Error = "ParentTaskFailed"
        Cause = "The parent Fargate task failed to complete successfully"
      }

      ReadConfigFailed = {
        Type  = "Fail"
        Error = "ReadConfigFailed"
        Cause = "Failed to read shorts_config.json from S3"
      }

      ChildTasksFailed = {
        Type  = "Fail"
        Error = "ChildTasksFailed"
        Cause = "One or more child Fargate tasks failed to complete successfully"
      }
    }
  })
}

# ========================================
# Outputs
# ========================================

output "state_machine_arn" {
  value       = aws_sfn_state_machine.video_processing.arn
  description = "ARN of the Step Functions state machine"
}

output "state_machine_name" {
  value       = aws_sfn_state_machine.video_processing.name
  description = "Name of the Step Functions state machine"
}

