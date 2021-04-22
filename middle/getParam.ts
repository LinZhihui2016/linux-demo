import { RequestHandler } from "express";

interface GetParam {
  str: (key: string, init?: string) => string;
  arr: <T = string>(key: string, init?: T[]) => T[];
  bool: (key: string, init?: boolean) => boolean;
  num: (key: string, init?: number) => number
}

declare module 'express-serve-static-core' {
  interface Request {
    $get: GetParam
  }
}
export const getParam: RequestHandler = (req, res, next) => {
  const body = req.body;
  const query = req.query;
  const v = <T>(key: string): [T, string] => [body[key], query[key] as string]
  const str = (key: string, init = ''): string => {
    const [v1, v2] = v(key)
    if (v1 !== undefined) return v1 + ''
    if (v2 !== undefined) return v2 + ''
    return init
  }
  const num = (key: string, init = 0): number => {
    const [v1, v2] = v(key)
    if (v1 !== undefined) return +(v1 + '');
    if (v2 !== undefined) return +(v2 + '');
    return init
  }
  const bool = (key: string, init = false): boolean => {
    const [v1, v2] = v(key)
    if (v1 !== undefined) return !!v1
    if (v2 !== undefined) return !!v2
    return init
  }
  const arr = <T = string>(key: string, init: T[] = []): T[] => {
    const [v1, v2] = v(key)
    if (v1 !== undefined) {
      if (Array.isArray(v1)) {
        return v1 as T[]
      }
      try {
        return JSON.parse(typeof v1 === "string" ? v1 : "[]") as T[]
      } catch (e) {
        return init
      }
    }
    if (v2 !== undefined) {
      try {
        return JSON.parse(v2) as T[]
      } catch (e) {
        return init
      }
    }
    return init
  }
  req.$get = {
    str,
    num,
    bool,
    arr
  }
  next()
}