import app from "../app";
import debug0 from "debug";
import http from "http";
import { logInit } from "../tools/log4js/log";

const normalizePort = (val: string) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};
const onListening = () => {
  logInit()
  const addr = server.address();
  const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + (addr && addr.port);
  debug('Listening on ' + bind);
  console.log('Listening on ' + bind)
};
const debug = debug0('linux-demo:server');
const port = normalizePort(process.env.PORT || '8808');
const server = http.createServer(app);

app.set('port', port);
server.listen(port);
server.on('listening', onListening);

