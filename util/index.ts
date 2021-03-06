import { sleepChalk } from "./chalk";
import dayjs, { Dayjs } from "dayjs";
import { Type } from "../type";

export const arrayExclude = <T>(target: T[], exclude: T[]): T[] => {
  const res: T[] = [];
  target.forEach(item => {
    !exclude.includes(item) && res.push(item)
  });
  return res
}
export const isArr = <T>(arr: T | T[]): T[] => Array.isArray(arr) ? arr : [arr]
export const isUndef = (v: unknown | unknown[]) => isArr(v).some(i => i === undefined)
export const today = () => new Date().toLocaleDateString()
export const yesterday = () => dayjs().subtract(1, "day").format('YYYY-MM-DD')
export const format = (dayjs: Dayjs) => dayjs.format('YYYY-MM-DD')
export const getDays = (start: Dayjs, end: Dayjs) => {
  let $start = start.clone()
  const day: string[] = []
  while (format(end) !== format($start)) {
    day.push(format($start));
    $start = $start.add(1, 'day')
  }
  return day
};

export const sleep = (ms: number) => {
  sleepChalk(ms)
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

export const toInt = (s?: string, init = 0) => {
  if (!s) return init;
  if (isNaN(parseInt(s))) return init
  return parseInt(s)
}

export const setArr = <T>(arr: T[]): T[] =>
    Array.from(new Set(arr))
export const notInArr = <T>(arr: T[], key: T, init?: T) => arr.includes(key) ? key : init === undefined ? arr[0] : init

export const MINUTE = 60
export const HOUR = MINUTE * 60
export const DAY = HOUR * 24
export const BEFORE_TOMORROW = () => dayjs().add(1, "day").startOf("date").valueOf()

export const initNumber = (value: any, init = 0) => {
  if (value === undefined || value === null) return init
  if (typeof value === 'number') return value
  if (typeof +value === 'number') return +value;
  return init
}

export const initString = (value: any, init = '') => {
  if (value === undefined || value === null) return init
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value + ''
  if (typeof value === 'boolean') return value ? '1' : '0'
  return init
}

export const initDate = (value: any, init = new Date()) => {
  if (value instanceof Date) return value
  if (new Date(value) instanceof Date) return new Date(value)
  return init
}

export const initDayjs = (value: any, init = dayjs()) => {
  if (!value) return init;
  const d = dayjs(value)
  return d.isValid() ? d : init
}

export const isDate = (value: any) => dayjs(value).isValid() ? dayjs() : undefined