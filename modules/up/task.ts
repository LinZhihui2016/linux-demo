import { handleTaskLv2, upTaskLv0, upTaskLv1 } from "./redis";
import { sleep } from "../../util";
import { getListByUpdated } from "./mysql";
import { createdAndUpdated } from "./helper";

let errorTime = 0
export const upTask = async (): Promise<void> => {
  const [, mid] = await upTaskLv0().shift()
  if (!mid) {
    //0级仓库空了，准备把1级仓库放入0级
    const [e, len] = await handleTaskLv2()
    if (e || !len) {
      //1级仓库还是空的,开始轮回
      const [, up] = await getListByUpdated(10, 'ASC')
      await upTaskLv0().push((up || []).map(i => i.mid + ''))
      await sleep(1000 * 60)
      return await upTask()
    }
    if (len) return await upTask()
  }
  await upTaskLv1().calc(mid)
  const [, time] = await upTaskLv1().get(mid)
  if ((time && +time <= 5)) {
    const [err] = await createdAndUpdated(+mid)
    if (err) {
      errorTime++
      if (errorTime >= 20) {
        errorTime = 0;
        await sleep(1000 * 60 * 10)
      }
    } else {
      await upTaskLv1().del(mid)
    }
  }
  await upTask()
}