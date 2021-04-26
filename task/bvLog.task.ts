import { fansList } from "../model/bv.model";
import { apiLog } from "../util/log";
import { VideoLogSql, VideoSqlBase } from "../tools/mysql/type";
import dayjs from "dayjs";
import { postAdd } from "../api/bv";
import { saveBvLog } from "../model/bvLog.model";
import { sleep } from "../util";

export const bvLog = async () => {
  const [err, fans] = await fansList<{ ID: number, BVID: string }>().select(['id', 'bvid']).find()
  const date = dayjs().startOf('date').valueOf()
  if (err) return apiLog().error(err.message)
  for (const item of fans) {
    const { ID, BVID } = item
    const res = await postAdd({ bv: BVID, noCache: true })
    const { data } = res.json.body
    if (data) {
      const { view, danmaku, reply, like, coin } = data.bvObj as VideoSqlBase
      const log: VideoLogSql = { view, danmaku, reply, like, coin, video_id: ID, date }
      const sql = await saveBvLog(log)
      if (sql[0]) {
        apiLog().error(sql[0].message)
      }
    }
    await sleep(3000)
  }
}
