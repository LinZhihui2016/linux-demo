import { sleepLog } from "./chalk";
import dayjs from "dayjs";
import { Type } from "../type";

export const arrayExclude = <T>(target: T[], exclude: T[]): T[] => {
  const res: T[] = [];
  target.forEach(item => {
    !exclude.includes(item) && res.push(item)
  });
  return res
}
export const isArr = <T>(arr: T | T[]): T[] => Array.isArray(arr) ? arr : [arr]

export const today = () => new Date().toLocaleDateString()

export const sleep = (ms: number) => {
  sleepLog(ms)
  return new Promise<void>(resolve => setTimeout(() => resolve(), ms))
}
export const transWan = (str: string) => {
  const reg = /([0-9]*.?[0-9]*)万$/
  if (/万/.test(str)) {
    const s = str.match(reg)
    const m = s ? (+s[1]) * 10000 : 0
    return isNaN(m) ? 0 : m
  } else {
    return isNaN(+str) ? 0 : +str
  }
}

export function lowerCaseKeys(key: string, value: any) {
  if (value && typeof value === 'object') {
    const replacement: Type.Obj<any> = {};
    for (const k in value) {
      if (Object.hasOwnProperty.call(value, k)) {
        replacement[k.toLowerCase()] = value[k];
      }
    }
    return replacement;
  }
  return value;
}
export const MINUTE = 60
export const HOUR = MINUTE * 60
export const DAY = HOUR * 24
export const BEFORE_TOMORROW = () => dayjs().add(1, "day").startOf("date").valueOf()