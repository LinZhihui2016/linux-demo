import { Action } from "../type";
import { error, success } from "../helper";
import { Err } from "../util/error";
import { fetchBv, saveBv } from "../model/bv.model";
import { $redis } from "../tools/redis";
import { HOUR } from "../util";
import { VideoSql } from "../tools/mysql/type";
import { $mysql } from "../tools/mysql";
import { Where } from "../tools/mysql/where";

export const postAdd: Action<{ bv: string }> = async ({ bv, noCache }) => {
  if (!bv) return error(Err.参数错误)
  let bvObj: VideoSql | null = null
  const redisKey = (['bilibili', 'video', bv].join(':'))
  if ($redis.isConnect && !noCache) {
    const [, info] = await $redis.str.get(redisKey);
    if (info) {
      bvObj = JSON.parse(info) as VideoSql
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


export const getInfo: Action<{ bv: string, aid: string }> = async ({ bv, aid }) => {
  if (!(bv || aid)) return error(Err.参数错误)
  const where = Where.OR([new Where().eq('bvid', bv), new Where().eq('aid', aid)])
  const [err, info] = await $mysql.query('video').where(where).find()
  if (err || info.length === 0) {
    return error(Err.mysql读取失败, '未收录该视频')
  } else {
    return success(info[0])
  }
}