import { NodeFetch } from "./fetch";
import { cookie } from "../axios/static";

export const video = new NodeFetch("https://www.bilibili.com/video", {
  "headers": {
    cookie
  },
  "method": "GET",
})