#!/bin/bash
set -e

# Build and push Docker image to ECR
# Usage: ./build-and-push.sh [region] [aws-account-id]

REGION=${1:-eu-west-1}
AWS_ACCOUNT_ID=${2:-$(kaws_subtiter_cli sts get-caller-identity --query Account --output text)}
ECR_REPOSITORY="subtitercmd"
IMAGE_TAG=${3:-latest}

echo "=== Building and Pushing Subtitercmd Docker Image ==="
echo "Region: $REGION"
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "ECR Repository: $ECR_REPOSITORY"
echo "Image Tag: $IMAGE_TAG"


# Login to ECR
echo "Logging in to ECR..."
kaws_subtiter_cli ecr get-login-password --region $REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

# Build Docker image for ARM64 (Apple Silicon compatible)
echo "Building Docker image for ARM64..."
docker build --platform linux/arm64 -t $ECR_REPOSITORY:$IMAGE_TAG .

# Tag image for ECR
echo "Tagging image..."
docker tag $ECR_REPOSITORY:$IMAGE_TAG ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG

# Push to ECR
echo "Pushing image to ECR..."
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG

echo "=== Build and Push Complete ==="
echo "Image: ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG"

