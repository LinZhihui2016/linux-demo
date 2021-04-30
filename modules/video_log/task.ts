import { getAllVideoInFans } from "../video_fans/mysql";
import { getListById } from "../video/mysql";
import dayjs from "dayjs";
import { apiLog } from "../../util/log";
import { VideoLogSql, VideoSqlBase_ } from "../../tools/mysql/type";
import { saveVideoLog } from "./mysql";
import { createdAndUpdated } from "../video/helper";
import { sleep } from "../../util";

export const videoLogTask = async () => {
  const [, allList] = await getAllVideoInFans();
  const date = dayjs().startOf('date').valueOf()
  if (allList && allList.length) {
    const [err, list] = await getListById<{ BVID: string, ID: number }>(allList, ['bvid', 'id']);
    if (err) return apiLog().error(err.message)
    for (const item of list!) {
      await sleep(2000)
      const { ID, BVID } = item
      const [, data] = await createdAndUpdated(BVID, true)
      if (data) {
        const { view, danmaku, reply, like, coin } = data as VideoSqlBase_
        const log: VideoLogSql = { view, danmaku, reply, like, coin, video_id: ID, date }
        const sql = await saveVideoLog(log)
        if (sql[0]) {
          apiLog().error(sql[0].message)
        }
      }
    }
  }
}