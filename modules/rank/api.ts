import { Action, Type } from "../../type";
import { RankId } from "../../crawler/ranking";
import { error, success } from "../../helper";
import { ErrBase, ErrRank } from "../../util/error";
import { getRankCache, setRankCache } from "./redis";
import { fetchRank } from "./fetch";
import { getRank, getRankRatioByDate, saveRank } from "./mysql";
import { getListByBv } from "../video/mysql";
import { toInt, yesterday } from "../../util";
import { $date } from "../../util/date";

export const postUpdate: Action<{ rid: RankId }> = async ({ rid, noCache }) => {
  if (!rid) return error(ErrBase.参数错误)
  let list: string[] | null = null
  if (!noCache) {
    const [, cache] = await getRankCache(rid)
    cache && (list = cache.bvList)
  }
  if (!list) {
    const [, data] = await fetchRank(rid)
    data && await setRankCache(data, rid)
    data && (list = data.bvList);
  }
  if (!list) return error(ErrBase.b站抓取失败, rid + '')
  const date = $date(new Date())
  const [err] = await saveRank(list, rid, date)
  return err ? error(ErrBase.mysql写入失败, err.sql) : success(list)
}

export const getRid: Action = () => {
  const rankObj: Type.Obj = {}
  Object.keys(RankId).filter(i => /^[0-9]*$/.test(i)).forEach(i => {
    rankObj[i] = RankId[+i]
  })
  return Promise.resolve(success(rankObj))
}

export const getPaging: Action<{ rid: RankId, date: string, count?: string }> = async ({ rid, date, count }) => {
  const [err, list] = await getRank(rid, date)
  if (err) return error(ErrBase.mysql读取失败, err.message)
  const bvs = list!.split(',').slice(0, toInt(count, 10))
  const [err2, bvList] = await getListByBv(bvs)
  const rankList = bvs.map(bv => bvList!.find(i => i.bvid === bv) || bv)
  return err2 ? error(ErrRank.获取排行榜失败, err2.message) : success(rankList)
}

export const getRatio: Action<{ date?: string }> = async ({ date }) => {
  const $date = date || yesterday()
  const [err, data] = await getRankRatioByDate($date)
  if (err) return error(ErrRank.获取排行榜失败, err.sql)
  const $data = data.map(i => {
    return { value: i.COUNT_IN_0, label: RankId[i.RID] }
  })
  return success($data)
}