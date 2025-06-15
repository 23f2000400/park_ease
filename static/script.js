import Home from './components/Home.js';
import Register from './components/Register.js';
import Login from './components/Login.js';
import NavBar from './components/Navbar.js';
import Footer from './components/Footer.js';
import UserHome from './components/UserHome.js';
import AdminHome from './components/AdminHome.js';



const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/register', component: Register},
    {path: '/user/home', component: UserHome, meta: { requiresAuth: true } },
    {path: '/admin/home', component: AdminHome, meta: { requiresAuth: true, requiresAdmin: true } },
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