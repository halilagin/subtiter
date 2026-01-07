cp .env.local .env
#uvicorn app.main:app --host localhost --port 22081 


python app/run_ray_serve.py --host 0.0.0.0 --port 22081
