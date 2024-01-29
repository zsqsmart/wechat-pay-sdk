import { request } from 'src/utils/request';

export interface Product {
  name: string;
  cover: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  id: string;
}

// 产品列表
export const reqProducts = () => request.Get<Product[]>('/product');
