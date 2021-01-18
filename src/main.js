import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// import global css
import './assets/css/global.css'
// import ali font
import './assets/fonts/iconfont.css'

import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:8888'
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
