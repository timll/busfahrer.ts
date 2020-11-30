import Server from './Server';

const server = new Server();
server.listen(); // starts the socket.io server
// server.serve(); // serves the static files

export default server;
