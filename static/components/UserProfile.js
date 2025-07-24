export default {
  template: `
  <div class="container mt-4">
    <h2 class="mb-3 text-primary"><i class="fas fa-user me-2"></i>My Profile</h2>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <div class="card mb-4 shadow-sm">
        <div class="card-body">
          <h4 class="card-title">{{ user.name }}</h4>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Username:</strong> {{ user.username }}</p>
          <p><strong>Phone:</strong> {{ user.phone || 'N/A' }}</p>
          <p><strong>Joined:</strong> {{ formatDate(user.created_at) }}</p>
          <p><strong>Membership:</strong> {{ user.membership_tier }}</p>
        </div>
      </div>

      <div class="d-flex justify-content-end">
        <router-link :to="'/user/edit-profile'" class="btn btn-primary">
          <i class="fas fa-edit me-1"></i> Edit Profile
        </router-link>
      </div>

      <h4 class="mt-5 mb-3 text-secondary"><i class="fas fa-chart-bar me-2"></i>Your Statistics</h4>
      <ul class="list-group">
        <li class="list-group-item d-flex justify-content-between">
          <span>Total Bookings</span> <span>{{ user.stats.total_bookings }}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between">
          <span>Active Bookings</span> <span>{{ user.stats.active_bookings }}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between">
          <span>Completed Bookings</span> <span>{{ user.stats.completed_bookings }}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between">
          <span>Total Spent</span> <span>₹{{ user.stats.total_spent.toFixed(2) }}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between" v-if="user.stats.favorite_lot">
          <span>Favorite Lot</span> <span>{{ user.stats.favorite_lot }}</span>
        </li>
      </ul>
    </div>
  </div>
  `,
  data() {
    return {
      user: {},
      loading: true
    };
  },
  methods: {
    async fetchUserProfile() {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/user/profile', {
          headers: { 'Authentication-Token': token }
        });

        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        this.user = data;
      } catch (err) {
        console.error(err);
        alert("Failed to load profile");
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    }
  },
  mounted() {
    this.fetchUserProfile();
  }
};
