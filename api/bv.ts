import { Action } from "../type";
import { error, success } from "../helper";
import { ErrBase, ErrVideo } from "../util/error";
import { fansList, fetchBv, saveBv } from "../model/bv.model";
import { $redis } from "../tools/redis";
import { HOUR } from "../util";
import { VideoSql } from "../tools/mysql/type";
import { $mysql } from "../tools/mysql";
import { Where } from "../tools/mysql/where";
import { VIDEO_FANS_MAX } from "../util/magic";
import { paging } from "../tools/mysql/helper";

export const postAdd: Action<{ bv: string }> = async ({ bv, noCache }) => {
  if (!bv) return error(ErrBase.参数错误)
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
    if (e) return error(ErrBase.b站抓取失败, e.message)
    if ($redis.isConnect) {
      await $redis.str.set({ [redisKey]: JSON.stringify(data) })
      await $redis.key.expire(redisKey, HOUR)
    }
    bvObj = data
  }
  if (bvObj) {
    const [err] = await saveBv(bvObj)
    return err ? error(ErrBase.mysql写入失败, err.sql) : success({ bvObj })
  } else {
    return error(ErrBase.b站抓取失败)
  }
}


export const getInfo: Action<{ bv: string, aid: string }> = async ({ bv, aid }) => {
  if (!(bv || aid)) return error(ErrBase.参数错误)
  const where = Where.OR([new Where().eq('bvid', bv), new Where().eq('aid', aid)])
  const [err, info] = await $mysql.query('video').where(where).find()
  if (err || info.length === 0) {
    return error(ErrBase.mysql读取失败, '未收录该视频')
  } else {
    return success(info[0])
  }
}

export const postFans: Action<{ bv: string, status: boolean }> = async ({ bv, status }) => {
  if (!bv) return error(ErrBase.参数错误)
  if (status) {
    const fansCountWhere = new Where().eq('isFans', 1)
    const count = await $mysql.query<{ len: number }>('video').where(fansCountWhere).count().find()
    if (count[0]) return error(ErrBase.mysql读取失败, count[0].sql)
    if (count[1][0].len >= VIDEO_FANS_MAX) return error(ErrVideo.关注数量达到上限, '关注数量达到上限')
  }
  const where = new Where().eq('bvid', bv)
  const [err, info] = await $mysql.query('video').where(where).find()
  if (err || info.length === 0) return error(ErrVideo.未收录该视频)
  const [err2] = await $mysql.update('video', { isFans: status ? 1 : 0 }, where)
  if (err2) return error(ErrBase.mysql写入失败, err2.sql)
  return success(null, (status ? '' : '取消') + '关注成功')
}

export const getFans: Action = async () => {
  const videos = await fansList().find()
  if (videos[0]) return error(ErrBase.mysql读取失败, videos[0].sql)
  if (!videos[1].length) return error(ErrVideo.关注列表为空)
  return success(videos[1])
}

export const getLatest: Action<{ pageSize?: string, page?: string }> = async ({ pageSize, page }) => {
  const list = await paging('video', {
    pageSize,
    page
  }, new Where().notEq('type', 'deleted')).orderBy('updated', 'DESC').find()
  if (list[0]) return error(ErrBase.mysql读取失败, list[0].sql)
  return success(list[1])
}