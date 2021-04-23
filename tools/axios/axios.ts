import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { apiLog } from "../../util/log";
import { sleep } from "../../util";
import axiosRetry from "axios-retry";
import { PRes, Type } from "../../type";
import { ajaxLog } from "../../util/chalk";

export default class NodeAxios {
  axiosInstance: AxiosInstance;
  private readonly options: AxiosRequestConfig;
  shouldSleep = false

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
            this.shouldSleep = true
            apiLog().error(error.config.url + ' retry')
            return true
          }
        })
    this.interceptors()
  }

  interceptors() {
    this.axiosInstance.interceptors.request.use(req => {
      ajaxLog('axios：' + req.baseURL + '/' + req.url)
      return req
    })
    this.axiosInstance.interceptors.response.use(res => {
      this.shouldSleep = false
      return res
    }, err => {
      if (err.isAxiosError) {
        const { url } = err.config
        try {
          const retryState = err.config['axios-retry']
          apiLog().error(`${ url }第${ retryState.retryCount }次错误：${ err.response.status } ${ err.message }`)
        } catch (e) {
          apiLog().error(`${ url } ${ err.response.status } ${ err.message }`)
        }
      } else {
        apiLog().error(err.message)
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
    await sleep(this.shouldSleep ? 5000 : 1000)
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

