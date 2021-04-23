import { RequestHandler } from "express";
import mysql, { MysqlError } from 'mysql';
import mysqlConf from '../../conf/mysql.json'
import { Query } from "./query";
import { Where } from "./where";
import { Type } from "../../type";
import { $date } from "../../util/date";
import { apiLog } from "../../util/log";

declare module 'express-serve-static-core' {
  interface Request {
    mysql: Mysql
  }
}

export class Mysql {
  connection: mysql.Connection;
  isConnect = false

  constructor(public option: { host: string, user: string, password: string }, public database: string) {
    const { host, user, password } = option
    this.connection = mysql.createConnection({
      host, user, password, database,
      charset: 'utf8mb4'
    })
    this.connection.connect((err) => {
      if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
      this.isConnect = true
    });
  }

  query<T>(table: string) {
    return new Query<T>(table, this.connection)
  }

  insert(table: string, data: Type.Obj): MysqlPromise<any> {
    data.created = $date(new Date(), 4)
    data.updated = $date(new Date(), 4)
    const SET = this.connection.escape(data)
    const sql = `INSERT INTO ${ table } SET ${ SET }`
    return new Promise(resolve => this.connection.query(sql, mysqlRes(resolve)))
  }

  update(table: string, data: Type.Obj, where?: string | Where): MysqlPromise<any> {
    data.updated = $date(new Date(), 4)
    const SET = this.connection.escape(data)
    const WHERE = where ? 'WHERE ' + (where instanceof Where ? where.get() : where) : ''
    const sql = `UPDATE ${ table } SET ${ SET } ${ WHERE }`
    return new Promise(resolve => this.connection.query(sql, mysqlRes(resolve)))
  }

  $(table: string, data: Type.Obj, where?: string | Where): MysqlPromise<any> {
    return where ? this.update(table, data, where) : this.insert(table, data);
  }
}

export const $mysql = new Mysql(mysqlConf, 'bilibili')
export const setupMysql: RequestHandler = (req, res, next) => {
  req.mysql = $mysql
  next()
}
export type MysqlCb<T> = [MysqlError | null, T[]]
export type MysqlPromise<T> = Promise<MysqlCb<T>>
export const mysqlRes = <S, T extends CallableFunction>(resolve: T, fn?: (arg: S) => any) =>
    (err: MysqlError | null, result: S) => {
      err && apiLog().error(err.sql)
      resolve([err, fn ? fn(result) : result])
    }