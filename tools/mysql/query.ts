import mysql from "mysql";
import { MysqlPromise, mysqlRes } from "./index";
import { Where } from "./where";

export class Query<T> {
  constructor(public table: string, public connection: mysql.Connection) {
  }

  _select = '*'
  _distinct = false
  _where = ''
  _limit = ''
  _orderBy: string[] = []

  get $select() {
    const { _select, _distinct } = this
    if (!_select) return
    return [`SELECT`, _distinct && 'DISTINCT', _select].filter(Boolean).join(' ')
  }

  get $from() {
    return [`FROM`, this.table].join(' ')
  }

  get $orderBy() {
    const { _orderBy } = this
    if (!_orderBy.length) return
    return ['ORDER', 'BY', _orderBy.join(', ')].join(' ')
  }

  get $where() {
    const { _where } = this
    if (!_where) return
    return ['WHERE', _where].join(' ')
  }

  get $limit() {
    const { _limit } = this
    if (!_limit) return
    return ['LIMIT', _limit].join(' ')
  }

  sql() {
    const { $from, $select, $where, $orderBy, $limit } = this
    return [$select, $from, $where, $orderBy, $limit].filter(Boolean).join(' ')
  }

  distinct(flag?: boolean) {
    this._distinct = !!flag
    return this
  }

  select(k: string | string[]) {
    const _select = ((Array.isArray(k) ? k : [k]).join(',')).toUpperCase()
    this._select = _select || '*'
    return this
  }

  limit(pageSize: number, page: number) {
    if (pageSize > 1 && page >= 0) {
      this._limit = `${ page * pageSize },${ (page + 1) * pageSize }`
    }
  }

  where(w: Where | string) {
    this._where = w instanceof Where ? w.get() : w;
    return this
  }

  orderBy(key: string, by: 'ASC' | "DESC" = 'ASC') {
    this._orderBy.push([key, by].join(' '))
    return this
  }

  find(): MysqlPromise<T> {
    return new Promise(resolve => this.connection.query(this.sql(), mysqlRes(resolve)))
  }
}
