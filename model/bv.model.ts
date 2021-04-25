import { PRes } from "../type";
import { apiBvHtml, apiPgcInfo } from "../crawler/bv";
import { sleep } from "../util";
import { Where } from "../tools/mysql/where";
import { $mysql } from "../tools/mysql";
import { postAdd } from "../api/bv";
import { BangumiVideoSql, NormalVideoSql, VideoSql } from "../tools/mysql/type";
import { $redis, redisTask } from "../tools/redis";

export interface NormalVideo {
  videoData: {
    bvid: string,
    aid: number,
    title: string,
    pic: string,
    pubdate: number //发布时间
    desc: string
    stat: {
      view: number,
      danmaku: number,
      reply: number,
      favorite: number,
      coin: number,
      share: number,
      like: number
    }
  },
  upData: {
    mid: string,
    name: string
  }
}

export interface BangumiVideo {
  h1Title: string,
  epInfo: {
    id: number,
    aid: number,
    bvid: string,
    cover: string
  },
  mediaInfo: {
    up_info: {
      uname: string,
      mid: number
    }
  }
}


export const fetchBv = async (bv: string, count = 0): PRes<VideoSql> => {
  const [e1, text] = await apiBvHtml(bv)
  if (e1) {
    await sleep(3000)
    if (count < 3) {
      return fetchBv(bv, count + 1)
    } else {
      await $redis.getHash(redisTask('video', 1)).calc(bv)
      return [e1, null]
    }
  }
  if (text!.match(/视频不见了/)) {
    return [null, { type: 'deleted', bvid: bv }]
  }
  const match = text!.match(/window.__INITIAL_STATE__=(.*]});/)

  if (!match) return [new Error(`b站匹配INITIAL_STATE失败,bv:${ bv }`), null]
  let json: NormalVideo | BangumiVideo | null = null
  try {
    json = JSON.parse(match[1]) as NormalVideo | BangumiVideo

  } catch (e) {
    return [new Error(`b站解析INITIAL_STATE失败,bv:${ bv },json解析失败`), null]
  }
  if (!json) {
    return [new Error(`b站解析INITIAL_STATE失败,bv:${ bv },json解析失败`), null]
  }

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
      reply, favorite, coin, share, like, type: 'normal', isFans: 0
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
      isFans: 0,
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

export const saveBv = async (bv: VideoSql) => {
  const where = new Where().eq('bvid', bv.bvid)
  const [err, data] = await $mysql.query<VideoSql>('video').select('bvid').where(where).find()
  if (err) return [err, null]
  return $mysql.$('video', bv, data.length > 0 ? where : undefined)
}

export const addBvList = async (list: string[]) => {
  for (const bv of list) {
    await postAdd({ bv, noCache: false })
  }
}