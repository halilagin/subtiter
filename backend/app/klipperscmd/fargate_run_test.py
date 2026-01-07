import os
import json
import boto3

# Variables
REGION = os.environ.get("REGION", "eu-west-1")
CLUSTER_NAME = "klippers-cluster"
TASK_DEFINITION_NAME = "klippers-video-processing"
CONTAINER_NAME = "klipperscmd"

# Colors for output
BLUE = '\033[0;34m'
GREEN = '\033[0;32m'
NC = '\033[0m'

print(f"{BLUE}Running Fargate task remotely...{NC}")

# Initialize boto3 clients
ec2_client = boto3.client("ec2", region_name=REGION)
ecs_client = boto3.client("ecs", region_name=REGION)

# Fetch VPC, Subnets, and Security Group
vpcs = ec2_client.describe_vpcs(Filters=[{'Name': 'isDefault', 'Values': ['true']}])
vpc_id = vpcs['Vpcs'][0]['VpcId']

subnets = ec2_client.describe_subnets(
    Filters=[
        {'Name': 'vpc-id', 'Values': [vpc_id]},
        {'Name': 'map-public-ip-on-launch', 'Values': ['true']}
    ]
)
subnet_ids = [subnet['SubnetId'] for subnet in subnets['Subnets']]

security_groups = ec2_client.describe_security_groups(
    Filters=[{'Name': 'group-name', 'Values': ['klippers-fargate-sg']}]
)
sg_id = security_groups['SecurityGroups'][0]['GroupId']

# Define task input and overrides
TASK_INPUT = {
    "VIDEO_WAREHOUSE_S3_BUCKET_NAME": "697903399510-videos-warehouse",
    "S3_WAREHOUSE_PREFIX": "klippers_warehouse",
    "user_id": "2f4e1723-cda8-430f-b014-466e227e6f8b",
    "video_id": "e95cef80-8dd6-4617-bc3d-2054302d2317",
    "mock_process": "false"
}

# Run the Fargate task
response = ecs_client.run_task(
    cluster=CLUSTER_NAME,
    taskDefinition=TASK_DEFINITION_NAME,
    launchType='FARGATE',
    networkConfiguration={
        'awsvpcConfiguration': {
            'subnets': subnet_ids,
            'securityGroups': [sg_id],
            'assignPublicIp': 'ENABLED'
        }
    },
    overrides={
        'containerOverrides': [
            {
                'name': CONTAINER_NAME,
                'environment': [
                    {
                        'name': 'TASK_INPUT',
                        'value': json.dumps(TASK_INPUT)
                    },
                ],
            },
        ],
    },
)

task_arn = response['tasks'][0]['taskArn']

print(f"{GREEN}Fargate task started!{NC}")
print("\nTo check the status of the specific task, run the following command:")
print(f"aws ecs describe-tasks --cluster {CLUSTER_NAME} --tasks {task_arn} --region {REGION}")

print("\nTo list all recent tasks on the cluster, run:")
print(f"aws ecs list-tasks --cluster {CLUSTER_NAME} --region {REGION}")
