# Klippers.ai Backend

FastAPI backend service for Klippers.ai with Ray Serve for distributed computing.

## Quick Start

### Development (Local)

```bash
# Install dependencies
poetry install

# Run the server
poetry run python app/run_ray_serve.py
```

The server will start at `http://localhost:22081`

### Production (Docker)

```bash
# Build and run with docker-compose
./run_docker.sh

# Or manually
docker compose up --build -d
```

**Important:** See [DOCKER_RAY_SETUP.md](./DOCKER_RAY_SETUP.md) for troubleshooting Ray Serve issues in Docker.

## Requirements

- Python >= 3.12, < 3.13
- Poetry for dependency management
- Docker (for containerized deployment)
- At least 4GB RAM for Ray Serve

## Project Structure

```
backend/
├── app/
│   ├── actors/           # Ray actors (e.g., ActorChat)
│   ├── api/              # API routes
│   │   ├── v1/endpoints/ # API v1 endpoints
│   │   └── klippers/     # Klippers-specific endpoints
│   ├── aws_app_stack/    # AWS Cognito integration
│   ├── core/             # Core functionality (auth, security)
│   ├── db/               # Database models and migrations
│   ├── schemas/          # Pydantic schemas
│   ├── service/          # Business logic services
│   └── main.py           # FastAPI app and Ray Serve deployment
├── tests/                # Test suite
├── docker-compose.yml    # Docker compose configuration
├── Dockerfile            # Docker image definition
└── pyproject.toml        # Poetry dependencies
```

## Key Features

- **Ray Serve**: Distributed computing with Ray actors
- **FastAPI**: Modern async web framework
- **AWS Cognito**: Authentication and user management
- **PostgreSQL**: Database for user data
- **WebSocket**: Real-time chat functionality
- **Video Processing**: Klippers video generation pipeline

## Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/klippers

# AWS Cognito
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
COGNITO_REGION=us-east-1

# Auth
SECRET_KEY=your-secret-key
ALGORITHM=HS256

# Application
VIDEO_WAREHOUSE_ROOT_DIR=./app/klippers_warehouse
```

## API Endpoints

- `GET /` - Health check
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/users/me` - Get current user
- `POST /api/v1/chat/message/{roomId}/{clientId}` - Send chat message
- `WS /api/v1/chat/ws/{roomId}/{clientId}` - WebSocket chat connection
- `POST /api/v1/video_upload` - Upload video for processing
- `GET /api/v1/user_videos` - Get user's videos
- `GET /api/v1/user_shorts` - Get user's generated shorts

## Common Issues

### Ray Serve Actor Crashes in Docker

If you see errors like:
```
ray.exceptions.ActorUnavailableError: The actor is unavailable
```

This is due to insufficient shared memory. See [DOCKER_RAY_SETUP.md](./DOCKER_RAY_SETUP.md) for the solution.

**Quick fix:** Make sure you're using `docker-compose.yml` which sets `shm_size: '2gb'`.

### Import Errors

Make sure you're in the correct directory and using Poetry:
```bash
cd backend
poetry install
poetry shell
```

## Testing

```bash
# Run all tests
poetry run pytest

# Run specific test file
poetry run pytest tests/test_auth.py

# Run with coverage
poetry run pytest --cov=app tests/
```

## Development

### Adding Dependencies

```bash
poetry add package-name
```

### Database Migrations

```bash
# Create migration
alembic revision -m "description"

# Apply migrations
alembic upgrade head
```

### Code Style

```bash
# Format code
poetry run black app/

# Lint code
poetry run flake8 app/
```

## Deployment

### Docker

1. Build image:
   ```bash
   docker build -t klippers-backend .
   ```

2. Run container with proper shared memory:
   ```bash
   docker run -d \
     --name klippers-backend \
     --shm-size=2g \
     --cpus=4 \
     --memory=6g \
     -p 22081:22081 \
     klippers-backend
   ```

### Cloud Deployment

See infrastructure configurations in `infra/` directory.

## Monitoring

Ray Dashboard is available at `http://localhost:8265` when running locally.

## License

Proprietary - Klippers.ai

## Support

For issues or questions, contact: halil.agin@gmail.com

