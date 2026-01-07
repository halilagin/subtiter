# ========================================
# Lambda Function for Sending Completion Message
# ========================================

# IAM Role for Lambda
resource "aws_iam_role" "lambda_send_message_role" {
  name = "subtiter-lambda-send-message-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# Policy to allow Lambda to write to CloudWatch Logs
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_send_message_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda function code (read from external Python file)
locals {
  lambda_code = file("${path.module}/lambda_send_message.py")
}

# Lambda function to send completion message
resource "aws_lambda_function" "send_completion_message" {
  depends_on = [null_resource.lambda_send_message_package]
  
  function_name = "subtiter-send-completion-message"
  role          = aws_iam_role.lambda_send_message_role.arn
  handler       = "index.lambda_handler"
  runtime       = "python3.11"
  timeout       = 30

  filename         = "${path.module}/lambda_send_message.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda_send_message.zip")
}

# Build Lambda package with dependencies
resource "null_resource" "lambda_send_message_package" {
  triggers = {
    # Rebuild when Lambda code changes (uses hash of the code)
    lambda_code_hash = md5(local.lambda_code)
  }

  provisioner "local-exec" {
    command = <<-EOT
      set -e
      LAMBDA_DIR="${path.module}/.lambda_send_message"
      ZIP_FILE="${path.module}/lambda_send_message.zip"
      MODULE_DIR="${path.module}"
      
      # Clean up old build directory and zip file
      rm -rf "$LAMBDA_DIR" "$ZIP_FILE"
      mkdir -p "$LAMBDA_DIR"
      
      # Copy Lambda function code from Python file
      cp "${path.module}/lambda_send_message.py" "$LAMBDA_DIR/index.py"
      
      # Install redis package into the Lambda directory
      # Use python3 -m pip to ensure we use the correct Python version
      python3 -m pip install --target "$LAMBDA_DIR" redis --quiet --disable-pip-version-check
      
      # Create zip file (ensure absolute path by resolving relative paths)
      cd "$LAMBDA_DIR"
      ABS_ZIP_FILE="$(cd "$MODULE_DIR" && pwd)/lambda_send_message.zip"
      zip -r "$ABS_ZIP_FILE" . -q
      cd - > /dev/null
      
      # Clean up build directory
      rm -rf "$LAMBDA_DIR"
    EOT
  }
}


# Policy to allow Step Functions to invoke Lambda (Shorts)
resource "aws_iam_role_policy" "step_functions_lambda_policy" {
  name = "lambda-invocation"
  role = aws_iam_role.step_functions_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.send_completion_message.arn
        ]
      }
    ]
  })
}

# Policy to allow Step Functions to invoke Lambda (Subtitling)
resource "aws_iam_role_policy" "step_functions_lambda_policy_subtitling" {
  name = "lambda-invocation-subtitling"
  role = aws_iam_role.step_functions_role_subtitling.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.send_completion_message.arn
        ]
      }
    ]
  })
}

# Policy to allow Step Functions to invoke Lambda (Trimming)
resource "aws_iam_role_policy" "step_functions_lambda_policy_trimming" {
  name = "lambda-invocation-trimming"
  role = aws_iam_role.step_functions_role_trimming.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.send_completion_message.arn
        ]
      }
    ]
  })
}

# ========================================
# Outputs
# ========================================

output "lambda_send_message_arn" {
  value       = aws_lambda_function.send_completion_message.arn
  description = "ARN of the Lambda function for sending completion messages"
}

output "lambda_send_message_name" {
  value       = aws_lambda_function.send_completion_message.function_name
  description = "Name of the Lambda function for sending completion messages"
}

