import { Action, Type } from "../../type";
import { RankId } from "../../crawler/ranking";
import { error, success } from "../../helper";
import { ErrBase, ErrRank } from "../../util/error";
import { getRankCache, setRankCache } from "./redis";
import { fetchRank } from "./fetch";
import { getRank, saveRank } from "./mysql";
import { getListByBv } from "../video/mysql";

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
  const [err] = await saveRank(list, rid)
  return err ? error(ErrBase.mysql写入失败, err.sql) : success(list)
}

export const getRid: Action = () => {
  const rankObj: Type.Obj = {}
  Object.keys(RankId).filter(i => /^[0-9]*$/.test(i)).forEach(i => {
    rankObj[i] = RankId[+i]
  })
  return Promise.resolve(success(rankObj))
}

export const getPaging: Action<{ rid: RankId, date: string }> = async ({ rid, date }) => {
  const [err, list] = await getRank(rid, date)
  if (err) return error(ErrBase.mysql读取失败, err.message)
  const bvs = list!.split(',')
  const [err2, bvList] = await getListByBv(bvs)
  const rankList = bvs.map(bv => bvList!.find(i => i.bvid === bv) || bv)
  return err2 ? error(ErrRank.获取排行榜失败, err2.message) : success(rankList)
}