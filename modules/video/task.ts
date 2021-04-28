import { handleTaskLv2, videoTaskLv0, videoTaskLv1 } from "./redis";
import { getVideo } from "./mysql";
import { postCreated } from "./api";
import { sleep } from "../../util";

let errorTime = 0
export const videoTask = async (): Promise<void> => {
  const [, bvid] = await videoTaskLv0().shift()
  if (!bvid) {
    //0级仓库空了，准备把1级仓库放入0级
    const [e, len] = await handleTaskLv2()
    if (e || !len) return
    if (len) return await videoTask()
  }
  const [e] = await getVideo(bvid)
  //mysql里存在，不准备添加
  if (!e) return await videoTask()
  await videoTaskLv1().calc(bvid)
  const [, time] = await videoTaskLv1().get(bvid)
  if ((time && +time <= 5)) {
    const res = await postCreated({ bv: bvid })
    const { err } = res.json.body
    if (err) {
      errorTime++
      if (errorTime >= 20) {
        errorTime = 0;
        await sleep(1000 * 60 * 10)
      }
    } else {
      await videoTaskLv1().del(bvid)
    }
    await sleep(2000)
  }
  await videoTask()
}