

dup_build: 
	docker compose up -d --build 

dup:
	cp backend/.env.docker backend/.env && \
	docker compose up -d 
down:
	docker compose down
psql_reinit_docker:
	docker exec subtiter-fastapi-app python app/init/dbmanager.py reinitialize
psql_seed_docker:
	docker exec subtiter-fastapi-app python app/init/dbmanager.py seed
psql_reinit:
	cd backend && uv run python app/init/dbmanager.py reinitialize
psql_seed:
	cd backend && uv run python app/init/dbmanager.py seed
generate_promotion_codes:
	cd backend && uv run python app/init/dbmanager.py generate-promotion-codes
sql:
	docker exec subtiter-fastapi-app python app/init/dbmanager.py sql "${SQL}"

prod_psql_reinit:
	cd backend && uv run python app/init/dbmanager.py reinitialize
prod_psql_seed:
	cd backend && uv run python app/init/dbmanager.py seed
prod_generate_promotion_codes:
	cd backend && uv run python app/init/dbmanager.py generate-promotion-codes
prod_dup: prod_deploy
	docker compose  -f docker-compose-prod.yaml up -d 
prod_dup_build: prod_deploy
	docker compose  -f docker-compose-prod.yaml up -d --build 
prod_down:
	docker compose -f docker-compose-prod.yaml down
prod_sql:
	docker exec -f docker-compose-prod.yaml  subtiter-fastapi-app python app/init/dbmanager.py sql "${SQL}"
prod_deploy:
	cp backend/.env.prod backend/.env && \
	cp frontend/src/AppConfigDockerProd.ts frontend/src/AppConfigDocker.ts

