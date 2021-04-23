import { Action } from "../type";
import { $redis } from "../tools/redis";
import { Err } from "../util/error";
import { error, success } from "../helper";

export const postSet: Action<{ cookie: string }> = async ({ cookie }) => {
  const [err] = await $redis.str.set({ [['bilibili', 'cookie'].join(':')]: cookie })
  if (err) {
    return error(Err.redis写入失败)
  } else {
    return success('cookie保存成功')
  }
}