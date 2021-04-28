import { Action } from "../../type";
import { setCookie } from "./redis";
import { error, success } from "../../helper";
import { ErrBase } from "../../util/error";

export const postSet: Action<{ cookie: string }> = async ({ cookie }) => {
  const [err] = await setCookie(cookie)
  if (err) {
    return error(ErrBase.redis写入失败)
  } else {
    return success('cookie保存成功')
  }
}