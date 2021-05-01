import { Where } from "./where";
import { $mysql } from "./index";
import { toInt } from "../../util";
import { Query } from "./query";
import { PRes } from "../../type";

export interface Paging<T> {
  totalPage: number,
  total: number,
  list: T[]
}

export const paging = async <T>(opt: {
  table: string,
  page: { pageSize?: string, page?: string }
  where?: Where | string
  more?: <S>(s: Query<S>) => Query<S>
  select?: string | string[]
}): PRes<Paging<T>> => {
  const { table, page: { page, pageSize }, where = '', more = e => e, select = '*' } = opt
  let $pageSize = Math.min(toInt(pageSize, 30), 50)
  if ($pageSize <= 10) {
    $pageSize = 10
  }
  let $page = toInt(page, 1) - 1
  if ($page < 0) {
    $page = 0
  }
  const [e1, total] = await more($mysql.query<{ len: number }>(table).where(where)).count().find()
  const [e2, list] = await more($mysql.query<T>(table).select(select).where(where).limit($pageSize, $page)).find()
  if (e1) return [e1, null]
  if (e2) return [e2, null]
  const totalPage = Math.ceil(total[0].len / $pageSize)
  return [null, { totalPage, list, total: total[0].len }]
}