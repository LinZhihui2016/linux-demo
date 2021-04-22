import { Res, ResArr } from "../helper";

export namespace Type {
  export interface obj<T = string> {
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

export type Action<T extends Type.obj<any> = {}> = (query: T) => Promise<Res | ResArr>