import { RankId } from "../../crawler/ranking";
import { PRes } from "../../type";
import { postUpdate } from "./api";
import { sleep } from "../../util";

const helper = async (rid: RankId, retry = 0): PRes<string> => {
  const res = await postUpdate({ noCache: false, rid: rid as unknown as RankId })
  const { err, msg } = res.json.body
  if (err) {
    const m = [err, msg].join('|')
    return retry < 3 ? helper(rid, retry + 1) : [new Error(m), null]
  } else {
    return [null, 'OK']
  }
}
export const rankDailyTask = async () => {
  const rankIdList = Object.keys(RankId).filter(i => /^[0-9]*$/.test(i))
  for (const rid of rankIdList) {
    await sleep(2000)
    await helper(rid as unknown as RankId)
  }
}
