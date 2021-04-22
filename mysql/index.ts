import { RequestHandler } from "express";
import mysql, { MysqlError } from 'mysql';
import mysqlConf from '../conf/mysql.json'
import { Query } from "./query";
import { Where } from "./where";

declare module 'express-serve-static-core' {
  interface Request {
    mysql: Mysql
  }
}
export class Mysql {
  connection: mysql.Connection;
  constructor(public option: { host: string, user: string, password: string }, public database: string) {
    const { host, user, password } = option
    this.connection = mysql.createConnection({
      host, user, password, database
    })
    this.connection.connect((err) => {
      if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
    });
  }

  query<T>(table: string) {
    return new Query<T>(table, this.connection)
  }

  insert(table: string, data: { [key: string]: string | number }): MysqlPromise<any> {
    const rows = Object.keys(data);
    const values = rows.map(i => data[i]);
    const sql = `INSERT INTO ${ table }(${ rows.join(',') }) values (${ Array(rows.length).fill('?').join(',') })`
    return new Promise(resolve => this.connection.query(sql, values, mysqlRes(resolve)))
  }

  update(table: string, data: { [key: string]: string | number }, where?: string | Where) {
    const SET = this.connection.escape(data)
    const WHERE = where ? 'WHERE ' + (where instanceof Where ? where.get() : where) : ''
    const sql = `UPDATE ${ table } SET ${ SET }${ WHERE }`
    return new Promise(resolve => this.connection.query(sql, mysqlRes(resolve)))
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
    (err: MysqlError | null, result: S) => resolve([err, fn ? fn(result) : result])