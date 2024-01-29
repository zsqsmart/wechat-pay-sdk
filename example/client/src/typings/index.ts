import type { WechatTradeStateEnum } from '@pay/wechat';

export interface Order {
  product: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  codeUrl: string;
  id: string;
  status: WechatTradeStateEnum;
}
export interface Product {
  name: string;
  cover: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface OrderWithProduct extends Omit<Order, 'product'> {
  product: Product;
}
