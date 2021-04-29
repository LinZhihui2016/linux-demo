import { handleTaskLv2, videoTaskLv0, videoTaskLv1 } from "./redis";
import { getListByUpdated } from "./mysql";
import { sleep } from "../../util";
import { createdAndUpdated } from "./helper";

let errorTime = 0
export const videoTask = async (): Promise<void> => {
  const [, bvid] = await videoTaskLv0().shift()
  if (!bvid) {
    //0级仓库空了，准备把1级仓库放入0级
    const [e, len] = await handleTaskLv2()
    if (e || !len) {
      //1级仓库还是空的,开始轮回
      const [, video] = await getListByUpdated(10, 'ASC')
      await videoTaskLv0().push((video || []).map(i => i.bvid))
      await sleep(1000 * 60)
      return await videoTask()
    }
    if (len) return await videoTask()
  }
  await videoTaskLv1().calc(bvid)
  const [, time] = await videoTaskLv1().get(bvid)
  if ((time && +time <= 5)) {
    const [err] = await createdAndUpdated(bvid)
    if (err) {
      errorTime++
      if (errorTime >= 20) {
        errorTime = 0;
        await sleep(1000 * 60 * 10)
      }
    } else {
      await videoTaskLv1().del(bvid)
    }
  }
  await videoTask()
}