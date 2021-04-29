import { handleTaskLv2, upTaskLv0, upTaskLv1 } from "./redis";
import { sleep } from "../../util";
import { getListByUpdated, getUp } from "./mysql";
import { postCreated } from "./api";

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
      return await upTask()
    }
    if (len) return await upTask()
  }
  const [e] = await getUp(+mid)
  //mysql里存在，不准备添加
  if (!e) return await upTask()
  await upTaskLv1().calc(mid)
  const [, time] = await upTaskLv1().get(mid)
  if ((time && +time <= 5)) {
    const res = await postCreated({ mid: +mid })
    const { err } = res.json.body
    if (err) {
      errorTime++
      if (errorTime >= 20) {
        errorTime = 0;
        await sleep(1000 * 60 * 10)
      }
    } else {
      await upTaskLv1().del(mid)
    }
    await sleep(5000)
  }
  await upTask()
}