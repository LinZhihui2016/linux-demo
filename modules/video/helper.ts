import { VideoSql } from "../../tools/mysql/type";
import { createVideo, getVideoCache, setVideoCache, videoSetAdd } from "./redis";
import { fetchVideo } from "./fetch";
import { saveVideo } from "./mysql";
import { error, Res } from "../../helper";
import { ErrBase } from "../../util/error";
import { PRes } from "../../type";
import { $mysql } from "../../tools/mysql";
import { Where } from "../../tools/mysql/where";
import { infoChalk } from "../../util/chalk";

export const createdAndUpdated = async (bv: string, noCache?: boolean): PRes<VideoSql, Res> => {
  let bvObj: VideoSql | null = null
  //检查redis
  if (!noCache) [, bvObj] = await getVideoCache(bv)
  if (!bvObj) {
    const [, data] = await fetchVideo(bv)
    data && await setVideoCache(data)
    bvObj = data
  }
  if (!bvObj) return [error(ErrBase.b站抓取失败, bv), null]
  const [err] = await saveVideo(bvObj)
  if (err) {
    return [error(ErrBase.mysql写入失败, err.sql), null]
  } else {
    infoChalk(bv + '保存成功')
    await videoSetAdd(bv, 'sql')
    return [null, bvObj]
  }
}

export const checkVideo = async () => {
  const [, list] = await $mysql.query<{ LIST: string }>('video_rank').select('list').find()
  let tar: string[] = []
  list.map(i => i.LIST).map(i => i.split(',')).forEach(i => {
    tar = tar.concat(i)
  })
  const set = new Set(tar)
  let j = 1;
  for (const i of set) {
    j++
    const [, l] = await $mysql.query<{ len: number }>('video').where(new Where().eq('bvid', i)).count().find()
    if (l && l[0].len === 1) {
      set.delete(i)
    }
  }
  await createVideo(Array.from(set))
}