import { PRes, Type } from "../type";
import { apiUserInfo, apiUserStat, apiUserUpstat } from "../crawler/user";
import { $mysql } from "../tools/mysql";
import { Where } from "../tools/mysql/where";

export interface Up extends Type.Obj {
  name: string,
  sign: string,
  face: string,
  mid: number,
  follower: number,
  archive: number,
  likes: number,
  isFans: 0 | 1,
  id?: number
}

export const fetchUp = async (mid: number): PRes<Up> => {
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
    sign, face, name, follower, archive: view, likes, mid, isFans: 0
  }]
}

export const saveUp = async (up: Up) => {
  const where = new Where().eq('mid', up.mid)
  const [err, data] = await $mysql.query<Up>('up').select('mid').where(where).find()
  if (err) return [err, null]
  return $mysql.$('up', up, data.length > 0 ? where : undefined)
}