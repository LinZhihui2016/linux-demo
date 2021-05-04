import { $mysql } from "./index";

const $escape = (v: any, raw?: boolean) => raw ? v : $mysql.connection.escape(v)
const $not = (v: string, not?: boolean) => not ? `not ${ v }` : v

interface Opt {
  not?: boolean,
  raw?: boolean
}

type SN = string | number

export class Where {
  arr: string[] = []
  isWhere = true

  push(v: string) {
    this.arr.push(v)
    return this
  }

  get() {
    return this.arr.join(' AND ')
  }

  in(key: string, values: ((SN | null)[]), { not, raw }: Opt = {}) {
    const v = values.map(i => $escape(i, raw)).join(',')
    // this.arr.push(not ? `not ` : '' + `${ key } in (${ values.map((i: any) => $mysql.connection.escape(i)).join(',') })`)
    return this.push($not(`${ key } in (${ v })`, not))
  }

  between(key: string, min: SN, max: SN, { not, raw }: Opt = {}) {
    const $min = $escape(min, raw)
    const $max = $escape(max, raw)
    return this.push($not(`${ key } between ${ $min } and ${ $max }`, not))
  }

  gt = (key: string, value: SN, { not, raw }: Opt = {}) => this.push($not(`${ key } > ${ $escape(value, raw) }`, not));
  lt = (key: string, value: SN, { not, raw }: Opt = {}) => this.push($not(`${ key } < ${ $escape(value, raw) }`, not));
  gtEq = (key: string, value: SN, {
    not,
    raw
  }: Opt = {}) => this.push($not(`${ key }>= ${ $escape(value, raw) }`, not));
  ltEq = (key: string, value: SN, {
    not,
    raw
  }: Opt = {}) => this.push($not(`${ key }<= ${ $escape(value, raw) }`, not));
  eq = (key: string, value: SN, { not, raw }: Opt = {}) => this.push($not(`${ key } = ${ $escape(value, raw) }`, not));
  notEq = (key: string, value: SN | null, {
    not,
    raw
  }: Opt = {}) => this.push($not(`${ key } != ${ $escape(value, raw) }`, not));
  like = (key: string, value: string, {
    not,
    raw
  }: Opt = {}) => this.push($not(`${ key } like ${ $escape(value, raw) }`, not));

  static OR(wheres: Where[]) {
    return wheres.map(i => `(${ i.get() })`).join(' OR ')
  }
}