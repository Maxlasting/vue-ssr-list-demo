import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import { createStore } from './store'
// 会将路由中 path params query 这3个参数组成的 route 对象同步到 store 中
import { sync } from 'vuex-router-sync'

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

import Meta from 'vue-meta'

Vue.use(Vuetify)
Vue.use(Meta)

// 去掉生产环境的提示信息
Vue.config.productionTip = false

export const createApp = () => {
  const store = createStore()
  const router = createRouter()

  sync(store, router)

  const app = new Vue({
    router,
    store,
    render: h => h(App)
  })

  return { app, router, store }
}