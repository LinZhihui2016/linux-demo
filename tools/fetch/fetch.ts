import fetch, { RequestInit } from "node-fetch";
import { PRes, Type } from "../../type";
import qs from "qs";
import { ajaxChalk } from "../../util/chalk";
import { $redis } from "../redis";

export class NodeFetch {
  options: RequestInit;

  constructor(public baseUrl: string, options: RequestInit) {
    this.options = { headers: {}, ...options }
  }

  $ = async (url: string, data?: Type.Obj<string | number | undefined>, opt?: RequestInit): PRes<string> => {
    const { method = 'GET' } = opt || {}
    const u = this.baseUrl + '/' + url + (method === 'GET' ? '?' + qs.stringify(data) : '')
    ajaxChalk('fetch：' + u)
    const cookie = (await $redis.str.get(['bilibili', 'cookie'].join(':')))[1] || ''
    return new Promise((resolve => {
      fetch(u, {
        ...this.options, ...opt,
        headers: {
          cookie
        },
        method,
        body: method === 'GET' ? JSON.stringify(data) : undefined
      })
          .then(res => res.text().then((text) => resolve([null, text])))
          .catch(err => resolve([err, null]))
    }))
  }
}