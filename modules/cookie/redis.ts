import { $redis } from "../../tools/redis";

export const setCookie = (cookie: string) => {
  return $redis.str.set({ [['bilibili', 'cookie'].join(':')]: cookie })
}