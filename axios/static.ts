import { AxiosRequestConfig } from "axios";

export const cookie = '_uuid=AA41B533-6903-068A-607F-A082B8F0133B36845infoc; buvid3=99386200-1DE0-4D40-AEAA-5DB025952B70143079infoc; sid=ct8nqr2d; blackside_state=1; rpdid=|(umYR)|JJkJ0J\'ulmmlk~J)); CURRENT_FNVAL=80; LIVE_BUVID=AUTO6815998397262295; CURRENT_QUALITY=120; buivd_fp=99386200-1DE0-4D40-AEAA-5DB025952B70143079infoc; buvid_fp=99386200-1DE0-4D40-AEAA-5DB025952B70143079infoc; AMCV_98CF678254E93B1B0A4C98A5%40AdobeOrg=359503849%7CMCIDTS%7C18667%7CMCMID%7C77930416944144758461355530286652327256%7CMCAAMLH-1613351157%7C11%7CMCAAMB-1613351157%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1612753557s%7CNONE%7CvVersion%7C5.0.1; fingerprint3=c0c21110fa3c7fbf24deea8431025e3d; bsource=search_baidu; fingerprint_s=c471df1cf63670cb8111b27bb053c69d; PVID=1; bp_video_offset_5213161=513404018156619049; bp_t_offset_5213161=513404018156619049; bfe_id=6f285c892d9d3c1f8f020adad8bed553; fingerprint=5f5ea626d49828bbc8296cc06928043e; buvid_fp_plain=25D1424D-0ABE-48C4-B9D7-A7565DE0D28B18568infoc; DedeUserID=5213161; DedeUserID__ckMd5=426a9e940246e7aa; SESSDATA=d642c70e%2C1633940074%2C4c447*41; bili_jct=7dbc31fca8363eb6e5708f228b29a753'

export const AXIOS_OPTION: (baseURL: string) => AxiosRequestConfig = (baseURL: string) => ({
  baseURL,
  headers: {
    cookie,
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  },
  withCredentials: true,
  timeout: 30000
});
