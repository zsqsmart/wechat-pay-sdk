import { createAlova } from 'alova';
import GlobalFetch from 'alova/GlobalFetch';
import VueHook from 'alova/vue';

// 1. 创建alova实例
export const request = createAlova({
  baseURL: '/api/v1',
  // VueHook用于创建ref状态，包括请求状态loading、响应数据data、请求错误对象error等
  statesHook: VueHook,
  timeout: 10000,
  // 请求适配器，推荐使用fetch请求适配器
  requestAdapter: GlobalFetch(),

  // 全局的响应拦截器
  responded: (response) => response.json(),

  beforeRequest(method) {
    method.config.headers['Content-Type'] =
      method.config.headers['Content-Type'] || 'application/json;charset=UTF-8';
  },
});
