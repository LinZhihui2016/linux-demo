import * as fs from "fs";
import path from "path";
import { Action, Type } from "../type";
import { expressLog } from "../util/chalk";
import { Express } from "express";

export const apiIndex = (app: Express,dirname:string) => fs.readdirSync(path.join(dirname, 'api')).forEach(file => {
  if (!file.endsWith('.ts')) return;
  const actions = require(path.join(dirname, 'api', file)) as Type.obj<Action<any>>
  Object.keys(actions).forEach(action => {
    const route = '/api/' + file.replace(/\.ts$/, '') + '/' + action.replace(/Action$/, '')
    app.use(route, (req, res) => {
      actions[action]!(req.body).then((res_) => {
            const { status, body } = res_.json
            const end = new Date()
            const start = req.start
            const time = end.getTime() - start.getTime()
            expressLog(`${ req.url } finish ${ time }ms`)
            res.status(status || 200).send({
              ...body,
              time: `${ time }ms`,
              start: start.toLocaleString(),
              end: end.toLocaleString()
            })
          }
      )
    })
  })
})