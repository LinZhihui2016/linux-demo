import { PRes } from "../../type";
import { UpSql } from "../../tools/mysql/type";
import { error, Res } from "../../helper";
import { ErrBase } from "../../util/error";
import { getUpCache, setUpCache } from "./redis";
import { fetchUp } from "./fetch";
import { saveUp } from "./mysql";

export const createdAndUpdated = async (mid: number, noCache?: boolean): PRes<UpSql, Res> => {
  let upObj: UpSql | null = null
  //检查redis
  if (!noCache) [, upObj] = await getUpCache(mid)
  if (!upObj) {
    const [, data] = await fetchUp(mid)
    data && await setUpCache(data)
    upObj = data
  }
  if (!upObj) return [error(ErrBase.b站抓取失败, mid + ''), null]
  const [err] = await saveUp(upObj)
  return err ? [error(ErrBase.mysql写入失败, err.sql), null] : [null, upObj]
}