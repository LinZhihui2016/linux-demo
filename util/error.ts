export enum ErrUp {
  未收录该up主 = 41001,
  已收录该up主 = 41002,
  关注数量达到上限 = 42001,
  关注列表为空 = 42002,
  关注失败 = 42003,
  取消关注失败 = 42004
}

export enum ErrVideo {
  未收录该视频 = 51001,
  已收录该视频 = 51002,
  关注数量达到上限 = 52001,
  关注列表为空 = 52002,
  关注失败 = 52003,
  取消关注失败 = 52004
}

export enum ErrRank {
  获取排行榜失败 = 61001
}

export enum ErrBase {
  b站抓取失败 = 10001,
  mysql读取失败 = 20001,
  mysql写入失败 = 20002,
  redis读取失败 = 30001,
  redis写入失败 = 30002,
  参数错误 = 1,
}

export enum ErrYezi {
  标签操作失败 = 1000001,
  记录操作失败,
  文本过长
}

export type Err = ErrBase | ErrUp | ErrVideo | ErrRank | ErrYezi


