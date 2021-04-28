import { RankId } from "../../crawler/ranking";
import { PRes } from "../../type";
import { apiLog } from "../../util/log";
import { postUpdate } from "./api";
import { getTodayList } from "./mysql";
import { videoTaskLv0 } from "../video/redis";

const helper = async (rid: RankId, retry = 0): PRes<string> => {
  const res = await postUpdate({ noCache: false, rid: rid as unknown as RankId })
  const { err, msg } = res.json.body
  if (err) {
    const m = [err, msg].join('|')
    apiLog().error(m)
    return retry < 3 ? helper(rid, retry + 1) : [new Error(m), null]
  } else {
    apiLog().info(rid + ' OK')
    return [null, 'OK']
  }
}
export const rankDailyTask = async () => {
  const rankIdList = Object.keys(RankId).filter(i => /^[0-9]*$/.test(i))
  for (const rid of rankIdList) {
    await helper(rid as unknown as RankId)
  }
}

export const pushTodayBv = async () => {
  const [, list] = await getTodayList()
  if (list) {
    for (const i of list) {
      await videoTaskLv0().push(i)
    }
  }
}