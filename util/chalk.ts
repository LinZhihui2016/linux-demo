import chalk from "chalk";
import { isArr } from "./index";

export const e = () => chalk.gray('===========')
export const lr = (str: string) => e() + str + Array(30 - str.length).fill(' ').join('') + e()

export const sleepChalk = (time?: number) => {
  console.log(lr(chalk.yellow(`sleep ${ time }ms`)))
}

export const ajaxChalk = (msg?: string | string[]) => {
  isArr(msg).forEach(i => {
    console.log(chalk.blue(i))
  })
}

export const expressChalk = (msg?: string | string[]) => {
  isArr(msg).forEach(i => {
    console.log(chalk.green(i))
  })
}

export const infoChalk = (msg?: string | string[]) => {
  isArr(msg).forEach(i => {
    console.log(chalk.cyan(i))
  })
}

export const errorChalk = (msg?: string | string[]) => {
  isArr(msg).forEach(i => {
    console.log(chalk.red(i))
  })
}
let index = 0;
export const devChalk = (msg?: string | string[]) => {
  isArr(msg).forEach(i => {
    console.log(chalk.bgRed.white(i || index))
  })
  index++;
}