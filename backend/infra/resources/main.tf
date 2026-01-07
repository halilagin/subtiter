terraform {
  required_version = ">= 1.0"
  # Note: backend configuration doesn't support variable interpolation
  # These values should match the defaults in variables.tf
  # Or override using: terraform init -backend-config="bucket=<value>"
  backend "s3" {
    bucket = "subtiter-terraform-state-v2"   # var.terraform_state_bucket
    key    = "default/dev/terraform.tfstate" # var.terraform_state_key
    region = "eu-west-1"                     # var.region
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.region
}