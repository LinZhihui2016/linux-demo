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