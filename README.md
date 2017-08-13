# kryptstorm-api
Kryptstorm Microservices System

## DB

`docker run -d --restart always -p 27017:27017 --name kryptstorm_mongo mongo:3`

## Db admin

`docker run -d --restart always -p 8081:8081 --link kryptstorm_mongo:mongo --name kryptstorm_mongo_admin mongo-express`

## Service

`docker run -d --restart always -p 9999:9999 -v $(pwd):/code --link kryptstorm_mongo:kryptstorm_mongo -e MONGO_HOST=kryptstorm_mongo -e MONGO_PORT=27017 -e MONGO_DATABASE=kryptstorm -e PORT=9999 --name kryptstorm_api kryptstorm/node6:latest npm run start-dev`