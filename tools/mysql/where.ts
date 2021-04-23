import { $mysql } from "./index";

export class Where {
  arr: string[] = []
  isWhere = true

  get() {
    return this.arr.join(' AND ')
  }

  in(key: string, values: (string[] | number[]), not = false) {
    this.arr.push(not ? `not ` : '' + `${ key } in (${ values.map((i: any) => `'${ i }'`).join(',') })`)
    return this
  }

  between(key: string, min: number, max: number, not = false) {
    this.arr.push(not ? `not ` : '' + `${ key } between ${ min } and ${ max }`)
    return this
  }

  gt(key: string, value: number | string, not = false) {
    this.arr.push(not ? `not ` : '' + `${ key } > ${ value }`)
    return this
  }

  lt(key: string, value: number | string, not = false) {
    this.arr.push(not ? `not ` : '' + `${ key } < ${ value }`)
    return this
  }

  gtEq(key: string, value: number | string, not = false) {
    this.arr.push(not ? `not ` : '' + `${ key } >= ${ value }`)
    return this
  }

  ltEq(key: string, value: number | string, not = false) {
    this.arr.push(not ? `not ` : '' + `${ key } <= ${ value }`)
    return this
  }

  eq(key: string, value: number | string, not = false) {
    this.arr.push(not ? `not ` : '' + `${ key } = ${ $mysql.connection.escape(value) }`)
    return this
  }

  notEq(key: string, value: number | string, not = false) {
    this.arr.push(not ? `not ` : '' + `${ key } != ${ value }`)
    return this
  }

  like(key: string, value: string, not = false) {
    this.arr.push(not ? `not ` : '' + `${ key } like ${ value }`)
    return this
  }

  static OR(wheres: Where[]) {
    return wheres.map(i => `(${ i.get() })`).join(' OR ')
  }
}