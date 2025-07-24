import Home from './components/Home.js';
import Register from './components/Register.js';
import Login from './components/Login.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import UserHome from './components/UserHome.js';
import FindParking from './components/FindParking.js';
import UserBookings from './components/UserBookings.js';
import Payment from './components/Payment.js';
import AdminHome from './components/AdminHome.js';
import AdminUserDetails from './components/AdminUserDetails.js';
import AdminSummary from './components/AdminSummary.js';
import AdminProfit from './components/AdminProfit.js';
import EditProfile from './components/EditProfile.js';
import UserProfile from './components/UserProfile.js';

export const auth = Vue.observable({
  isAuthenticated: !!localStorage.getItem('auth_token'),
  role: JSON.parse(localStorage.getItem('role') || '[]')
});

// Restore login state from localStorage
if (localStorage.getItem('auth_token')) {
  auth.isAuthenticated = true;
}

const routes = [
  { path: '/', component: Home },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/user/home', component: UserHome, meta: { requiresAuth: true, role: 'user' } },
  { path: '/user/find-parking', component: FindParking, meta: { requiresAuth: true, role: 'user' } },
  { path: '/user/bookings', component: UserBookings, meta: { requiresAuth: true, role: 'user' } },
  { path: '/user/payment', component: Payment, meta: { requiresAuth: true, role: 'user' } },
  { path: '/admin/home', component: AdminHome, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/user/:id', component: AdminUserDetails, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/summary', component: AdminSummary, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/profit-analytics', component: AdminProfit, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/user/profile', component: UserProfile, meta: { requiresAuth: true, role: 'user' } },
  { path: '/user/edit-profile', component: EditProfile, meta: { requiresAuth: true, role: 'user' } }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

// Route guard to protect routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('role');

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      return next('/login');
    }

    if (to.meta.role && !role.includes(to.meta.role)) {
      alert('Access Denied: You are not authorized to view this page.');
      return next('/');
    }
  }
  if ((to.path === '/login' || to.path === '/register') && token) {
    return next('/user/home');
  }

  next();
});

new Vue({
  el: '#app',
  router,
  components: {
    'app-navbar': Navbar,
    'app-footer': Footer
  },
  template: `
    <div>
      <app-navbar></app-navbar>
    <div class="containerh-100 d-flex flex-column min-vh-100"> 
        <router-view></router-view>
        <app-footer></app-footer>
    </div>
    </div>
  `
});
