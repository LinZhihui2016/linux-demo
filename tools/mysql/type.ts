import { Type } from "../../type";
import { RankId } from "../../crawler/ranking";

export interface ListQuery {
  page?: string,
  pageSize?: string,
  orderby?: 'ASC' | 'DESC',
  sort?: string
}

export interface VideoSqlBase extends Type.Obj {
  bvid: string,
}

export interface VideoSqlBase_ extends VideoSqlBase {
  aid: number,
  title: string,
  pic: string,
  views: number,
  danmaku: number
  reply: number,
  coin: number,
  likes: number
  up_mid: number,
  up_name: string
  updated?: string
  created?: string
  isFans?: number
}

export interface NormalVideoSql extends VideoSqlBase_ {
  type: 'normal',
  favorite: number,
  share: number,
  pubdate: number
  desc: string
}

export interface BangumiVideoSql extends VideoSqlBase_ {
  type: 'bangumi',
  epId: number //bangumi
}

export interface DeletedVideoSql extends VideoSqlBase {
  type: 'deleted',
}

export type VideoSql = NormalVideoSql | BangumiVideoSql | DeletedVideoSql

export interface RankSql extends Type.Obj {
  updated?: string
  created?: string
  id?: number
  rid: RankId
  date: string
  list: string
  ups: string
  count_in_0: number
}

export interface UpSql extends Type.Obj {
  name: string,
  sign: string,
  face: string,
  mid: number,
  follower: number,
  archive: number,
  likes: number,
  id?: number
  updated?: string
  created?: string
}

export interface VideoLogSql extends Type.Obj {
  updated?: string
  created?: string
  id?: number
  views: number,
  danmaku: number
  reply: number,
  coin: number,
  likes: number
  video_id: number
  date: number
}

export interface UpLogSql extends Type.Obj {
  updated?: string
  created?: string
  id?: number
  up_id: number
  date: number
  follower: number,
  archive: number,
  likes: number,
}