import log4js from 'log4js'
import { Type } from "../../type";
import { expressChalk } from "../../util/chalk";

export const logInit = () =>
    log4js.configure({
      appenders: {
        api: { type: "dataFile", filename: 'api.log' },
        script: { type: 'dataFile', filename: 'script.log' },
        error: { type: 'file', filename: 'error.log' },
        mysql: { type: 'file', filename: 'mysql.log' },
        redis: { type: 'redis', filename: 'redis.log' },
      },
      categories: {
        api: { appenders: ['api'], level: 'info' },
        script: { appenders: ['script'], level: 'info' },
        error: { appenders: ['error'], level: 'error' },
        redis: { appenders: ['redis', 'error'], level: 'error' },
        mysql: { appenders: ['mysql', 'error'], level: 'error' },
      }
    })

const infoHelper = (categories: 'api' | 'script' | 'mysql' | 'redis' | 'error', msg: Type.Obj<any> | string) =>
    log4js.getLogger(categories).info(JSON.stringify(msg))
const errorHelper = (categories: 'api' | 'script' | 'mysql' | 'redis' | 'error', msg: Type.Obj<any> | string) =>
    log4js.getLogger(categories).error(JSON.stringify(msg))

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

export const scriptStart = (fn: () => Promise<any>) => {
  scriptLog(`${ fn.name } start`)
  fn().then(() => process.exit(1)).catch(e => errorLog(e && e.message))
}