import { getAllVideoInFans } from "../video_fans/mysql";
import { getListById } from "../video/mysql";
import dayjs from "dayjs";
import { apiLog } from "../../util/log";
import { VideoLogSql, VideoSqlBase_ } from "../../tools/mysql/type";
import { sleep } from "../../util";
import { saveVideoLog } from "./mysql";
import { postUpdated } from "../video/api";

export const videoLogTask = async () => {
  const [, allList] = await getAllVideoInFans();
  const date = dayjs().startOf('date').valueOf()
  if (allList && allList.length) {
    const [err, list] = await getListById<{ BVID: string, ID: number }>(allList, ['bvid','id']);
    if (err) return apiLog().error(err.message)
    for (const item of list!) {
      const { ID, BVID } = item
      const res = await postUpdated({ bv: BVID, noCache: true })
      const { data } = res.json.body
      if (data) {
        const { view, danmaku, reply, like, coin } = data as VideoSqlBase_
        const log: VideoLogSql = { view, danmaku, reply, like, coin, video_id: ID, date }
        const sql = await saveVideoLog(log)
        if (sql[0]) {
          apiLog().error(sql[0].message)
        }
      }
      await sleep(3000)
    }
  }
}