import fetch, { RequestInit } from "node-fetch";
import { cookie } from "../axios/static";
import { Type } from "../type";
import { sleep } from "../util";
import qs from "qs";
import { ajaxLog } from "../util/chalk";

export class NodeFetch {
  options: RequestInit;

  constructor(public baseUrl: string, options: RequestInit) {
    this.options = { headers: { cookie }, ...options }
  }

  $ = async (url: string, data?: Type.obj<string | number | undefined>, opt?: RequestInit) => {
    const { method = 'GET' } = opt || {}
    await sleep(1000)
    const u = this.baseUrl + '/' + url + (method === 'GET' ? '?' + qs.stringify(data) : '')
    ajaxLog('fetch：' + u)
    return fetch(u, {
      ...this.options, ...opt,
      method,
      body: method === 'GET' ? JSON.stringify(data) : undefined
    }).then(res => res.text())
  }
}