# ========================================
# Step Functions State Machine for Subtitling Processing
# ========================================
# Simple workflow:
# 1. Run single Fargate task for subtitling
# 2. Send completion message via Lambda
# ========================================

# IAM Role for Step Functions (Subtitling)
resource "aws_iam_role" "step_functions_role_subtitling" {
  name = "subtiter-step-functions-role-subtitling"

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

# Policy to allow Step Functions to run ECS tasks (Subtitling)
resource "aws_iam_role_policy" "step_functions_ecs_policy_subtitling" {
  name = "ecs-task-execution-subtitling"
  role = aws_iam_role.step_functions_role_subtitling.id

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
          aws_ecs_task_definition.subtiter_task.arn,
          "arn:aws:ecs:${var.region}:${data.aws_caller_identity.current.account_id}:task/subtiter-cluster/*"
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

# Policy to allow Step Functions to write to CloudWatch Logs (Subtitling)
resource "aws_iam_role_policy" "step_functions_logs_policy_subtitling" {
  name = "cloudwatch-logs-access-subtitling"
  role = aws_iam_role.step_functions_role_subtitling.id

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

# CloudWatch Logs for Step Functions (Subtitling)
resource "aws_cloudwatch_log_group" "step_functions_logs_subtitling" {
  name              = "/aws/stepfunctions/subtiter-subtitling-processing"
  retention_in_days = 3
}

# Step Functions State Machine (Subtitling)
resource "aws_sfn_state_machine" "subtitling_processing" {
  name     = "subtiter-subtitling-processing"
  role_arn = aws_iam_role.step_functions_role_subtitling.arn

  logging_configuration {
    log_destination        = "${aws_cloudwatch_log_group.step_functions_logs_subtitling.arn}:*"
    include_execution_data = true
    level                  = "ALL"
  }

  definition = jsonencode({
    Comment = "Subtitling processing workflow with single Fargate task"
    StartAt = "RunSubtitlingTask"
    States = {
      # Step 1: Run Subtitling Task
      RunSubtitlingTask = {
        Type     = "Task"
        Resource = "arn:aws:states:::ecs:runTask.sync"
        Parameters = {
          LaunchType     = "FARGATE"
          Cluster        = aws_ecs_cluster.subtiter.arn
          TaskDefinition = aws_ecs_task_definition.subtiter_task.arn
          NetworkConfiguration = {
            AwsvpcConfiguration = {
              Subnets        = data.aws_subnets.default.ids
              SecurityGroups = [aws_security_group.subtiter_fargate_sg.id]
              AssignPublicIp = "ENABLED"
            }
          }
          Overrides = {
            ContainerOverrides = [
              {
                Name = "subtitercmd"
                Environment = [
                  {
                    Name      = "TASK_INPUT"
                    "Value.$" = "States.JsonToString($.task_input)"
                  }
                ]
              }
            ]
          }
        }
        ResultPath = "$.taskResult"
        Next       = "SendCompletionMessage"
        Retry = [
          {
            ErrorEquals     = ["States.TaskFailed"]
            IntervalSeconds = 30
            MaxAttempts     = 2
            BackoffRate     = 2.0
          }
        ]
        Catch = [
          {
            ErrorEquals = ["States.ALL"]
            ResultPath  = "$.error"
            Next        = "SubtitlingTaskFailed"
          }
        ]
      }

      # Step 2: Send completion message via Lambda
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
        Next       = "TaskCompleted"
        Catch = [
          {
            ErrorEquals = ["States.ALL"]
            ResultPath  = "$.error"
            Next        = "TaskCompleted" # Continue even if Lambda fails
          }
        ]
      }

      # Success state
      TaskCompleted = {
        Type = "Succeed"
      }

      # Error state
      SubtitlingTaskFailed = {
        Type  = "Fail"
        Error = "SubtitlingTaskFailed"
        Cause = "The subtitling Fargate task failed to complete successfully"
      }
    }
  })
}


# ========================================
# Outputs
# ========================================

output "state_machine_subtitling_arn" {
  value       = aws_sfn_state_machine.subtitling_processing.arn
  description = "ARN of the Step Functions state machine for subtitling"
}

output "state_machine_subtitling_name" {
  value       = aws_sfn_state_machine.subtitling_processing.name
  description = "Name of the Step Functions state machine for subtitling"
}


