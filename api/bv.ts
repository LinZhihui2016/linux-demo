import { Action } from "../type";
import { error, success } from "../helper";
import { Err } from "../util/error";
import { Bv, fetchBv, saveBv } from "../model/bv.model";
import { $redis } from "../tools/redis";
import { HOUR } from "../util";

export const postAdd: Action<{ bv: string }> = async ({ bv, noCache }) => {
  if (!bv) return error(Err.参数错误)
  let bvObj: Bv | null = null
  const redisKey = (['bilibili', 'video', bv].join(':'))
  if ($redis.isConnect && !noCache) {
    const [, info] = await $redis.str.get(redisKey);
    if (info) {
      bvObj = JSON.parse(info) as Bv
    }
  }
  if (!bvObj) {
    const [e, data] = await fetchBv(bv)
    if (e) return error(Err.b站抓取失败, e.message)
    if ($redis.isConnect) {
      await $redis.str.set({ [redisKey]: JSON.stringify(data) })
      await $redis.key.expire(redisKey, HOUR)
    }
    bvObj = data
  }
  if (bvObj) {
    const [err] = await saveBv(bvObj)
    return err ? error(Err.mysql写入失败, err.sql) : success({ bvObj })
  } else {
    return error(Err.b站抓取失败)
  }
}