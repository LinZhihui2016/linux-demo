import createError from "http-errors";
import express, { ErrorRequestHandler } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import indexRouter from "./routes";
import usersRouter from "./routes/users";

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  let ipStr =
      req.ip ||
      req.socket.remoteAddress
  const ipReg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  if (ipStr && ipStr.split(',').length > 0) {
    ipStr = ipStr.split(',')[0]
    const ip = ipReg.exec(ipStr);
    console.log(ip)
  }
  next()
})
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use((req, res, next) => next(createError(404)));

const errorHandle: ErrorRequestHandler = (err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
}
app.use(errorHandle);
export default app;
