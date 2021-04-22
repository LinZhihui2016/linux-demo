import log4js from 'log4js'

export const logInit = () =>
    log4js.configure({
      appenders: { api: { type: "file", filename: 'error.log' } },
      categories: { default: { appenders: ['api'], level: 'error' } }
    })

export const apiLog = () => log4js.getLogger('api')
