#declare github_access_token in secrets.auto.tfvars
#assign the  "ghp_<deleted>" to github_access_token in secrets.auto.tfvars	






variable "region" {
  type        = string
  default     = "eu-west-1"
  description = "AWS Region"
}

variable "terraform_state_bucket" {
  type        = string
  default     = "klippers-terraform-state-v2"
  description = "S3 bucket for Terraform state"
}

variable "terraform_state_key" {
  type        = string
  default     = "default/dev/terraform.tfstate"
  description = "S3 key path for sourceTerraform state"
}


