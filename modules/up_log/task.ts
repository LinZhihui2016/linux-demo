import { getAllUpInFans } from "../up_fans/mysql";
import { getListById } from "../up/mysql";
import dayjs from "dayjs";
import { apiLog } from "../../util/log";
import { UpLogSql, UpSql } from "../../tools/mysql/type";
import { saveUpLog } from "./mysql";
import { createdAndUpdated } from "../up/helper";
import { sleep } from "../../util";

export const upLogTask = async () => {
  const [, allList] = await getAllUpInFans();
  const date = dayjs().startOf('date').valueOf()
  if (allList && allList.length) {
    const [err, list] = await getListById<{ MID: number, ID: number }>(allList, ['mid', 'id']);
    if (err) return apiLog().error(err.message)
    for (const item of list!) {
      await sleep(8000)
      const { ID, MID } = item
      const [, data] = await createdAndUpdated(MID, true)
      if (data) {
        const { follower, archive, likes } = data as UpSql
        const log: UpLogSql = { follower, archive, likes, up_id: ID, date }
        const sql = await saveUpLog(log)
        if (sql[0]) {
          apiLog().error(sql[0].message)
        }
      }
    }
  }
}