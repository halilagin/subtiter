export PGPASSWORD=klippers_qazwsxqazwsx
psql -h localhost -p 25432 -U klippersuser -d klippers_prod $@
