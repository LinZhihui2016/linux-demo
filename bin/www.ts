import app from "../app";
import debug0 from "debug";
import http from "http";

const normalizePort = (val: string) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};
const debug = debug0('linux-demo:server');
/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + (addr && addr.port);
  debug('Listening on ' + bind);
};

server.listen(port);
server.on('listening', onListening);

