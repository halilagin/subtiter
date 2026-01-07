#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Python module for triggering Subtitercmd video processing on AWS Fargate via Step Functions.

This can be integrated into your FastAPI application to trigger video processing
when a user uploads a video.
"""

import json
import logging
from typing import Optional, Dict, Any
import boto3
from botocore.exceptions import ClientError


logger = logging.getLogger(__name__)


class FargateVideoProcessor:
    """
    Client for triggering video processing on AWS Fargate via Step Functions.
    """

    def __init__(
        self,
        region: str = "eu-west-1",
        state_machine_name: str = "subtiter-video-processing-workflow"
    ):
        """
        Initialize the Fargate video processor client.

        Args:
            region: AWS region where the Step Function is deployed
            state_machine_name: Name of the Step Functions state machine
        """
        self.region = region
        self.state_machine_name = state_machine_name
        self.client = boto3.client('stepfunctions', region_name=region)
        self._state_machine_arn: Optional[str] = None

    def get_state_machine_arn(self) -> str:
        """
        Get the ARN of the Step Functions state machine.

        Returns:
            The ARN of the state machine

        Raises:
            ValueError: If the state machine is not found
        """
        if self._state_machine_arn:
            return self._state_machine_arn

        try:
            response = self.client.list_state_machines()
            for state_machine in response.get('stateMachines', []):
                if state_machine['name'] == self.state_machine_name:
                    self._state_machine_arn = state_machine['stateMachineArn']
                    return self._state_machine_arn

            raise ValueError(
                f"State machine '{self.state_machine_name}' not found in region {self.region}"
            )
        except ClientError as e:
            logger.error(f"Failed to list state machines: {e}")
            raise

    def trigger_processing(
        self,
        user_id: str,
        video_id: str,
        video_warehouse_root_dir: str = "/app/subtiter_warehouse",
        do_db_operation: bool = True,
        send_chat: bool = True,
        mock_process: bool = False,
        execution_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Trigger video processing for a user's video.

        Args:
            user_id: User identifier
            video_id: Video identifier
            video_warehouse_root_dir: Root directory for video storage
            do_db_operation: Enable database operations
            send_chat: Enable chat notifications
            mock_process: Mock processing for testing
            execution_name: Optional custom execution name (auto-generated if not provided)

        Returns:
            Dictionary containing execution details:
            {
                'execution_arn': str,
                'start_date': datetime,
                'user_id': str,
                'video_id': str
            }

        Raises:
            ValueError: If required parameters are missing
            ClientError: If AWS API call fails
        """
        if not user_id or not video_id:
            raise ValueError("user_id and video_id are required")

        # Prepare input data
        input_data = {
            "user_id": user_id,
            "video_id": video_id,
            "video_warehouse_root_dir": video_warehouse_root_dir,
            "do_db_operation": str(do_db_operation).lower(),
            "send_chat": str(send_chat).lower(),
            "mock_process": str(mock_process).lower()
        }

        # Generate execution name if not provided
        if not execution_name:
            execution_name = f"video-{video_id[:8]}-{user_id[:8]}"

        try:
            # Get state machine ARN
            state_machine_arn = self.get_state_machine_arn()

            # Start execution
            logger.info(
                f"Starting video processing for user {user_id}, video {video_id}"
            )
            response = self.client.start_execution(
                stateMachineArn=state_machine_arn,
                name=execution_name,
                input=json.dumps(input_data)
            )

            result = {
                'execution_arn': response['executionArn'],
                'start_date': response['startDate'],
                'user_id': user_id,
                'video_id': video_id
            }

            logger.info(
                f"Video processing started successfully. Execution ARN: {result['execution_arn']}"
            )
            return result

        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'ExecutionAlreadyExists':
                logger.warning(
                    f"Execution with name '{execution_name}' already exists"
                )
                # Try with a timestamped name
                import time
                execution_name = f"{execution_name}-{int(time.time())}"
                return self.trigger_processing(
                    user_id=user_id,
                    video_id=video_id,
                    video_warehouse_root_dir=video_warehouse_root_dir,
                    do_db_operation=do_db_operation,
                    send_chat=send_chat,
                    mock_process=mock_process,
                    execution_name=execution_name
                )
            else:
                logger.error(f"Failed to start execution: {e}")
                raise

    def get_execution_status(self, execution_arn: str) -> Dict[str, Any]:
        """
        Get the status of a video processing execution.

        Args:
            execution_arn: ARN of the execution to check

        Returns:
            Dictionary containing execution status:
            {
                'status': str,  # RUNNING, SUCCEEDED, FAILED, TIMED_OUT, ABORTED
                'start_date': datetime,
                'stop_date': datetime (if finished),
                'input': dict,
                'output': dict (if succeeded),
                'error': str (if failed)
            }

        Raises:
            ClientError: If AWS API call fails
        """
        try:
            response = self.client.describe_execution(executionArn=execution_arn)

            result = {
                'status': response['status'],
                'start_date': response['startDate'],
                'input': json.loads(response['input'])
            }

            if 'stopDate' in response:
                result['stop_date'] = response['stopDate']

            if response['status'] == 'SUCCEEDED' and 'output' in response:
                result['output'] = json.loads(response['output'])

            if response['status'] == 'FAILED':
                result['error'] = response.get('error', 'Unknown error')
                result['cause'] = response.get('cause', 'Unknown cause')

            return result

        except ClientError as e:
            logger.error(f"Failed to describe execution: {e}")
            raise

    def list_recent_executions(
        self,
        max_results: int = 10,
        status_filter: Optional[str] = None
    ) -> list:
        """
        List recent executions of the video processing workflow.

        Args:
            max_results: Maximum number of results to return
            status_filter: Optional status filter (RUNNING, SUCCEEDED, FAILED, etc.)

        Returns:
            List of execution summaries

        Raises:
            ClientError: If AWS API call fails
        """
        try:
            state_machine_arn = self.get_state_machine_arn()

            params = {
                'stateMachineArn': state_machine_arn,
                'maxResults': max_results
            }

            if status_filter:
                params['statusFilter'] = status_filter

            response = self.client.list_executions(**params)
            return response.get('executions', [])

        except ClientError as e:
            logger.error(f"Failed to list executions: {e}")
            raise


# Example usage
if __name__ == "__main__":
    import sys

    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Example: Trigger video processing
    processor = FargateVideoProcessor(region="eu-west-1")

    if len(sys.argv) >= 3:
        user_id = sys.argv[1]
        video_id = sys.argv[2]

        print(f"Triggering video processing for user {user_id}, video {video_id}")

        result = processor.trigger_processing(
            user_id=user_id,
            video_id=video_id
        )

        print(f"\nExecution started successfully!")
        print(f"Execution ARN: {result['execution_arn']}")
        print(f"Start Date: {result['start_date']}")

        # Check status
        print("\nChecking status...")
        status = processor.get_execution_status(result['execution_arn'])
        print(f"Status: {status['status']}")

    else:
        print("Usage: python trigger_fargate.py <user_id> <video_id>")
        print("\nExample:")
        print("  python trigger_fargate.py a285b474-7081-7094-7d0f-a3db04a98629 947ff41e-11d5-4f11-9211-c32f3b3da0c9")

        # List recent executions
        print("\nListing recent executions...")
        executions = processor.list_recent_executions(max_results=5)
        for execution in executions:
            print(f"  - {execution['name']}: {execution['status']} ({execution['startDate']})")

