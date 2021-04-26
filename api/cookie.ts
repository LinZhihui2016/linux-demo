import { Action } from "../type";
import { $redis } from "../tools/redis";
import { ErrBase } from "../util/error";
import { error, success } from "../helper";

export const postSet: Action<{ cookie: string }> = async ({ cookie }) => {
  const [err] = await $redis.str.set({ [['bilibili', 'cookie'].join(':')]: cookie })
  if (err) {
    return error(ErrBase.redis写入失败)
  } else {
    return success('cookie保存成功')
  }
}