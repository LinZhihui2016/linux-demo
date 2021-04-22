import chalk from "chalk";
import { isArr } from "./index";

export const e = () => chalk.gray('===========')
export const lr = (str: string) => e() + str + Array(30 - str.length).fill(' ').join('') + e()

export const sleepLog = (time?: number) => {
  console.log(lr(chalk.yellow(`sleep ${ time }ms`)))
}

export const ajaxLog = (msg?: string | string[]) => {
  isArr(msg).forEach(i => {
    console.log(chalk.blue(i))
  })
}

export const expressLog = (msg?: string | string[]) => {
  isArr(msg).forEach(i => {
    console.log(chalk.green(i))
  })
}

export const infoLog = (msg?: string | string[]) => {
  isArr(msg).forEach(i => {
    console.log(chalk.cyan(i))
  })
}

export const errorLog = (msg?: string | string[]) => {
  isArr(msg).forEach(i => {
    console.log(chalk.red(i))
  })
}