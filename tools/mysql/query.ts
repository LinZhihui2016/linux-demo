import mysql from "mysql";
import { MysqlPromise, mysqlRes } from "./index";
import { Where } from "./where";
import { Type } from "../../type";

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

  join(table: string, on: Where | string, type: 'left' | 'right' | '' = '') {
    this._join[table] = {
      on,
      type
    }
    return this
  }

  _join: Type.Obj<{ on: Where | string, type: 'left' | 'right' | '' }> = {}

  get $from() {
    const v = [`FROM`, this.table]
    if (Object.keys(this._join)) {
      Object.keys(this._join).forEach(table => {
        const { on, type } = this._join[table]!
        const where = on instanceof Where ? on.get() : on;
        v.push(type)
        v.push('join')
        v.push(table)
        v.push('on')
        v.push(where)
      })
    }
    return v.join(' ')
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

  get $groupBy() {
    const { _groupBy } = this
    if (!_groupBy) return
    return ['GROUP BY', _groupBy].join(' ')
  }

  sql() {
    const { $from, $select, $where, $orderBy, $limit, $groupBy } = this
    return [$select, $from, $where, $orderBy, $limit, $groupBy].filter(Boolean).join(' ')
  }

  distinct(flag: boolean = true) {
    this._distinct = flag
    return this
  }

  count(key = 'len') {
    this._select = `count(*) as ${ key }`
    return this
  }

  upperCase = true

  case(upperCase = false) {
    this.upperCase = upperCase
    return this
  }

  select(k: string | (string | [string, string])[]) {
    const _k = (Array.isArray(k) ? k : [k]).map(i => Array.isArray(i) ? i.join(' as ') : i)
    const _select = _k.join(',')
    this._select = _select || '*'
    if (this.upperCase) {
      this._select = this._select.toUpperCase()
    }
    return this
  }

  limit(pageSize: number, page: number) {
    if (pageSize > 1 && page >= 0) {
      this._limit = `${ page * pageSize },${ pageSize }`
    }
    return this
  }

  where(w: Where | string) {
    this._where = w instanceof Where ? w.get() : w;
    return this
  }

  orderBy(key: string, by: 'ASC' | "DESC" | any[] = 'ASC') {
    if (Array.isArray(by)) {
      this._orderBy.push(`FIELD(${ key },${ by.map(i => this.connection.escape(i)).join(',') })`)
    } else {
      this._orderBy.push([key, by].join(' '))
    }
    return this
  }

  _groupBy = ''

  groupBy(key: string) {
    this._groupBy = key
    return this
  }

  find(query?: string): MysqlPromise<T> {
    return new Promise(resolve => this.connection.query(query || this.sql(), mysqlRes(resolve)))
  }

}
