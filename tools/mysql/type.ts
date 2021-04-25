import { Type } from "../../type";

export interface VideoSqlBase extends Type.Obj {
  bvid: string,
  aid: number,
  title: string,
  pic: string,
  view: number,
  danmaku: number
  reply: number,
  coin: number,
  like: number
  up_mid: number,
  up_name: string
  updated?: string
  created?: string
  isFans: number
}

export interface NormalVideoSql extends VideoSqlBase {
  type: 'normal',
  favorite: number,
  share: number,
  pubdate: number
  desc: string
}

export interface BangumiVideoSql extends VideoSqlBase {
  type: 'bangumi',
  epId: number //bangumi
}

export type VideoSql = NormalVideoSql | BangumiVideoSql