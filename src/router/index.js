import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SpotDetail from '../views/SpotDetail.vue'
import Upload from '../views/Upload.vue'
import CreateSpot from '../views/CreateSpot.vue'
import AdminLogin from '../views/AdminLogin.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/spots/:id',
      name: 'spot-detail',
      component: SpotDetail
    },
    {
      path: '/spots/:id/upload',
      name: 'upload',
      component: Upload
    },
    {
      path: '/create-spot',
      name: 'create-spot',
      component: CreateSpot
    },
    {
      path: '/LSTAdmin/login',
      name: 'admin-login',
      component: AdminLogin
    },
    {
      path: '/LSTAdmin',
      name: 'admin',
      component: AdminDashboard
    }
  ]
})

export default router
