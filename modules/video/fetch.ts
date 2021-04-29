import { PRes } from "../../type";
import { BangumiVideoSql, NormalVideoSql, VideoSql } from "../../tools/mysql/type";
import { apiBvHtml, apiPgcInfo } from "../../crawler/video";
import { BangumiVideo, NormalVideo } from "./type";
import { sleep } from "../../util";

export const fetchVideo = async (bv: string): PRes<VideoSql> => {
  await sleep(2000)
  const [e1, text] = await apiBvHtml(bv)
  if (e1) return [e1, null]
  if (text!.match(/视频不见了/)) return [null, { type: 'deleted', bvid: bv }]
  const match = text!.match(/window.__INITIAL_STATE__=(.*]});/)
  if (!match) return [new Error(`b站匹配INITIAL_STATE失败,bv:${ bv }`), null]
  let json: NormalVideo | BangumiVideo | null = null
  try {
    json = JSON.parse(match[1]) as NormalVideo | BangumiVideo
  } catch (e) {
    return [new Error(`b站解析INITIAL_STATE失败,bv:${ bv },json解析失败`), null]
  }
  if (!json) return [new Error(`b站解析INITIAL_STATE失败,bv:${ bv },json解析失败`), null]
  if ("videoData" in json) {
    //普通视频
    const {
      videoData: {
        stat: { view, danmaku, reply, favorite, coin, share, like, },
        bvid, aid, title, pic, pubdate, desc,
      }, upData: { name, mid }
    } = json
    const normalBv: NormalVideoSql = {
      up_mid: +mid, up_name: name, bvid,
      aid, title, pic, pubdate, desc, view, danmaku,
      reply, favorite, coin, share, like, type: 'normal'
    }
    return [null, normalBv]
  } else if ('mediaInfo' in json) {
    const { h1Title: title, epInfo: { id, aid, bvid, cover: pic }, mediaInfo: { up_info } } = json
    const [err, info] = await apiPgcInfo(id + '')
    if (err) return [err, null]
    const { data: { stat } } = info!
    const { coin, dm: danmaku, like, reply, view } = stat
    const bangumiBv: BangumiVideoSql = {
      aid, bvid, epId: id,
      title,
      type: 'bangumi',
      coin,
      danmaku,
      like,
      reply,
      view,
      pic,
      up_name: up_info.uname,
      up_mid: up_info.mid
    }
    return [null, bangumiBv]
  } else {
    return [new Error(`b站解析INITIAL_STATE失败,bv:${ bv }`), null]
  }
}