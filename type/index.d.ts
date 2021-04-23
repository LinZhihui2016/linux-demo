import { Res, ResArr } from "../helper";
import { Request } from 'express-serve-static-core'

export namespace Type {
  export interface Obj<T = string | number> {
    [key: string]: T | undefined
  }
}

export interface ResBody {
  err: string
  msg: string
  data: any
}

export interface Answer {
  status?: number,
  body: ResBody
}

export type Action<T extends Type.Obj<any> = {}> = (query: T & { noCache: boolean }, req?: Request) => Promise<Res | ResArr>

export type PRes<T, E = Error> = Promise<[null, T] | [E, null]>
