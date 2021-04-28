import createError from "http-errors";
import express, { ErrorRequestHandler } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { getParam } from "./middle/getParam";
import { setupMysql } from "./tools/mysql";
import { setupRedis } from "./tools/redis";
import { apiIndex } from "./routes/api";
import { expressLog } from "./util/chalk";
import indexRouter from './routes'

declare module 'express-serve-static-core' {
  interface Request {
    start: Date
  }
}

const app = express();
app.use((req, res, next) => {
  if (req.path !== '/' && !req.path.includes('.')) {
    res.set({
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
      'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
    })
  }
  req.method === 'OPTIONS' ? res.status(204).end() : next()
})
app.use(setupRedis)
app.use(setupMysql)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  req.body = Object.assign({}, req.query, req.body, { user: 1 })
  expressLog(req.url)
  next()
})
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(getParam)
app.use((req, res, next) => {
  req.start = new Date()
  next()
})
app.use('/', indexRouter);
apiIndex(app, __dirname)
// app.use('/api', usersRouter);
app.use((req, res, next) => next(createError(404)));

const errorHandle: ErrorRequestHandler = (err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
}
app.use(errorHandle);
export default app;
