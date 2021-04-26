import { fansList } from "../model/up.model";
import dayjs from "dayjs";
import { apiLog } from "../util/log";
import { sleep } from "../util";
import { postAdd } from "../api/up";
import { UpLogSql, UpSql } from "../tools/mysql/type";
import { saveUpLog } from "../model/upLog.model";

export const upLog = async () => {
  const [err, fans] = await fansList<{ ID: number, MID: number }>().select(['id', 'mid']).find()
  const date = dayjs().startOf('date').valueOf()
  if (err) return apiLog().error(err.message)
  for (const item of fans) {
    const { ID, MID } = item
    const res = await postAdd({ mid: MID, noCache: true })
    const { data } = res.json.body
    if (data) {
      const { follower, archive, likes } = data.up as UpSql
      const log: UpLogSql = { follower, archive, likes, up_id: ID, date }
      const sql = await saveUpLog(log)
      if (sql[0]) {
        apiLog().error(sql[0].message)
      }
    }
    await sleep(3000)
  }
}