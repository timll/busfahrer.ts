# Busfahrer

Implementation of the card & drinking game "Busfahrer" as a multiplayer browser game.

## Backend

Written in typescript using socket.io and express.

### Installation
```
npm i
npm build
```

Set env var PORT to your desired port and put the app behind a reverse proxy. Default port is 3013.

### Known pitfalls
* Room ID is not checked against all rooms, there is a extremly small chance that a room id is assigned twice.

## Frontend

Written in typescript using react.

### Installation
```
npm i
npm build
```
