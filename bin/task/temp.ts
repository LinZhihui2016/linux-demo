import { scriptStart } from "../../helper";
import { $mysql } from "../../tools/mysql";
import { RankSql } from "../../tools/mysql/type";
import { Where } from "../../tools/mysql/where";
import { RankId } from "../../crawler/ranking";

const temp = async () => {
  const datesQuery = await $mysql.query<{ DATE: string }>('video_rank').distinct(true).select('date').find()
  const dates = datesQuery[1]!.map(i => i.DATE)
  for (const date of dates) {
    const query = await $mysql.query<RankSql>('video_rank').where(new Where().eq('date', date)).find()
    const mainRid = RankId["全站"] + ''
    let mainList: string[] = []
    const map = new Map<string, string[]>()
    query[1].forEach(({ rid, list }) => {
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
    for (const i of countMap) {
      const [rid, count_in_0] = i
      await $mysql.update('video_rank', { count_in_0 }, new Where().eq('date', date).eq('rid', rid))
    }
    await $mysql.update('video_rank', { count_in_0: -1 }, new Where().eq('date', date).eq('rid', mainRid))

  }
}
scriptStart(temp)
