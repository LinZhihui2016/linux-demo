import { Action, Type } from "../../type";
import { RankId } from "../../crawler/ranking";
import { error, success } from "../../helper";
import { ErrBase, ErrRank } from "../../util/error";
import { getRankCache, setRankCache } from "./redis";
import { fetchRank } from "./fetch";
import { getRank, getRankByDates, getRankRatioByDate, saveRank } from "./mysql";
import { getListByBv } from "../video/mysql";
import { getDays, toInt, yesterday } from "../../util";
import { $date } from "../../util/date";
import dayjs from "dayjs";

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
    return { value: i.COUNT_IN_0, name: +i.RID === +RankId.全站 ? '其他' : RankId[i.RID] }
  })
  $data.sort((a, b) => a.value - b.value)
  return success($data)
}

export const getRatioInWeek: Action = async () => {
  const end = dayjs().subtract(1, "day")
  const start = end.subtract(7, 'day')
  const day = getDays(start, end);
  const [e, list] = await getRankByDates(day);
  const data: Type.Obj<{ date: string, value: number | null }[]> = {}
  day.forEach(date => {
    list.filter(i => i.DATE === date).forEach(item => {
      const { RID, COUNT_IN_0 } = item
      const name = +RID === +RankId.全站 ? '其他' : RankId[RID]
      if (!data[name]) {
        data[name] = []
      }
      data[name]!.push({ date, value: COUNT_IN_0 || 0 })
    })
  })
  return e ? error(ErrRank.获取排行榜失败, e.message) : success(data)
}