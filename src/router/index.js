import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/premission/Rights.vue'
import Roles from '../components/premission/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Good from '../components/goods/Good.vue'
import GoodContent from '../components/goods/GoodContent.vue'


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
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles},
      { path: '/categories', component: Cate},
      { path: '/goods', component: Good},
      { path: '/goodContent', name: 'goodContent', component: GoodContent},
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
