import { VideoSql } from "../../tools/mysql/type";
import { getVideoCache, setVideoCache, videoSetAdd } from "./redis";
import { fetchVideo } from "./fetch";
import { saveVideo } from "./mysql";
import { error, Res } from "../../helper";
import { ErrBase } from "../../util/error";
import { PRes } from "../../type";
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

