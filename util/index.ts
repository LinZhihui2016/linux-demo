import { sleepLog } from "./chalk";

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