# start containers in docker-compose file and create network
docker-compose -f docker-compose.yaml up

# stop all containers and remove network
docker-compose -f docker-compose.yaml down