import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/product', component: () => import('../pages/product/index') },
  { path: '/order', component: () => import('../pages/order/index') },
  { path: '/:pathMatch(.*)*', redirect: '/product' },
];

export const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHistory(),
  routes, // `routes: routes` 的缩写
});
