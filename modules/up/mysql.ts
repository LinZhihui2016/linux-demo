import { PRes } from "../../type";
import { ListQuery, UpSql } from "../../tools/mysql/type";
import { Where } from "../../tools/mysql/where";
import { $mysql } from "../../tools/mysql";
import { Paging, paging } from "../../tools/mysql/helper";
import { getAllUpInFans } from "../up_fans/mysql";

const UP_TABLE = 'up'

export const saveUp = async (up: UpSql) => {
  const where = new Where().eq('mid', up.mid)
  const [err, data] = await $mysql.query<UpSql>(UP_TABLE).select('mid').where(where).find()
  if (err) return [err, null]
  return $mysql.$(UP_TABLE, up, data.length > 0 ? where : undefined)
}

export const getUp = async (mid: number): PRes<UpSql> => {
  const where = new Where().eq('mid', mid)
  const [err, info] = await $mysql.query<UpSql>(UP_TABLE).where(where).find()
  if (err) return [err, null]
  if (info.length === 0) return [new Error('未收录'), null]
  return [null, info[0]]
}

export const getListById = async <T = UpSql>(list: number[], select: string | string[] = '*') => {
  const where = new Where().in('id', list)
  return $mysql.query<T>(UP_TABLE).select(select).where(where).orderBy('id', list).find();
}
export const getListByUpdated = (count: number, orderBy: 'ASC' | 'DESC') => {
  return $mysql.query<UpSql>(UP_TABLE).orderBy('updated', orderBy).limit(Math.max(count, 30), 0).find();
}

export const getListBySort = async (query: ListQuery, getFans: boolean): PRes<Paging<UpSql & { isFans?: number }>> => {
  const {
    page,
    pageSize,
    orderby,
    sort
  } = query
  const [err, pagingList] = await paging<UpSql>({
    table: UP_TABLE,
    page: { pageSize, page },
    more: e => sort ? e.orderBy(sort, orderby) : e
  })
  if (err) return [err, null]
  const list: (UpSql & { isFans: number })[] = pagingList!.list.map(i => ({ ...i, isFans: 0 }))
  if (!getFans) return [null, pagingList!]
  const res: Paging<UpSql & { isFans: number }> = { list, total: pagingList!.total, totalPage: pagingList!.totalPage }
  const [e, fansList] = await getAllUpInFans()
  if (e) return [null, res]
  res.list.forEach(i => {
    i.isFans = +fansList!.includes(i.id as number)
  })
  return [null, res]
}

export const getChartList = async (orderBy: string) => {
  return $mysql.query(UP_TABLE).limit(10, 0).orderBy(orderBy, 'DESC').find()
}

export const getUpCount = async (where?: Where) => {
  return $mysql.query<{ len: number }>(UP_TABLE).where(where || '').count().find()
}

export const getCreatedCount = async (start: string, end: string) => {
  const query = `select date_format(created, '%Y-%m-%d') as date, count(*) as len from ${ UP_TABLE } and created BETWEEN '${ start }' and '${ end }' group by date_format(created, '%Y-%m-%d')`
  return $mysql.query<{ date: string, len: number }>(UP_TABLE).find(query)
}