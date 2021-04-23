import { BiliBiliApi } from "./index";
import { api } from "../tools/axios";

export interface Ranking {
  bvid: string
  owner: {
    mid: number
  }
}

export enum RankId {
  全站 = 0,
  动画 = 1,
  音乐 = 3,
  舞蹈 = 129,
  游戏 = 4,
  知识 = 36,
  数码 = 188,
  生活 = 160,
  美食 = 211,
  动物 = 217,
  鬼畜 = 119,
  时尚 = 155,
  娱乐 = 5,
  影视 = 181,
}

export const apiRank = (rid: RankId) =>
    api.$<BiliBiliApi<{ list: Ranking[] }>>('web-interface/ranking/v2', {
      rid,
      type: 'all'
    })