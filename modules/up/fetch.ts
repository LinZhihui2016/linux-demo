import { PRes } from "../../type";
import { UpSql } from "../../tools/mysql/type";
import { apiUserInfo, apiUserStat, apiUserUpstat } from "../../crawler/user";
import { sleep } from "../../util";

export const fetchUp = async (mid: number): PRes<UpSql> => {
  const [e1, info] = await apiUserInfo(mid)
  if (e1) return [e1, null]
  await sleep(300)
  const [e2, stat] = await apiUserStat(mid)
  if (e2) return [e2, null]
  await sleep(300)
  const [e3, upstat] = await apiUserUpstat(mid)
  if (e3) return [e3, null]
  const { data: { sign, face, name } } = info!
  const { data: { follower } } = stat!
  const { data: { archive: { view }, likes } } = upstat!
  return [null, {
    sign, face, name, follower, archive: view, likes, mid,
  }]
}