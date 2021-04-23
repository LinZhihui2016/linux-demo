import { PRes, Type } from "../type";
import { apiBvHtml } from "../crawler/bv";
import { sleep, transWan } from "../util";
import cheerio from "cheerio";
import { Where } from "../tools/mysql/where";
import { $mysql } from "../tools/mysql";
import { Up } from "./up.model";
import { $date } from "../util/date";
import { postAdd } from "../api/bv";

export interface Bv extends Type.Obj {
  bv: string,
  coin: number
  collect: number
  info: string
  like: number
  mid: number
  pic: string
  share: number
  title: string
  view: number
  dm: number
  updated?: string
  uploadTime: string
  id?: number
  isFans: number
  created: string
}

export const fetchBv = async (bv: string, count = 0): PRes<Bv> => {
  const [e1, text] = await apiBvHtml(bv)
  if (e1) {
    await sleep(3000)
    return count < 5 ? fetchBv(bv, count + 1) : [e1, null]
  }
  const $ = cheerio.load(text!)
  const _mid = $('.u-face a').attr('href')  || $('.up-card a.avatar').attr('href')
  if (!_mid) {
    await sleep(3000)
    return count < 5 ? fetchBv(bv, count + 1) : [new Error('捕获mid失败'), null]
  }
  const midMatch = _mid.match(/\/([0-9]*)$/)
  if (!midMatch) {
    await sleep(1000)
    return count < 5 ? fetchBv(bv, count + 1) : [new Error('解析mid失败'), null]
  }
  const title = $('h1 .tit').text().trim()
  const coin = transWan($('.ops .coin').text().trim())
  const collect = transWan($('.ops .collect').text().trim())
  const share = transWan($('.ops .share').text().trim())
  const info = $('#v_desc .info').text().trim()
  const pic = $('head meta[property="og:image"]').attr('content')
  const num = (reg: RegExp, text?: string, init = 0) => {
    const viewMatch = (text || '').match(reg)
    return viewMatch ? +viewMatch[1] : init
  }
  const view = num(/([0-9]*)$/, $('.video-data .view').attr('title'))
  const dm = num(/([0-9]*)$/, $('.video-data .dm').attr('title'))
  const like = num(/([0-9]*)$/, $('.ops .like').attr('title'))
  const uploadTime = $('head meta[itemprop="uploadDate"]').attr('content') || ''

  return [null, {
    bv, title, mid: +midMatch[1], like, coin, collect, share, info, pic: pic ? pic.replace(/https?/, 'https') : '',
    view, dm, uploadTime, isFans: 0, created: $date(new Date(), 4)
  }]
}

export const saveBv = async (bv: Bv) => {
  const where = new Where().eq('bv', bv.bv)
  const [err, data] = await $mysql.query<Up>('video').select('bv').where(where).find()
  if (err) return [err, null]
  return $mysql.$('video', bv, data.length > 0 ? where : undefined)
}

export const addBvList = async (list: string[]) => {
  for (const bv of list) {
    await postAdd({ bv, noCache: false })
  }
}