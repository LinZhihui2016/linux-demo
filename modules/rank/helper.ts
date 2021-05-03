import { RankId } from "../../crawler/ranking";
import { $mysql } from "../../tools/mysql";
import { Where } from "../../tools/mysql/where";
import { RankSql } from "../../tools/mysql/type";
import { $date } from "../../util/date";

export const countRank = async (rankList: RankSql[], date: string = $date(new Date())) => {
  const mainRid = RankId["全站"] + ''
  let mainList: string[] = []
  const map = new Map<string, string[]>()
  rankList.forEach(({ rid, list }) => {
    if (rid + '' !== mainRid) {
      map.set(rid + '', list.split(','))
    } else {
      mainList = list.split(',')
    }
  })
  const countMap = new Map<string, number>()
  map.forEach((list, rid) => {
    countMap.set(rid, list.filter(bv => mainList.includes(bv)).length)
  })
  let j = 100;
  for (const i of countMap) {
    const [rid, count_in_0] = i
    j = j - count_in_0
    await $mysql.update('video_rank', { count_in_0 }, new Where().eq('date', date).eq('rid', rid))
  }

  await $mysql.update('video_rank', { count_in_0: j }, new Where().eq('date', date).eq('rid', mainRid))
}