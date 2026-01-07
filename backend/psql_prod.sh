export PGPASSWORD=subtiter_qazwsxqazwsx
psql -h localhost -p 25432 -U subtiteruser -d subtiter_prod $@
