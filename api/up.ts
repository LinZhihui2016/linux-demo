import { Action } from "../type";
import { Res } from "../helper";

export const addAction: Action<{ mid: string }> = async ({ mid }) => {
  return new Res().success(mid)
}

export const updateAction: Action = async () => {
  return new Res().success('1')
}