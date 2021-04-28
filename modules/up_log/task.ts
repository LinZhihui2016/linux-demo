import { getAllUpInFans } from "../up_fans/mysql";
import { getListById } from "../up/mysql";
import dayjs from "dayjs";
import { apiLog } from "../../util/log";
import { UpLogSql, UpSql } from "../../tools/mysql/type";
import { sleep } from "../../util";
import { saveUpLog } from "./mysql";
import { postUpdated } from "../up/api";

export const upLogTask = async () => {
  const [, allList] = await getAllUpInFans();
  const date = dayjs().startOf('date').valueOf()
  if (allList && allList.length) {
    const [err, list] = await getListById<{ MID: number, ID: number }>(allList, ['mid', 'id']);
    if (err) return apiLog().error(err.message)
    for (const item of list!) {
      const { ID, MID } = item
      const res = await postUpdated({ mid: MID, noCache: true })
      const { data } = res.json.body
      if (data) {
        const { follower, archive, likes } = data as UpSql
        const log: UpLogSql = { follower, archive, likes, up_id: ID, date }
        const sql = await saveUpLog(log)
        if (sql[0]) {
          apiLog().error(sql[0].message)
        }
      }
      await sleep(3000)
    }
  }
}