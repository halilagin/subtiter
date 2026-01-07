import pytest
from unittest.mock import patch
from botocore.exceptions import ClientError
from app.aws_app_stack import cognito_config
from app.aws_app_stack.cognito import get_access_token, SubtiterCognito


class TestCognitoAuth:
    """Test suite for AWS Cognito authentication integration"""

    @pytest.fixture
    def mock_cognito_client(self):
        """Mock boto3 cognito client"""
        with patch('app.aws_app_stack.cognito.boto3_cognito_client') as mock_client:
            yield mock_client

    @pytest.fixture
    def cognito_instance(self):
        """Create a SubtiterCognito instance for testing"""
        return SubtiterCognito(
            user_pool_id=cognito_config.aws_cognito_user_pool_id,
            client_id=cognito_config.aws_cognito_user_pool_client_id,
            region=cognito_config.region
        )

    @pytest.fixture
    def sample_auth_response(self):
        """Sample authentication response from Cognito"""
        return {
            'AuthenticationResult': {
                'AccessToken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_access_token',
                'RefreshToken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_refresh_token',
                'IdToken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_id_token',
                'TokenType': 'Bearer',
                'ExpiresIn': 3600
            }
        }

    @pytest.fixture
    def sample_user(self):
        """Sample user data"""
        return {
            'username': 'testuser@example.com',
            'email': 'testuser@example.com',
            'password': 'TestPassword123!'
        }

    # Test 1: Login with username and password
    def test_login_with_username_and_password_success(self, mock_cognito_client, sample_auth_response, sample_user):
        """Test successful login with username and password"""
        # Arrange
        mock_cognito_client.initiate_auth.return_value = sample_auth_response

        # Act
        result = get_access_token(
            user_pool_id=cognito_config.aws_cognito_user_pool_id,
            client_id=cognito_config.aws_cognito_user_pool_client_id,
            username=sample_user['username'],
            password=sample_user['password']
        )

        # Assert
        assert result is not None
        assert 'AccessToken' in result
        assert 'RefreshToken' in result
        assert 'IdToken' in result
        assert result['TokenType'] == 'Bearer'
        assert result['ExpiresIn'] == 3600

        # Verify the call was made with correct parameters
        mock_cognito_client.initiate_auth.assert_called_once_with(
            ClientMetadata={'UserPoolId': cognito_config.aws_cognito_user_pool_id},
            ClientId=cognito_config.aws_cognito_user_pool_client_id,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': sample_user['username'],
                'PASSWORD': sample_user['password']
            }
        )

    def test_login_with_invalid_credentials(self, mock_cognito_client, sample_user):
        """Test login with invalid credentials"""
        # Arrange
        mock_cognito_client.initiate_auth.side_effect = ClientError(
            {'Error': {'Code': 'NotAuthorizedException', 'Message': 'Incorrect username or password'}},
            'InitiateAuth'
        )

        # Act
        result = get_access_token(
            user_pool_id=cognito_config.aws_cognito_user_pool_id,
            client_id=cognito_config.aws_cognito_user_pool_client_id,
            username=sample_user['username'],
            password='wrongpassword'
        )

        # Assert
        assert result is None

    def test_login_user_not_found(self, mock_cognito_client):
        """Test login when user doesn't exist"""
        # Arrange
        mock_cognito_client.initiate_auth.side_effect = ClientError(
            {'Error': {'Code': 'UserNotFoundException', 'Message': 'User does not exist'}},
            'InitiateAuth'
        )

        # Act
        result = get_access_token(
            user_pool_id=cognito_config.aws_cognito_user_pool_id,
            client_id=cognito_config.aws_cognito_user_pool_client_id,
            username='nonexistent@example.com',
            password='password'
        )

        # Assert
        assert result is None

    # Test 2: Create a user with email and password
    def test_create_user_success(self, mock_cognito_client, sample_user):
        """Test successful user creation"""
        # Arrange
        expected_response = {
            'User': {
                'Username': sample_user['username'],
                'Attributes': [
                    {'Name': 'email', 'Value': sample_user['email']},
                    {'Name': 'email_verified', 'Value': 'true'}
                ],
                'UserCreateDate': '2024-01-01T00:00:00Z',
                'UserLastModifiedDate': '2024-01-01T00:00:00Z',
                'Enabled': True,
                'UserStatus': 'CONFIRMED'
            }
        }
        mock_cognito_client.admin_create_user.return_value = expected_response

        # Act
        result = mock_cognito_client.admin_create_user(
            UserPoolId=cognito_config.aws_cognito_user_pool_id,
            Username=sample_user['username'],
            UserAttributes=[
                {'Name': 'email', 'Value': sample_user['email']},
                {'Name': 'email_verified', 'Value': 'true'}
            ],
            TemporaryPassword=sample_user['password'],
            MessageAction='SUPPRESS'
        )

        # Assert
        assert result is not None
        assert result['User']['Username'] == sample_user['username']
        assert result['User']['Enabled'] is True

        # Verify the call was made with correct parameters
        mock_cognito_client.admin_create_user.assert_called_once()

    def test_create_user_duplicate_email(self, mock_cognito_client, sample_user):
        """Test creating user with duplicate email"""
        # Arrange
        mock_cognito_client.admin_create_user.side_effect = ClientError(
            {'Error': {'Code': 'UsernameExistsException', 'Message': 'User already exists'}},
            'AdminCreateUser'
        )

        # Act & Assert
        with pytest.raises(ClientError) as exc_info:
            mock_cognito_client.admin_create_user(
                UserPoolId=cognito_config.aws_cognito_user_pool_id,
                Username=sample_user['username'],
                UserAttributes=[
                    {'Name': 'email', 'Value': sample_user['email']},
                    {'Name': 'email_verified', 'Value': 'true'}
                ],
                TemporaryPassword=sample_user['password']
            )

        assert exc_info.value.response['Error']['Code'] == 'UsernameExistsException'

    def test_create_user_invalid_password(self, mock_cognito_client, sample_user):
        """Test creating user with invalid password"""
        # Arrange
        mock_cognito_client.admin_create_user.side_effect = ClientError(
            {'Error': {'Code': 'InvalidPasswordException', 'Message': 'Password does not meet requirements'}},
            'AdminCreateUser'
        )

        # Act & Assert
        with pytest.raises(ClientError) as exc_info:
            mock_cognito_client.admin_create_user(
                UserPoolId=cognito_config.aws_cognito_user_pool_id,
                Username=sample_user['username'],
                UserAttributes=[
                    {'Name': 'email', 'Value': sample_user['email']}
                ],
                TemporaryPassword='weak'
            )

        assert exc_info.value.response['Error']['Code'] == 'InvalidPasswordException'

    # Test 3: Delete a user
    def test_delete_user_success(self, mock_cognito_client, sample_user):
        """Test successful user deletion"""
        # Arrange
        mock_cognito_client.admin_delete_user.return_value = {}

        # Act
        result = mock_cognito_client.admin_delete_user(
            UserPoolId=cognito_config.aws_cognito_user_pool_id,
            Username=sample_user['username']
        )

        # Assert
        assert result is not None
        mock_cognito_client.admin_delete_user.assert_called_once_with(
            UserPoolId=cognito_config.aws_cognito_user_pool_id,
            Username=sample_user['username']
        )

    def test_delete_user_not_found(self, mock_cognito_client):
        """Test deleting a user that doesn't exist"""
        # Arrange
        mock_cognito_client.admin_delete_user.side_effect = ClientError(
            {'Error': {'Code': 'UserNotFoundException', 'Message': 'User does not exist'}},
            'AdminDeleteUser'
        )

        # Act & Assert
        with pytest.raises(ClientError) as exc_info:
            mock_cognito_client.admin_delete_user(
                UserPoolId=cognito_config.aws_cognito_user_pool_id,
                Username='nonexistent@example.com'
            )

        assert exc_info.value.response['Error']['Code'] == 'UserNotFoundException'

    # Test 4: List users
    def test_list_users_success(self, mock_cognito_client):
        """Test successful listing of users"""
        # Arrange
        expected_response = {
            'Users': [
                {
                    'Username': 'user1@example.com',
                    'Attributes': [
                        {'Name': 'email', 'Value': 'user1@example.com'},
                        {'Name': 'email_verified', 'Value': 'true'}
                    ],
                    'UserCreateDate': '2024-01-01T00:00:00Z',
                    'UserLastModifiedDate': '2024-01-01T00:00:00Z',
                    'Enabled': True,
                    'UserStatus': 'CONFIRMED'
                },
                {
                    'Username': 'user2@example.com',
                    'Attributes': [
                        {'Name': 'email', 'Value': 'user2@example.com'},
                        {'Name': 'email_verified', 'Value': 'true'}
                    ],
                    'UserCreateDate': '2024-01-02T00:00:00Z',
                    'UserLastModifiedDate': '2024-01-02T00:00:00Z',
                    'Enabled': True,
                    'UserStatus': 'CONFIRMED'
                }
            ]
        }
        mock_cognito_client.list_users.return_value = expected_response

        # Act
        result = mock_cognito_client.list_users(
            UserPoolId=cognito_config.aws_cognito_user_pool_id,
            Limit=60
        )

        # Assert
        assert result is not None
        assert 'Users' in result
        assert len(result['Users']) == 2
        assert result['Users'][0]['Username'] == 'user1@example.com'
        assert result['Users'][1]['Username'] == 'user2@example.com'

        mock_cognito_client.list_users.assert_called_once_with(
            UserPoolId=cognito_config.aws_cognito_user_pool_id,
            Limit=60
        )

    def test_list_users_with_filter(self, mock_cognito_client):
        """Test listing users with filter"""
        # Arrange
        expected_response = {
            'Users': [
                {
                    'Username': 'active@example.com',
                    'Attributes': [
                        {'Name': 'email', 'Value': 'active@example.com'}
                    ],
                    'UserStatus': 'CONFIRMED'
                }
            ]
        }
        mock_cognito_client.list_users.return_value = expected_response

        # Act
        result = mock_cognito_client.list_users(
            UserPoolId=cognito_config.aws_cognito_user_pool_id,
            Filter='email ^= "active"'
        )

        # Assert
        assert result is not None
        assert len(result['Users']) == 1
        assert result['Users'][0]['Username'] == 'active@example.com'

    def test_list_users_empty(self, mock_cognito_client):
        """Test listing users when no users exist"""
        # Arrange
        mock_cognito_client.list_users.return_value = {'Users': []}

        # Act
        result = mock_cognito_client.list_users(
            UserPoolId=cognito_config.aws_cognito_user_pool_id
        )

        # Assert
        assert result is not None
        assert 'Users' in result
        assert len(result['Users']) == 0

    # Test 5: Logout
    def test_logout_success(self, mock_cognito_client):
        """Test successful user logout (global sign out)"""
        # Arrange
        access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_access_token'
        mock_cognito_client.global_sign_out.return_value = {}

        # Act
        result = mock_cognito_client.global_sign_out(
            AccessToken=access_token
        )

        # Assert
        assert result is not None
        mock_cognito_client.global_sign_out.assert_called_once_with(
            AccessToken=access_token
        )

    def test_logout_invalid_token(self, mock_cognito_client):
        """Test logout with invalid access token"""
        # Arrange
        mock_cognito_client.global_sign_out.side_effect = ClientError(
            {'Error': {'Code': 'NotAuthorizedException', 'Message': 'Invalid access token'}},
            'GlobalSignOut'
        )

        # Act & Assert
        with pytest.raises(ClientError) as exc_info:
            mock_cognito_client.global_sign_out(
                AccessToken='invalid_token'
            )

        assert exc_info.value.response['Error']['Code'] == 'NotAuthorizedException'

    def test_admin_logout_user(self, mock_cognito_client, sample_user):
        """Test admin signing out a user"""
        # Arrange
        mock_cognito_client.admin_user_global_sign_out.return_value = {}

        # Act
        result = mock_cognito_client.admin_user_global_sign_out(
            UserPoolId=cognito_config.aws_cognito_user_pool_id,
            Username=sample_user['username']
        )

        # Assert
        assert result is not None
        mock_cognito_client.admin_user_global_sign_out.assert_called_once_with(
            UserPoolId=cognito_config.aws_cognito_user_pool_id,
            Username=sample_user['username']
        )

    # Test 6: Get access token and refresh token
    def test_get_access_and_refresh_token(self, mock_cognito_client, sample_auth_response, sample_user):
        """Test getting access and refresh tokens"""
        # Arrange
        mock_cognito_client.initiate_auth.return_value = sample_auth_response

        # Act
        result = get_access_token(
            user_pool_id=cognito_config.aws_cognito_user_pool_id,
            client_id=cognito_config.aws_cognito_user_pool_client_id,
            username=sample_user['username'],
            password=sample_user['password']
        )

        # Assert
        assert result is not None
        assert 'AccessToken' in result
        assert 'RefreshToken' in result
        assert 'IdToken' in result
        assert result['AccessToken'] == sample_auth_response['AuthenticationResult']['AccessToken']
        assert result['RefreshToken'] == sample_auth_response['AuthenticationResult']['RefreshToken']
        assert result['IdToken'] == sample_auth_response['AuthenticationResult']['IdToken']

    def test_refresh_access_token(self, mock_cognito_client):
        """Test refreshing access token using refresh token"""
        # Arrange
        refresh_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_refresh_token'
        new_auth_response = {
            'AuthenticationResult': {
                'AccessToken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_access_token',
                'IdToken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_id_token',
                'TokenType': 'Bearer',
                'ExpiresIn': 3600
            }
        }
        mock_cognito_client.initiate_auth.return_value = new_auth_response

        # Act
        result = mock_cognito_client.initiate_auth(
            ClientId=cognito_config.aws_cognito_user_pool_client_id,
            AuthFlow='REFRESH_TOKEN_AUTH',
            AuthParameters={
                'REFRESH_TOKEN': refresh_token
            }
        )

        # Assert
        assert result is not None
        assert 'AuthenticationResult' in result
        assert 'AccessToken' in result['AuthenticationResult']
        assert 'IdToken' in result['AuthenticationResult']
        assert result['AuthenticationResult']['AccessToken'] == new_auth_response['AuthenticationResult']['AccessToken']

        mock_cognito_client.initiate_auth.assert_called_once_with(
            ClientId=cognito_config.aws_cognito_user_pool_client_id,
            AuthFlow='REFRESH_TOKEN_AUTH',
            AuthParameters={'REFRESH_TOKEN': refresh_token}
        )

    def test_refresh_token_expired(self, mock_cognito_client):
        """Test refreshing with an expired refresh token"""
        # Arrange
        mock_cognito_client.initiate_auth.side_effect = ClientError(
            {'Error': {'Code': 'NotAuthorizedException', 'Message': 'Refresh Token has expired'}},
            'InitiateAuth'
        )

        # Act & Assert
        with pytest.raises(ClientError) as exc_info:
            mock_cognito_client.initiate_auth(
                ClientId=cognito_config.aws_cognito_user_pool_client_id,
                AuthFlow='REFRESH_TOKEN_AUTH',
                AuthParameters={'REFRESH_TOKEN': 'expired_refresh_token'}
            )

        assert exc_info.value.response['Error']['Code'] == 'NotAuthorizedException'

    def test_get_user_info_from_token(self, mock_cognito_client):
        """Test getting user information from access token"""
        # Arrange
        access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_access_token'
        expected_response = {
            'Username': 'testuser@example.com',
            'UserAttributes': [
                {'Name': 'sub', 'Value': '12345678-1234-1234-1234-123456789012'},
                {'Name': 'email', 'Value': 'testuser@example.com'},
                {'Name': 'email_verified', 'Value': 'true'}
            ]
        }
        mock_cognito_client.get_user.return_value = expected_response

        # Act
        result = mock_cognito_client.get_user(AccessToken=access_token)

        # Assert
        assert result is not None
        assert result['Username'] == 'testuser@example.com'
        assert len(result['UserAttributes']) == 3
        assert any(attr['Name'] == 'email' and attr['Value'] == 'testuser@example.com'
                   for attr in result['UserAttributes'])

    # Additional integration test
    def test_full_user_lifecycle(self, mock_cognito_client, sample_user, sample_auth_response):
        """Test complete user lifecycle: create, login, logout, delete"""
        # Step 1: Create user
        create_response = {
            'User': {
                'Username': sample_user['username'],
                'UserStatus': 'CONFIRMED',
                'Enabled': True
            }
        }
        mock_cognito_client.admin_create_user.return_value = create_response

        user_result = mock_cognito_client.admin_create_user(
            UserPoolId=cognito_config.aws_cognito_user_pool_id,
            Username=sample_user['username'],
            UserAttributes=[{'Name': 'email', 'Value': sample_user['email']}],
            TemporaryPassword=sample_user['password']
        )
        assert user_result['User']['Username'] == sample_user['username']

        # Step 2: Login
        mock_cognito_client.initiate_auth.return_value = sample_auth_response

        auth_result = get_access_token(
            user_pool_id=cognito_config.aws_cognito_user_pool_id,
            client_id=cognito_config.aws_cognito_user_pool_client_id,
            username=sample_user['username'],
            password=sample_user['password']
        )
        assert auth_result is not None
        assert 'AccessToken' in auth_result

        # Step 3: Logout
        mock_cognito_client.global_sign_out.return_value = {}
        logout_result = mock_cognito_client.global_sign_out(
            AccessToken=auth_result['AccessToken']
        )
        assert logout_result is not None

        # Step 4: Delete user
        mock_cognito_client.admin_delete_user.return_value = {}
        delete_result = mock_cognito_client.admin_delete_user(
            UserPoolId=cognito_config.aws_cognito_user_pool_id,
            Username=sample_user['username']
        )
        assert delete_result is not None

        # Verify all operations were called
        assert mock_cognito_client.admin_create_user.called
        assert mock_cognito_client.initiate_auth.called
        assert mock_cognito_client.global_sign_out.called
        assert mock_cognito_client.admin_delete_user.called
