import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Cate from '../components/category/Cate.vue'
import ElementCategory from '../components/category/ElementCategory'
import Good from '../components/goods/Good.vue'
import GoodContent from '../components/goods/GoodContent.vue'
import Character from '../components/goods/Character.vue'




Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
 { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/category', component: Cate},
      { path: '/elementCategory', component: ElementCategory},
      { path: '/goods', component: Good},
      { path: '/goodContent', name: 'goodContent', component: GoodContent},
      { path: '/character', name: 'character', component: Character},
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // to, URL want to access
  // from, jump from which URL
  // next, method
  if (to.path === '/login') return next()
  // get token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
