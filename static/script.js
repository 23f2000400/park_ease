import Home from './components/Home.js';
import Register from './components/Register.js';
import Login from './components/Login.js';
import NavBar from './components/Navbar.js';
import Footer from './components/Footer.js';
import UserHome from './components/UserHome.js';
import AdminHome from './components/AdminHome.js';
import AdminProfile from './components/AdminProfile.js';
import FindParking from './components/FindParking.js';
import Payment from './components/Payment.js';
import UserBookings from './components/UserBookings.js';


const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/register', component: Register},
    {path: '/user/home', component: UserHome, meta: { requiresAuth: true } },
    {path: '/admin/home', component: AdminHome, meta: { requiresAuth: true, requiresAdmin: true } },
    {path: '/admin/profile', component: AdminProfile, meta: { requiresAuth: true, requiresAdmin: true } },
    {path: '/find-parking', component: FindParking, meta: { requiresAuth: true } },
    {path: '/payment', component: Payment, meta: { requiresAuth: true } },
    {path: '/user/bookings-history', component: UserBookings, meta: { requiresAuth: true } },
]

const router = new VueRouter({
    routes
});


const app = new Vue({
    el: '#app',
    router,
    template: `
    <div class="containerh-100 d-flex flex-column min-vh-100"> 
        <nav-bar></nav-bar>
        <router-view></router-view>
        <footer-bar></footer-bar>
    </div>
    `,
    data: {
        section: "Frontend",
    },
    components: {
        "nav-bar": NavBar,
        "footer-bar": Footer,
    },
        
    
});