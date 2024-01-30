import type { Order, OrderWithProduct } from 'src/typings';
import { request } from 'src/utils/request';

// 创建订单
export const reqCreateOrder = (data: { product: string; amount: number }) =>
  request.Post<Order>('/order', data);

// 查询订单状态
export const reqOrderStatus = (id: string) =>
  request.Get<{ status: string }>(`/order/${id}/status`, {
    cache: 'no-cache',
    localCache: {
      expire: 0,
    },
  });

// 查询订单列表
export const reqOrderList = () =>
  request.Get<OrderWithProduct[]>(`/order`, {
    cache: 'no-cache',
    localCache: {
      expire: 0,
    },
  });

// 关系订单
export const reqCloseOrder = (orderId: string) =>
  request.Patch(`/order/${orderId}/close`);
