import { auth } from '../script.js';

export default {
  template: `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3">
    <router-link class="navbar-brand" to="/">ParkEase</router-link>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <router-link class="nav-link" to="/">Home</router-link>
        </li>

        <!-- If NOT logged in -->
        <template v-if="!auth.isAuthenticated">
          <li class="nav-item">
            <router-link class="nav-link" to="/login">Login</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/register">Register</router-link>
          </li>
        </template>

        <!-- If logged in -->
        <template v-else>
          <template v-if="auth.role.includes('admin')">
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/home">AdminHome</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/summary">Summary</router-link>
            </li>
          </template>

          <template v-if="auth.role.includes('user')">
            <li class="nav-item">
              <router-link class="nav-link" to="/user/home">UserHome</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/user/bookings">Summary</router-link>
            </li>
          </template>

          <!-- Logout -->
          <li class="nav-item">
            <a class="nav-link text-danger" href="#" @click.prevent="logout">Logout</a>
          </li>
        </template>
      </ul>
    </div>
  </nav>
  `,
  data() {
    return {
      auth
    };
  },
  methods: {
    logout() {
      localStorage.clear();
      auth.isAuthenticated = false;
      auth.role = [];
      this.$router.push('/');
    }
  }
};
