dockerhub_build:
	docker build --platform linux/amd64 -t halilagin/klippersai:latest -f Dockerfile.dockerhub .
dockerhub_push:
	docker push halilagin/klippersai:latest

sqlite_clear_docs:
	sqlite3 app.db " \
	DELETE FROM signature_in_pdfs;\
	DELETE FROM signature_fields;\
	DELETE FROM signature_audits;\
	DELETE FROM signing_sessions;\
	DELETE FROM pdf_files;\
	DELETE FROM signers;\
	DELETE FROM documents;"
sqlite_list_tables:
	sqlite3 app.db ".tables"
sqlite_sql:
	sqlite3 app.db "$(SQL)"
psql_reinit:
	python app/init/dbmanager.py reinitialize
psql_seed:
	python app/init/dbmanager.py seed
psql_reinit_docker:
	docker exec klippers-fastapi-app python /app/app/init/dbmanager.py reinitialize
psql_seed_docker:
	docker exec klippers-fastapi-app python /app/app/init/dbmanager.py seed

test_local:
	cp .env.local .env
	pytest
run_server:
	cp .env.local .env
	sh run_server.sh
run_with_docker:
	sh run_docker.sh
pytest_init:
	cp .env.local .env
	docker exec klippers-fastapi-app python app/init/dbmanager.py reinitialize
	docker exec klippers-fastapi-app python app/init/dbmanager.py seed

pytest: pytest_init
	pytest -s

upload_video:
	@curl -X POST "http://localhost:22081/api/v1/videoupload/upload" \
		  -F "file=@app/klipperscmd/podcast01.mp4;type=video/mp4" \
			  -F "user_id=user123"\
				  --no-buffer
upload_video_docker:
	@curl -X POST "http://localhost:23081/api/v1/videoupload/upload" \
		  -F "file=@app/klipperscmd/podcast01.mp4;type=video/mp4" \
			  -F "user_id=user123"\
				  --no-buffer
