
# Load environment variables from .env.docker.prod
ifneq (,$(wildcard ../../.env.docker.prod))
    include ../../.env.docker.prod
    export
endif



create_tff_s3_bucket:
	set -a && source ../../.env.docker.prod && set +a && aws s3api create-bucket --bucket subtiter-terraform-state-v2 --region eu-west-1 --create-bucket-configuration LocationConstraint=eu-west-1

cognito_get_user_pool:
	@set -a && source ../../.env.docker.prod && set +a && \
	aws cognito-idp describe-user-pool --user-pool-id eu-west-1_zm3OfnfeQ --region eu-west-1

cognito_get_user_pool_client:
	@set -a && source ../../.env.docker.prod && set +a && \
	aws cognito-idp describe-user-pool-client --user-pool-id eu-west-1_zm3OfnfeQ --client-id 4ucvrbiupts4bs4bdt8mstedsm --region eu-west-1

cognito_get_domain:
	@set -a && source ../../.env.docker.prod && set +a && \
	aws cognito-idp describe-user-pool-domain --domain example-terraform-hosted-ui --region eu-west-1

cognito_list_all_user_pools:
	@set -a && source ../../.env.docker.prod && set +a && \
	aws cognito-idp list-user-pools --max-results 20 --region eu-west-1

cognito_list_users:
	@set -a && source ../../.env.docker.prod && set +a && \
	aws cognito-idp list-users --user-pool-id eu-west-1_zm3OfnfeQ --region eu-west-1

trr_test:
	set -a && source ../../.env.docker.prod && set +a && env |grep -i aws && aws s3 ls

trr_init:
	terraform init -reconfigure

# Build Lambda zip file with dependencies
lambda_build:
	@echo "Building Lambda package..."
	@set -e; \
	LAMBDA_DIR=".lambda_send_message"; \
	ZIP_FILE="lambda_send_message.zip"; \
	MODULE_DIR="$$(pwd)"; \
	rm -rf "$$LAMBDA_DIR" "$$ZIP_FILE"; \
	mkdir -p "$$LAMBDA_DIR"; \
	cp "lambda_send_message.py" "$$LAMBDA_DIR/index.py"; \
	python3 -m pip install --target "$$LAMBDA_DIR" redis --quiet --disable-pip-version-check; \
	cd "$$LAMBDA_DIR"; \
	zip -r "$$MODULE_DIR/$$ZIP_FILE" . -q; \
	cd - > /dev/null; \
	rm -rf "$$LAMBDA_DIR"; \
	echo "✅ Lambda package built: $$ZIP_FILE"

trr_plan: lambda_build
	terraform plan

trr_apply: lambda_build
	terraform apply -auto-approve

trr_destroy:
	terraform destroy

# State Machine Management
state_machine_deploy:
	@echo "Deploying Step Functions state machine..."
	terraform apply -target=aws_iam_role.step_functions_role \
	                -target=aws_iam_role_policy.step_functions_ecs_policy \
	                -target=aws_cloudwatch_log_group.step_functions_logs \
	                -target=aws_sfn_state_machine.video_processing \
	                -auto-approve

state_machine_destroy:
	@echo "Destroying Step Functions state machine..."
	terraform destroy -target=aws_sfn_state_machine.video_processing \
	                  -target=aws_iam_role_policy.step_functions_ecs_policy \
	                  -target=aws_iam_role.step_functions_role \
	                  -target=aws_cloudwatch_log_group.step_functions_logs \
	                  -auto-approve

state_machine_status:
	@echo "Checking state machine status..."
	@aws stepfunctions list-state-machines --query "stateMachines[?name=='subtiter-video-processing']" --region eu-west-1

state_machine_list_executions:
	@echo "Listing recent executions..."
	@STATE_MACHINE_ARN=$$(aws stepfunctions list-state-machines --query "stateMachines[?name=='subtiter-video-processing'].stateMachineArn" --output text --region eu-west-1) && \
	aws stepfunctions list-executions --state-machine-arn $$STATE_MACHINE_ARN --max-results 10 --region eu-west-1

state_machine_run:
	@echo "Running state machine..."
	cd ../../app/subtitercmd && ./run_state_machine.sh

state_machine_logs:
	@echo "Tailing state machine logs..."
	aws logs tail /aws/stepfunctions/subtiter-video-processing --follow --region eu-west-1

fargate_logs:
	@echo "Tailing Fargate task logs..."
	aws logs tail /ecs/subtiter --follow --region eu-west-1

.PHONY: state_machine_deploy state_machine_destroy state_machine_status state_machine_list_executions state_machine_run state_machine_logs fargate_logs