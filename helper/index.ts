import { isArr } from "../util";
import { Err, ErrBase } from "../util/error";
import { Answer } from "../type";
import { errorChalk } from "../util/chalk";

export class Res {
  constructor(public data = {}, public msg: string[] | string = '', public err: number | number[] | string[] | string = 0, public status = 200) {
  }

  get json(): Answer {
    const { status, data, msg, err } = this
    return {
      status,
      body: { data, msg: isArr(msg).filter(Boolean).join(' | '), err: isArr(err).filter(Boolean).join(' | ') }
    }
  }

  error(err: Err, msg?: string | string[]) {
    this.err = err
    this.msg = [ErrBase[err], ...isArr(msg || '')].filter(Boolean)
    errorChalk(msg)
    return this
  }

  success(data: any, msg = '') {
    this.data = data
    this.err = 0
    this.msg = msg
    return this
  }

  isArr = false;
}

export class ResArr {
  resArr: Res[] = []
  isArr = true;

  push(res: Res | ResArr) {
    if (res instanceof Res) {
      this.resArr.push(res)
    } else {
      res.resArr.forEach(i => {
        this.push(i)
      })
    }
    return this
  }

  get json(): Answer {
    const body = this.resArr.map(i => i.json.body)
    return new Res(body.map(i => i.data), body.map(i => i.err), body.map(i => i.msg)).json
  }
}

export const error = (err: Err, msg?: string | string[]) => new Res().error(err, msg)
export const success = (data: any, msg = '') => new Res().success(data, msg)