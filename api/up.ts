import { Action } from "../type";
import { error, success } from "../helper";
import { ErrBase, ErrUp } from "../util/error";
import { $redis } from "../tools/redis";
import { fansList, fetchUp, saveUp } from "../model/up.model";
import { HOUR } from "../util";
import { Where } from "../tools/mysql/where";
import { $mysql } from "../tools/mysql";
import { UP_FANS_MAX } from "../util/magic";
import { paging } from "../tools/mysql/helper";
import { UpSql } from "../tools/mysql/type";

export const postAdd: Action<{ mid: number|string }> = async ({ mid, noCache }) => {
  if (!mid) return error(ErrBase.参数错误)
  let up: UpSql | null = null
  const redisKey = (['bilibili', 'up', mid].join(':'))
  if ($redis.isConnect && !noCache) {
    const [, info] = await $redis.str.get(redisKey);
    if (info) {
      up = JSON.parse(info) as UpSql
    }
  }
  if (!up) {
    const [e, data] = await fetchUp(Number(mid))
    if (e) return error(ErrBase.b站抓取失败, e.message)
    if ($redis.isConnect) {
      await $redis.str.set({ [redisKey]: JSON.stringify(data) })
      await $redis.key.expire(redisKey, HOUR)
    }
    up = data
  }
  if (up) {
    const [err] = await saveUp(up)
    return err ? error(ErrBase.mysql写入失败, err.sql) : success({ up })
  } else {
    return error(ErrBase.b站抓取失败)
  }
}

export const getInfo: Action<{ mid: string }> = async ({ mid }) => {
  if (!mid) return error(ErrBase.参数错误)
  const where = new Where().eq('mid', +mid)
  const [err, info] = await $mysql.query('up').where(where).find()
  if (err || info.length === 0) {
    return error(ErrBase.mysql读取失败, '未收录该up主')
  } else {
    return success(info[0])
  }
}

export const postFans: Action<{ mid: number, status: boolean }> = async ({ mid, status }) => {
  if (!mid) return error(ErrBase.参数错误)
  if (status) {
    const fansCountWhere = new Where().eq('isFans', 1)
    const count = await $mysql.query<{ len: number }>('up').where(fansCountWhere).count().find()
    if (count[0]) return error(ErrBase.mysql读取失败, count[0].sql)
    if (count[1][0].len >= UP_FANS_MAX) return error(ErrUp.关注数量达到上限, '关注数量达到上限')
  }
  const where = new Where().eq('mid', +mid)
  const [err, info] = await $mysql.query('up').where(where).find()
  if (err || info.length === 0) return error(ErrUp.未收录该up主)
  const [err2] = await $mysql.update('up', { isFans: status ? 1 : 0 }, where)
  if (err2) return error(ErrBase.mysql写入失败, err2.sql)
  return success(null, (status ? '' : '取消') + '关注成功')
}

export const getFans: Action = async () => {
  const ups = await fansList().find()
  if (ups[0]) return error(ErrBase.mysql读取失败, ups[0].sql)
  if (!ups[1].length) return error(ErrUp.关注列表为空)
  return success(ups[1])
}

export const getLatest: Action<{ pageSize?: string, page?: string }> = async ({ pageSize, page }) => {
  const list = await paging('up', { pageSize, page }).orderBy('updated', 'DESC').find()
  if (list[0]) return error(ErrBase.mysql读取失败, list[0].sql)
  return success(list[1])
}