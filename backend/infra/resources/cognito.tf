resource "aws_cognito_user_pool" "subtiter" {
  name = "subtiter-user-pool"

  #alias_attributes = ["email"]

  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  # Custom email verification template with clickable link
  # Note: We use CONFIRM_WITH_CODE because CONFIRM_WITH_LINK redirects to Cognito's hosted UI
  # We'll build our own custom link using the code placeholder
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Welcome to Subtiter.ai - Verify Your Email"
    email_message        = <<-EOT
Welcome to Subtiter.ai!

Thank you for signing up. To complete your registration, please verify your email address.

Click the link below or copy and paste it into your browser:
https://subtiter.ai/api/v1/auth/confirm-signup/{username}/{####}

Your verification code is: {####}

This code will expire in 24 hours.

If you didn't create an account with Subtiter.ai, you can safely ignore this email.

Best regards,
The Subtiter.ai Team
    EOT
  }

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = false
    string_attribute_constraints {
      min_length = 1
      max_length = 2048
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "subscription_plan"
    required            = false
    mutable             = true
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "user_id"
    required            = false
    mutable             = false
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "custom:data"
    required            = false
    mutable             = true
    string_attribute_constraints {
      min_length = 1
      max_length = 2048
    }
  }

}




# Facebook Identity Provider
resource "aws_cognito_identity_provider" "facebook" {
  user_pool_id  = aws_cognito_user_pool.subtiter.id
  provider_name = "Facebook"
  provider_type = "Facebook"

  provider_details = {
    authorize_scopes = "public_profile,email"
    client_id        = var.facebook_oauth_app_id
    client_secret    = var.facebook_oauth_app_secret
  }

  attribute_mapping = {
    email    = "email"
    username = "id"
    name     = "name"
  }
}


resource "aws_cognito_user_pool_client" "subtiter_pool_client" {
  name         = "subtiter-client"
  user_pool_id = aws_cognito_user_pool.subtiter.id

  access_token_validity = 1440 # Access token validity in minutes

  prevent_user_existence_errors = "ENABLED"

  #generate_secret = true

  # Identity providers - support Cognito, Google, and Facebook
  supported_identity_providers = ["COGNITO", "Facebook"]

  # Depends on the identity providers being created first
  depends_on = [
    aws_cognito_identity_provider.facebook
  ]


  token_validity_units {
    access_token = "minutes"
  }

  explicit_auth_flows = ["ALLOW_CUSTOM_AUTH", "ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_PASSWORD_AUTH", "ALLOW_ADMIN_USER_PASSWORD_AUTH"]

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]

  # Callback URLs for OAuth - support both local development and production
  callback_urls = [
    "https://subtiter.ai/auth-provider/callback",
    "http://localhost:22081/auth-provider/callback",
    "https://subtiter.ai/api/v1/auth/google/callback",
    "http://localhost:8000/api/v1/auth/google/callback",
    "https://subtiter.ai/api/v1/auth/facebook/callback",
    "http://localhost:8000/api/v1/auth/facebook/callback"
  ]

  logout_urls = [
    "https://subtiter.ai/logout",
    "http://localhost:22081/logout",
    "http://localhost:23081/logout"
  ]

}


resource "aws_cognito_user_pool_domain" "main" {
  domain       = "example-terraform-hosted-ui"
  user_pool_id = aws_cognito_user_pool.subtiter.id

}



resource "aws_cognito_user" "example_user" {
  user_pool_id = aws_cognito_user_pool.subtiter.id
  username     = "halilagin"

  # Set initial temporary password for the user (use sensitive data management practices)
  #temporary_password = "YourTempPassword2024!!"
  password = "YourTempPassword2025!!"

  # Optional: User attributes
  attributes = {
    name           = "Halil Agin"
    email          = "halil.agin@gmail.com"
    email_verified = true
  }

  # Specify whether the email address is marked as verified
  force_alias_creation = false
  message_action       = "SUPPRESS" # Suppresses the sending of any initial emails

  # Optional: User status can be specified (e.g., "CONFIRMED" to bypass email verification)
  #user_status = "CONFIRMED"

}


# Variables for Google OAuth credentials




# Variables for Facebook OAuth credentials
variable "facebook_oauth_app_id" {
  description = "Facebook OAuth App ID"
  type        = string
  sensitive   = true
}

variable "facebook_oauth_app_secret" {
  description = "Facebook OAuth App Secret"
  type        = string
  sensitive   = true
}

# Outputs
output "user_pool_id" {
  value = aws_cognito_user_pool.subtiter.id
}

output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.subtiter_pool_client.id
}

output "cognito_domain" {
  value = aws_cognito_user_pool_domain.main.domain
}

output "google_oauth_url" {
  value = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.name}.amazoncognito.com/oauth2/authorize?client_id=${aws_cognito_user_pool_client.subtiter_pool_client.id}&response_type=code&scope=email+openid+profile&redirect_uri=https://subtiter.ai/auth-provider/callback&identity_provider=Google"
}

output "facebook_oauth_url" {
  value = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.name}.amazoncognito.com/oauth2/authorize?client_id=${aws_cognito_user_pool_client.subtiter_pool_client.id}&response_type=code&scope=email+openid+profile&redirect_uri=https://subtiter.ai/auth-provider/callback&identity_provider=Facebook"
}

# Data source to get current region
data "aws_region" "current" {}
