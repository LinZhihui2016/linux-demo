import { apiRank, RankId } from "../../crawler/ranking";
import { apiLog } from "../../util/log";
import { PRes } from "../../type";
import { upSetAdd } from "../up/redis";
import { videoSetAdd } from "../video/redis";

export const fetchRank = async (rid: RankId): PRes<{ upList: string[], bvList: string[] }> => {
  const [e, res] = await apiRank(rid)
  if (e) return [e, null]
  if (res && res.data) {
    const { data: { list } } = res
    const bvList = list.map(i => i.bvid)
    const upList = list.map(i => i.owner ? i.owner.mid + '' : '').filter(Boolean)
    await upSetAdd(upList, 'storage')
    await videoSetAdd(bvList, 'storage')
    return [null, { bvList, upList }]
  } else {
    apiLog().error(rid + ' 没有列表')
    return [new Error(rid + '没有列表'), null]
  }
}