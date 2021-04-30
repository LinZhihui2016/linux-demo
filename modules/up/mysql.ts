import { PRes } from "../../type";
import { UpSql } from "../../tools/mysql/type";
import { Where } from "../../tools/mysql/where";
import { $mysql } from "../../tools/mysql";

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