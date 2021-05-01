import log4js from 'log4js'
import { Type } from "../../type";
import { expressChalk } from "../../util/chalk";

export const logInit = () =>
    log4js.configure({
      appenders: {
        api: { type: "file", filename: 'log/api.log' },
        script: { type: 'dateFile', filename: 'log/script.log' },
        error: { type: 'dateFile', filename: 'log/error.log' },
        mysql: { type: 'dateFile', filename: 'log/mysql.log' },
        redis: { type: 'dateFile', filename: 'log/redis.log' },
        lock: { type: 'file', filename: 'log/lock.log' }
      },
      categories: {
        api: { appenders: ['api'], level: 'info' },
        script: { appenders: ['script'], level: 'info' },
        lock: { appenders: ['lock'], level: 'info' },
        error: { appenders: ['error'], level: 'error' },
        redis: { appenders: ['redis', 'error'], level: 'error' },
        mysql: { appenders: ['mysql', 'error'], level: 'error' },
        default: { appenders: ['error'], level: 'error' }
      }
    })

const infoHelper = (categories: 'api' | 'script' | 'mysql' | 'redis' | 'error' | 'lock', msg: Type.Obj<any> | string) =>
    log4js.getLogger(categories).info(JSON.stringify(msg))
const errorHelper = (categories: 'api' | 'script' | 'mysql' | 'redis' | 'error' | 'lock', msg: Type.Obj<any> | string) =>
    log4js.getLogger(categories).error(JSON.stringify(msg))

export const lockLog = (msg: Type.Obj<any> | string) => {
  errorHelper('lock', msg)
  return lockLog
}
export const errorLog = (msg: Type.Obj<any> | string) => {
  errorHelper('error', msg)
  return errorLog
}
export const apiLog = (msg: Type.Obj<any> | string) => {
  infoHelper('api', msg)
  expressChalk(JSON.stringify(msg))
  return apiLog
}
export const scriptLog = (msg: Type.Obj<any> | string) => {
  infoHelper('script', msg)
  return scriptLog
}
export const redisLog = (msg: Type.Obj<any> | string) => {
  errorHelper('redis', msg)
  errorLog(JSON.stringify(msg))
  return redisLog
}
export const mysqlLog = (msg: Type.Obj<any> | string) => {
  errorHelper('mysql', msg)
  errorLog(JSON.stringify(msg))
  return mysqlLog
}

