import { Action } from "../type";
import { RankId } from "../crawler/ranking";
import { error, success } from "../helper";
import { Err } from "../util/error";
import { $redis } from "../tools/redis";
import { fetchRank, saveRank } from "../model/rank.model";
import { BEFORE_TOMORROW } from "../util";
import { $date } from "../util/date";
import { Where } from "../tools/mysql/where";
import { $mysql } from "../tools/mysql";

export const postAdd: Action<{ rid: RankId }> = async ({ rid, noCache }) => {
  if (!rid) return error(Err.参数错误)
  const redisKey = (['bilibili', 'rank', rid].join(':'))
  let bvList: string[] | null = null
  if ($redis.isConnect && !noCache) {
    const [, redisRes] = await $redis.str.get(redisKey);
    if (redisRes) {
      bvList = JSON.parse(redisRes) as string[]
    }
  }
  if (!bvList) {
    const [e, data] = await fetchRank(rid)
    if (e) return error(Err.b站抓取失败, e.message)
    if ($redis.isConnect) {
      await $redis.str.set({ [redisKey]: JSON.stringify(data) })
      await $redis.key.expire(redisKey, BEFORE_TOMORROW(), 'time_ms')
    }
    bvList = data
  }
  if (bvList) {
    const [err] = await saveRank([...bvList], rid)
    return err ? error(Err.mysql写入失败, err.sql) : success({ bvList })
  } else {
    return error(Err.b站抓取失败)
  }
}

export const getRid: Action = () => {
  const rankIdList = Object.keys(RankId).filter(i => /^[0-9]*$/.test(i))
  return Promise.resolve(success(rankIdList))
}

export const getPaging: Action<{ rid: RankId, date: string }> = async ({ rid, date }) => {
  const where = new Where().eq('rid', rid || '0').eq('date', date || $date(new Date()))
  const [err, list] = await $mysql.query<{ LIST: string }>('video_rank').select('list').where(where).find()
  if (err) {
    return error(Err.mysql读取失败, err.message)
  }
  if (list.length !== 1){
    return error(Err.mysql读取失败, '日期或rid错误')
  }
  const bvs = list[0].LIST.split(',')
  const w = new Where().in('bv', bvs)
  const [err2, bvList] = await $mysql.query<{ BV: string, TITLE: string, MID: number, PIC: string }>('video').select(['bv', 'title', 'mid', 'pic']).where(w).find()
  if (err2) {
    return error(Err.mysql读取失败, err2.sql)
  } else {
    return success(bvs.map(bv => bvList.find(i => i.BV === bv) || bv))
  }
}