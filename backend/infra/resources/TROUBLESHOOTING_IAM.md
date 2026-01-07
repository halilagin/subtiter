# Step Functions IAM Troubleshooting

## Common IAM Permission Issues

### Issue 1: CloudWatch Logs Access Denied

**Error Message**:
```
Error: creating Step Functions State Machine (subtiter-video-processing): 
operation error SFN: CreateStateMachine, https response error StatusCode: 400, 
RequestID: ccb3e5f2-372f-4ab9-aa63-42f46392e685, 
api error AccessDeniedException: The state machine IAM Role is not authorized 
to access the Log Destination
```

**Cause**: The Step Functions IAM role lacks permissions to write to CloudWatch Logs.

**Solution**: Add CloudWatch Logs policy to the Step Functions role.

**Required Policy** (already added in `state_machine.tf`):

```hcl
resource "aws_iam_role_policy" "step_functions_logs_policy" {
  name = "cloudwatch-logs-access"
  role = aws_iam_role.step_functions_role.id

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
```

**Apply Fix**:
```bash
cd /Users/halilagin/root/github/subtiter.ai/backend/infra/resources
terraform apply
```

---

### Issue 2: ECS Task Execution Denied

**Error Message**:
```
Error: AccessDeniedException: User is not authorized to perform: ecs:RunTask
```

**Cause**: Step Functions role lacks ECS permissions.

**Solution**: Ensure `step_functions_ecs_policy` includes:

```json
{
  "Effect": "Allow",
  "Action": [
    "ecs:RunTask",
    "ecs:StopTask",
    "ecs:DescribeTasks"
  ],
  "Resource": [
    "arn:aws:ecs:REGION:ACCOUNT:task-definition/subtiter-video-processing:*",
    "arn:aws:ecs:REGION:ACCOUNT:task/subtiter-cluster/*"
  ]
}
```

---

### Issue 3: PassRole Denied

**Error Message**:
```
Error: AccessDeniedException: User is not authorized to perform: iam:PassRole
```

**Cause**: Step Functions cannot pass ECS task roles.

**Solution**: Ensure policy includes:

```json
{
  "Effect": "Allow",
  "Action": ["iam:PassRole"],
  "Resource": [
    "arn:aws:iam::ACCOUNT:role/subtiter-ecs-execution-role",
    "arn:aws:iam::ACCOUNT:role/subtiter-ecs-task-role"
  ]
}
```

---

### Issue 4: S3 Access Denied

**Error Message**:
```
Error: AccessDeniedException: Access Denied (Service: Amazon S3)
```

**Cause**: Step Functions cannot read from S3 (for ReadSegmentCount step).

**Solution**: Ensure policy includes:

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject"
  ],
  "Resource": [
    "arn:aws:s3:::BUCKET-NAME/*"
  ]
}
```

---

## Complete IAM Role Structure

The Step Functions role needs three policies:

### 1. ECS Task Execution Policy
- Run/stop/describe ECS tasks
- Pass IAM roles to ECS
- EventBridge permissions for task synchronization

### 2. CloudWatch Logs Policy
- Create and manage log deliveries
- Write to log groups
- Describe log resources

### 3. S3 Access Policy
- Read configuration files
- Write results (if needed)

---

## Verification Commands

### Check Role Exists
```bash
aws iam get-role --role-name subtiter-step-functions-role
```

### List Attached Policies
```bash
aws iam list-role-policies --role-name subtiter-step-functions-role
```

### Get Specific Policy
```bash
aws iam get-role-policy \
  --role-name subtiter-step-functions-role \
  --policy-name cloudwatch-logs-access
```

### Test State Machine Creation
```bash
cd /Users/halilagin/root/github/subtiter.ai/backend/infra/resources
terraform plan
terraform apply
```

---

## Manual Policy Attachment (Alternative)

If you prefer to attach policies manually via AWS Console:

1. Go to IAM Console: https://console.aws.amazon.com/iam/
2. Navigate to Roles → `subtiter-step-functions-role`
3. Click "Add permissions" → "Create inline policy"
4. Use JSON editor and paste the CloudWatch Logs policy above
5. Name it `cloudwatch-logs-access`
6. Click "Create policy"

---

## AWS CLI Manual Fix

If Terraform fails, you can add the policy manually:

```bash
# Create policy document
cat > /tmp/logs-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogDelivery",
        "logs:GetLogDelivery",
        "logs:UpdateLogDelivery",
        "logs:DeleteLogDelivery",
        "logs:ListLogDeliveries",
        "logs:PutResourcePolicy",
        "logs:DescribeResourcePolicies",
        "logs:DescribeLogGroups"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Attach policy
aws iam put-role-policy \
  --role-name subtiter-step-functions-role \
  --policy-name cloudwatch-logs-access \
  --policy-document file:///tmp/logs-policy.json
```

---

## Debugging IAM Issues

### Enable CloudTrail
To see exactly what permissions are being denied:

1. Go to CloudTrail Console
2. Create a trail (if not exists)
3. Look for `AccessDenied` events
4. Check the error message for specific permission needed

### Use IAM Policy Simulator
1. Go to: https://policysim.aws.amazon.com/
2. Select role: `subtiter-step-functions-role`
3. Select service: Step Functions
4. Select action: CreateStateMachine
5. Run simulation to see what's denied

### Check Service Quotas
```bash
aws service-quotas list-service-quotas \
  --service-code states \
  --region eu-west-1
```

---

## Best Practices

1. **Principle of Least Privilege**: Only grant necessary permissions
2. **Use Resource ARNs**: Specify exact resources when possible
3. **Separate Policies**: Keep ECS, Logs, and S3 policies separate
4. **Version Control**: Always manage IAM via Terraform
5. **Test Incrementally**: Add one policy at a time and test

---

## Related Documentation

- [AWS Step Functions IAM Policies](https://docs.aws.amazon.com/step-functions/latest/dg/procedure-create-iam-role.html)
- [CloudWatch Logs Permissions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/permissions-reference-cwl.html)
- [ECS Task IAM Roles](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)

---

## Quick Fix Summary

**Problem**: CloudWatch Logs access denied

**Solution**: The fix has been applied to `state_machine.tf`

**Next Steps**:
```bash
cd /Users/halilagin/root/github/subtiter.ai/backend/infra/resources
terraform apply
```

The state machine should now deploy successfully with proper CloudWatch Logs permissions.

