import fetch, { RequestInit } from "node-fetch";
import { cookie } from "../axios/static";
import { PRes, Type } from "../../type";
import { sleep } from "../../util";
import qs from "qs";
import { ajaxLog } from "../../util/chalk";

export class NodeFetch {
  options: RequestInit;

  constructor(public baseUrl: string, options: RequestInit) {
    this.options = { headers: { cookie }, ...options }
  }

  $ = async (url: string, data?: Type.Obj<string | number | undefined>, opt?: RequestInit): PRes<string> => {
    const { method = 'GET' } = opt || {}
    await sleep(1000)
    const u = this.baseUrl + '/' + url + (method === 'GET' ? '?' + qs.stringify(data) : '')
    ajaxLog('fetch：' + u)
    return new Promise((resolve => {
      fetch(u, {
        ...this.options, ...opt,
        method,
        body: method === 'GET' ? JSON.stringify(data) : undefined
      })
          .then(res => res.text().then((text) => resolve([null, text])))
          .catch(err => resolve([err, null]))
    }))
  }
}