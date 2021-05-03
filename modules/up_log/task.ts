import { getAllUpInFans } from "../up_fans/mysql";
import { getListById } from "../up/mysql";
import dayjs from "dayjs";
import { UpLogSql, UpSql } from "../../tools/mysql/type";
import { saveUpLog } from "./mysql";
import { createdAndUpdated } from "../up/helper";
import { sleep } from "../../util";
import { getTaskLock } from "../../tools/redis";

export const upLogTask = async () => {
  const lock = await getTaskLock('up')
  if (lock) await sleep(1000 * 60 * 60 *2)
  const [, allList] = await getAllUpInFans();
  const date = dayjs().startOf('date').valueOf()
  if (allList && allList.length) {
    const [err, list] = await getListById<{ MID: number, ID: number }>(allList, ['mid', 'id']);
    if (err) return
    for (const item of list!) {
      await sleep(10000)
      const { ID, MID } = item
      const [, data] = await createdAndUpdated(MID, true)
      if (data) {
        const { follower, archive, likes } = data as UpSql
        const log: UpLogSql = { follower, archive, likes, up_id: ID, date }
        await saveUpLog(log)
      }
    }
  }
}