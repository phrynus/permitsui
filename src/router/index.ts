import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
// 框架
import Index from '~/layouts/Index.vue';
//
import HomeView from '~/views/HomeView.vue';

import { userestStore } from '@/stores/rest';

const router = createRouter({
  // hash 模式
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Index,
      children: [
        {
          path: '',
          component: HomeView,
        },
        {
          // 匹配id
          path: 'token/:token',
          // 动态载入
          component: () => import('~/views/MouldView.vue'),
        },
      ],
    },
  ],
});
router.beforeEach((to, from, next) => {
  // const { token }: any = userestStore();
  // console.log(token);
  // if (!token && to.path !== "/login") {
  //   next("/login");
  // } else {
  //   next();
  // }
  next();
});
export default router;
