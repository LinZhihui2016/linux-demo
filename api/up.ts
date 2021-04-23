import { Action } from "../type";
import { error, success } from "../helper";
import { Err } from "../util/error";
import { $redis } from "../tools/redis";
import { fetchUp, saveUp, Up } from "../model/up.model";
import { HOUR } from "../util";

export const postAdd: Action<{ mid: string }> = async ({ mid, noCache }) => {
  if (!mid) return error(Err.参数错误)
  let up: Up | null = null
  const redisKey = (['bilibili', 'up', mid].join(':'))
  if ($redis.isConnect && !noCache) {
    const [, info] = await $redis.str.get(redisKey);
    if (info) {
      up = JSON.parse(info) as Up
    }
  }
  if (!up) {
    const [e, data] = await fetchUp(Number(mid))
    if (e) return error(Err.b站抓取失败, e.message)
    if ($redis.isConnect) {
      await $redis.str.set({ [redisKey]: JSON.stringify(data) })
      await $redis.key.expire(redisKey, HOUR)
    }
    up = data
  }
  if (up) {
    const [err] = await saveUp(up)
    return err ? error(Err.mysql写入失败, err.sql) : success({ up })
  } else {
    return error(Err.b站抓取失败)
  }
}
