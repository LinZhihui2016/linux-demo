import { PRes } from "../type";
import { apiUserInfo, apiUserStat, apiUserUpstat } from "../crawler/user";
import { $mysql } from "../tools/mysql";
import { Where } from "../tools/mysql/where";
import { UpSql } from "../tools/mysql/type";

export const fetchUp = async (mid: number): PRes<UpSql> => {
  const [e1, info] = await apiUserInfo(mid)
  if (e1) return [e1, null]
  const [e2, stat] = await apiUserStat(mid)
  if (e2) return [e2, null]
  const [e3, upstat] = await apiUserUpstat(mid)
  if (e3) return [e3, null]
  const { data: { sign, face, name } } = info!
  const { data: { follower } } = stat!
  const { data: { archive: { view }, likes } } = upstat!
  return [null, {
    sign, face, name, follower, archive: view, likes, mid,
  }]
}

export const saveUp = async (up: UpSql) => {
  const where = new Where().eq('mid', up.mid)
  const [err, data] = await $mysql.query<UpSql>('up').select('mid').where(where).find()
  if (err) return [err, null]
  return $mysql.$('up', up, data.length > 0 ? where : undefined)
}

export const fansList = <T = UpSql>(where: Where = new Where()) => {
  return $mysql.query<T>('up').where(where.eq('isFans', 1))
}