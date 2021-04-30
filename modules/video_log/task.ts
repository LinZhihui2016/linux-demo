import { getAllVideoInFans } from "../video_fans/mysql";
import { getListById } from "../video/mysql";
import dayjs from "dayjs";
import { VideoLogSql, VideoSqlBase_ } from "../../tools/mysql/type";
import { saveVideoLog } from "./mysql";
import { createdAndUpdated } from "../video/helper";
import { sleep } from "../../util";
import { getTaskLock } from "../../tools/redis";

export const videoLogTask = async () => {
  const lock = await getTaskLock('video')
  if (lock) await sleep(1000 * 60 * 60 *2)
  const [, allList] = await getAllVideoInFans();
  const date = dayjs().startOf('date').valueOf()
  if (allList && allList.length) {
    const [err, list] = await getListById<{ BVID: string, ID: number }>(allList, ['bvid', 'id']);
    if (err) return
    for (const item of list!) {
      await sleep(2000)
      const { ID, BVID } = item
      const [, data] = await createdAndUpdated(BVID, true)
      if (data) {
        const { view, danmaku, reply, like, coin } = data as VideoSqlBase_
        const log: VideoLogSql = { view, danmaku, reply, like, coin, video_id: ID, date }
        await saveVideoLog(log)
      }
    }
  }
}