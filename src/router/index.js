import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Market from '@/components/Market'
import Siring from '@/components/Siring'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/market',
      name: 'Market',
      component: Market
    },
    {
      path: '/sire',
      name: 'Siring',
      component: Siring
    }
  ]
})
