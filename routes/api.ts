import * as fs from "fs";
import path from "path";
import { Action, Type } from "../type";
import { expressLog } from "../util/chalk";
import { Express } from "express";

export const apiIndex = (app: Express, dirname: string) => fs.readdirSync(path.join(dirname, 'modules')).forEach(module => {
  const apiFile = path.join(dirname, 'modules', module, 'api.ts')
  const isExists = fs.existsSync(apiFile)
  if (!isExists) return
  const actions = require(apiFile) as Type.Obj<Action<any>>
  const reg = /^(get|post)(.*)$/
  Object.keys(actions).forEach(action => {
    const match = action.match(reg)
    if (!match) return;
    const route = '/api/' + module + '/' + match[2]
    app.use(route, (req, res) => {
      if (req.method !== match[1].toUpperCase()) return res.status(405).send()
      actions[action]!(req.body, req).then((res_) => {
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