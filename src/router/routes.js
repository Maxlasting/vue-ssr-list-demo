export default [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "index" */ '../views/index.vue')
  },
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "login" */ '../views/login.vue')
  }
]