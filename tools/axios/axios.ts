import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { errorLog } from "../log4js/log";
import axiosRetry from "axios-retry";
import { PRes, Type } from "../../type";
import { ajaxChalk } from "../../util/chalk";
import { $redis } from "../redis";
import qs from "qs";

export default class NodeAxios {
  axiosInstance: AxiosInstance;
  private readonly options: AxiosRequestConfig;

  constructor(
      options: AxiosRequestConfig,
  ) {
    this.options = options;
    this.axiosInstance = Axios.create({ ...options });
    axiosRetry(this.axiosInstance,
        {
          retries: 3,
          shouldResetTimeout: true,
          retryDelay: () => 5000,
          retryCondition: (error) => {
            errorLog(error.config.url + ' retry')
            return true
          }
        })
    this.interceptors()
  }

  interceptors() {
    this.axiosInstance.interceptors.request.use(async req => {
      const cookie = (await $redis.str.get(['bilibili', 'cookie'].join(':')))[1] || ''
      req.headers = {
        ...req.headers,
        cookie
      }
      ajaxChalk('axios：' + req.baseURL + '/' + req.url + '?' + qs.stringify(req.params))
      return req
    })
    this.axiosInstance.interceptors.response.use(res => {
      return res
    }, err => {
      if (err.isAxiosError) {
        const { url } = err.config
        try {
          const retryState = err.config['axios-retry']
          errorLog(`${ url }第${ retryState.retryCount }次错误：${ err.response.status } ${ err.message }`)
        } catch (e) {
          errorLog(`${ url } ${ err.response.status } ${ err.message }`)
        }
      } else {
        errorLog(err.message)
      }
      return Promise.reject(err)
    })
  }

  $ = async <T>(
      url: string,
      data?: Type.Obj<string | number | undefined>,
      opt?: AxiosRequestConfig
  ): PRes<T> => {
    const {
      method = "GET",
    } = opt || {};
    return new Promise((resolve => {
      this.axiosInstance
          .request<T>({
            ...opt,
            url,
            method,
            params: method === "GET" ? data : {},
            data: method !== "GET" ? data : {}
          })
          .then(
              res => resolve([null, res.data]),
          ).catch(err => resolve([err, null]))
    }))
  };
}

