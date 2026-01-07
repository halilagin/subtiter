aws_cognito_user_pool_id = "eu-west-1_SSTwtAKDt"  # New pool with UsernameAttributes=['email']
aws_cognito_user_pool_name = "klippers-user-pool-v2"
region = "eu-west-1"
aws_cognito_user_pool_client_id = "hi8m15u1m02ibeiqroibf3n0i"
aws_cognito_user_pool_client_name = "klippers-client"
aws_cognito_user_pool_domain = "example-terraform-hosted-ui"
callback_urls = ["https://klippers.ai/auth-provider/callback"]
logout_urls = ["https://klippers.ai/auth-provider/logout"]
oauth_flows = ["implicit"]
oauth_scopes = ["aws.cognito.signin.user.admin", "email", "openid", "phone", "profile"]
aws_cognito_user_example_username = "halilagin"
aws_cognito_user_example_password = "YourTempPassword2024!!"

