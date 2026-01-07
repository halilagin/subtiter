# ========================================
# Minimal Subtitercmd Video Processing Fargate Setup
# ========================================
# Uses default VPC to minimize infrastructure overhead
# ========================================

# Data source to get AWS account ID
data "aws_caller_identity" "current" {}

# Data source to get default VPC
data "aws_vpc" "default" {
  default = true
}

# Data source to get default subnets
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security Group for Fargate Task (minimal - only outbound traffic)
resource "aws_security_group" "subtiter_fargate_sg" {
  name        = "subtiter-fargate-sg"
  description = "Security group for Subtiter Fargate tasks"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "subtiter-fargate-sg"
  }
}

# ========================================
# IAM Roles (Minimal Setup)
# ========================================

# ECS Task Execution Role (for pulling images, logging)
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "subtiter-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Role (for S3 access during video processing)
resource "aws_iam_role" "ecs_task_role" {
  name = "subtiter-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

# S3 access for video warehouse
resource "aws_iam_role_policy" "ecs_task_s3_policy" {
  name = "s3-access"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:*"
      ]
      Resource = [
        "${aws_s3_bucket.videos_warehouse.arn}/*",
        aws_s3_bucket.videos_warehouse.arn
      ]
    }]
  })
}

# ========================================
# S3 Bucket for Video Warehouse
# ========================================

resource "aws_s3_bucket" "videos_warehouse" {
  bucket = "${data.aws_caller_identity.current.account_id}-videos-warehouse"

  tags = {
    Name = "videos-warehouse"
  }
}

resource "aws_s3_bucket_versioning" "videos_warehouse" {
  bucket = aws_s3_bucket.videos_warehouse.id

  versioning_configuration {
    status = "Disabled"
  }
}


resource "aws_s3_bucket_public_access_block" "videos_warehouse" {
  bucket = aws_s3_bucket.videos_warehouse.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ========================================
# CloudWatch Logs
# ========================================

resource "aws_cloudwatch_log_group" "subtiter_logs" {
  name              = "/ecs/subtiter"
  retention_in_days = 3 # Minimal retention to reduce costs
}

# ========================================
# ECS Cluster (Minimal)
# ========================================

resource "aws_ecs_cluster" "subtiter" {
  name = "subtiter-cluster"
}

# ========================================
# ECR Repository
# ========================================

resource "aws_ecr_repository" "subtitercmd" {
  name                 = "subtitercmd"
  image_tag_mutability = "MUTABLE"
}

# ========================================
# ECS Task Definition
# ========================================

resource "aws_ecs_task_definition" "subtiter_task" {
  family                   = "subtiter-video-processing"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "8192"  # 8 vCPU
  memory                   = "32768" # 32 GB
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  # Specify ARM64 architecture (supports images built on Apple Silicon)
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([{
    name      = "subtitercmd"
    image     = "${aws_ecr_repository.subtitercmd.repository_url}:latest"
    essential = true

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.subtiter_logs.name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = "task"
      }
    }
  }])
}

# ========================================
# Outputs
# ========================================

output "cluster_name" {
  value = aws_ecs_cluster.subtiter.name
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.subtiter_task.arn
}

output "ecr_repository_url" {
  value = aws_ecr_repository.subtitercmd.repository_url
}

output "security_group_id" {
  value = aws_security_group.subtiter_fargate_sg.id
}

output "subnet_ids" {
  value = data.aws_subnets.default.ids
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.videos_warehouse.id
  description = "Name of the S3 bucket for video warehouse"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.videos_warehouse.arn
  description = "ARN of the S3 bucket for video warehouse"
}
