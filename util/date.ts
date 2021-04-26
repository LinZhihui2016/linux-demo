import dayjs from "dayjs";

enum DateFormatType {
  f0 = "YYYY-MM-DD",
  f1 = "mm:ss",
  f2 = "YYYY-MM",
  f3 = "YYYY-MM-DD HH:mm",
  f4 = "YYYY-MM-DD HH:mm:ss",
  f5 = "MM-DD HH:mm",
  f6 = "HH:mm:ss",
  f7 = "HH点MM分ss秒 SSS毫秒",
  f9 = "YYYYMM",
  f10 = "MM月DD日",
  f11 = "YYYY-MM-DD HH:00",
  f12 = "YYYY-MM-DD T HH:mm:ss",
  f13 = ""
}

export const $date = (date: Date | string | number = new Date(), type = 0): string => {
  const t = typeof date === "number" ? new Date(date) : date;
  if (!t) {
    return "";
  }
  let _type = type;
  if (type === 13) {
    _type = 0;
  }
  const key = `f${ _type }`;
  let format = dayjs(t).format(
      DateFormatType[key as keyof typeof DateFormatType]
  );
  if (type === 13) {
    format += " " + $weekday(t);
  }
  return format;
};
export const $weekday = (date: Date | string | number) =>
    "周" + "日一二三四五六"[dayjs(date).day()];
