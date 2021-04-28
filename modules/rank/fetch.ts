import { apiRank, RankId } from "../../crawler/ranking";
import { apiLog } from "../../util/log";
import { videoTaskLv0 } from "../video/redis";
import { PRes } from "../../type";

export const fetchRank = async (rid: RankId): PRes<string[]> => {
  const [e, res] = await apiRank(rid)
  if (e) return [e, null]
  if (res && res.data) {
    const { data: { list } } = res
    const bvList = list.map(i => i.bvid)
    // const upList = list.map(i => i.owner.mid)
    await videoTaskLv0().push(bvList)
    return [null, bvList]
  } else {
    apiLog().error(rid + ' 没有列表')
    return [new Error(rid + '没有列表'), null]
  }
}