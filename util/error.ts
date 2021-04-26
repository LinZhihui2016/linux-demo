export enum ErrUp {
  未收录该up主 = 41001,
  关注数量达到上限 = 42001,
  关注列表为空 = 42002
}

export enum ErrVideo {
  未收录该视频 = 51001,
  关注数量达到上限 = 52001,
  关注列表为空 = 52002
}

export enum ErrBase {
  b站抓取失败 = 10001,
  mysql读取失败 = 20001,
  mysql写入失败 = 20002,
  redis读取失败 = 30001,
  redis写入失败 = 30002,
  参数错误 = 1,
}

export type Err = ErrBase | ErrUp | ErrVideo


