# ========================================
# Step Functions State Machine for Trimming Processing
# ========================================
# Simple workflow:
# 1. Run single Fargate task for trimming
# 2. Send completion message via Lambda
# ========================================

# IAM Role for Step Functions (Trimming)
resource "aws_iam_role" "step_functions_role_trimming" {
  name = "subtiter-step-functions-role-trimming"

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

# Policy to allow Step Functions to run ECS tasks (Trimming)
resource "aws_iam_role_policy" "step_functions_ecs_policy_trimming" {
  name = "ecs-task-execution-trimming"
  role = aws_iam_role.step_functions_role_trimming.id

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

# Policy to allow Step Functions to write to CloudWatch Logs (Trimming)
resource "aws_iam_role_policy" "step_functions_logs_policy_trimming" {
  name = "cloudwatch-logs-access-trimming"
  role = aws_iam_role.step_functions_role_trimming.id

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

# CloudWatch Logs for Step Functions (Trimming)
resource "aws_cloudwatch_log_group" "step_functions_logs_trimming" {
  name              = "/aws/stepfunctions/subtiter-trimming-processing"
  retention_in_days = 3
}

# Step Functions State Machine (Trimming)
resource "aws_sfn_state_machine" "trimming_processing" {
  name     = "subtiter-trimming-processing"
  role_arn = aws_iam_role.step_functions_role_trimming.arn

  logging_configuration {
    log_destination        = "${aws_cloudwatch_log_group.step_functions_logs_trimming.arn}:*"
    include_execution_data = true
    level                  = "ALL"
  }

  definition = jsonencode({
    Comment = "Trimming processing workflow with single Fargate task"
    StartAt = "RunTrimmingTask"
    States = {
      # Step 1: Run Trimming Task
      RunTrimmingTask = {
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
            Next        = "TrimmingTaskFailed"
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
      TrimmingTaskFailed = {
        Type  = "Fail"
        Error = "TrimmingTaskFailed"
        Cause = "The trimming Fargate task failed to complete successfully"
      }
    }
  })
}


# ========================================
# Outputs
# ========================================

output "state_machine_trimming_arn" {
  value       = aws_sfn_state_machine.trimming_processing.arn
  description = "ARN of the Step Functions state machine for trimming"
}

output "state_machine_trimming_name" {
  value       = aws_sfn_state_machine.trimming_processing.name
  description = "Name of the Step Functions state machine for trimming"
}


