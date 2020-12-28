import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// import global css
import './assets/css/global.css'
// import ali font
import './assets/fonts/iconfont.css'

import axios from 'axios'
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // must return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
