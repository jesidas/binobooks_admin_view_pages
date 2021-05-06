import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// import global css
import './assets/css/global.css'
// import ali font
import './assets/fonts/iconfont.css'
import {Loading} from 'element-ui'
import axios from 'axios'

axios.defaults.baseURL = 'http://159.75.20.131:8888'


Vue.use(Loading)
Vue.prototype.$http = axios
Vue.config.productionTip = false

let loading;
function startLoading(){
  loading = Loading.service({
    lock: true,
    text: 'Loading Data...',
    background: 'rgba(0, 0, 0, 0.7)'
})
}

function endLoading() {  
  loading.close()
}

axios.interceptors.request.use(request => {
  startLoading();
  let token = window.sessionStorage.getItem('token')
  if(token){
    request.headers['token'] = token
  }
  return request
}, err => {
  return Promise.reject(err);
})

axios.interceptors.response.use(response => {
  endLoading();
  return response
}, err =>{
 
  return Promise.reject(err)
}
)


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
