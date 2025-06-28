export default {
  template: `
    <div class="parking-dashboard">
      <header class="dashboard-header">
        <div class="user-greeting">
          <h1>Welcome back, <span class="user-name">{{ userData.name || 'Valued Customer' }}</span></h1>
          <p class="last-login">Last login: {{ formatDate(new Date()) }}</p>
        </div>
        <div class="quick-stats">
          <div class="stat-card" @click="showActiveOnly">
            <div class="stat-icon bg-primary">
              <i class="fas fa-car"></i>
            </div>
            <div class="stat-info">
              <h3>{{ activeBookingsCount }}</h3>
              <p>Active Bookings</p>
            </div>
          </div>
          <div class="stat-card" @click="showCompletedOnly">
            <div class="stat-icon bg-success">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-info">
              <h3>{{ completedBookingsCount }}</h3>
              <p>Completed Trips</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="fas fa-star"></i>
            </div>
            <div class="stat-info">
              <h3>{{ userData.membership_tier || 'Basic' }}</h3>
              <p>Membership Tier</p>
            </div>
          </div>
        </div>
      </header>

      <main class="dashboard-content">
        <section class="quick-actions">
          <h2 class="section-title">Quick Actions</h2>
          <div class="action-grid">
            <button class="action-btn" @click="navigateToNewBooking">
              <i class="fas fa-plus-circle"></i><span>New Booking</span>
            </button>
            <button class="action-btn" @click="showAllBookings">
              <i class="fas fa-calendar-alt"></i><span>My Bookings</span>
            </button>
            <button class="action-btn" @click="navigateToFindParking">
              <i class="fas fa-map-marked-alt"></i><span>Find Parking</span>
            </button>
            <button class="action-btn" @click="navigateToPaymentMethods">
              <i class="fas fa-wallet"></i><span>Payment Methods</span>
            </button>
          </div>
        </section>

        <section class="upcoming-bookings">
          <div class="section-header">
            <h2 class="section-title">
              <span class="booking-filter" :class="{active: currentFilter === 'all'}" @click="showAllBookings">All Bookings</span> |
              <span class="booking-filter" :class="{active: currentFilter === 'active'}" @click="showActiveOnly">Active</span> |
              <span class="booking-filter" :class="{active: currentFilter === 'completed'}" @click="showCompletedOnly">Completed</span>
            </h2>
            <span class="booking-count">{{ filteredBookings.length }} bookings</span>
          </div>

          <div v-if="filteredBookings.length === 0" class="no-bookings">
            <i class="fas fa-calendar-times"></i>
            <p>No {{ currentFilter }} bookings found</p>
          </div>

          <div v-for="booking in filteredBookings" :key="booking.id" class="booking-card" :class="{featured: booking.status === 'active'}">
            <div class="booking-info">
              <h3>{{ booking.parking_lot.name }}</h3>
              <p class="location"><i class="fas fa-map-marker-alt"></i> {{ booking.parking_lot.address }}</p>
              <div class="booking-details">
                <div class="detail"><i class="fas fa-calendar-day"></i><span>{{ formatDateTime(booking.check_in) }}</span></div>
                <div v-if="booking.check_out" class="detail"><i class="fas fa-sign-out-alt"></i><span>Released at: {{ formatDateTime(booking.check_out) }}</span></div>
                <div v-if="booking.check_out" class="detail"><i class="fas fa-hourglass-end"></i><span>{{ calculateDuration(booking.check_in, booking.check_out) }}</span></div>
                <div class="detail"><i class="fas fa-dollar-sign"></i><span>{{ formatCurrency(booking.cost) }}</span></div>
              </div>
            </div>
            <div class="booking-actions">
              <button class="btn btn-sm btn-outline" @click="viewBookingDetails(booking.id)">Details</button>
              <button v-if="booking.status === 'active'" class="btn btn-sm btn-primary" @click="extendBooking(booking.id)">Extend</button>
              <button v-if="booking.status === 'active'" class="btn btn-sm btn-warning" @click="cancelBooking(booking.id)">Cancel</button>
              <button v-if="booking.status === 'active'" class="btn btn-sm btn-danger" @click="releaseBooking(booking.id)">Release</button>
            </div>
          </div>
        </section>

        <section class="activity-section">
          <div class="recent-activity">
            <h2 class="section-title">Recent Activity</h2>
            <ul class="activity-list">
              <li v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <div class="activity-icon" :class="activity.type">
                  <i :class="activity.icon"></i>
                </div>
                <div class="activity-content">
                  <p>{{ activity.message }}</p>
                  <small>{{ formatDateTime(activity.timestamp) }}</small>
                </div>
                <span v-if="activity.amount !== null && activity.amount !== undefined" class="activity-amount">
                  {{ formatActivityAmount(activity.amount) }}
                </span>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  `,

  data() {
    return {
      userData: {},
      bookings: [],
      recentActivities: [],
      currentFilter: 'active',
      isLoading: true,
      error: null
    };
  },

  computed: {
    activeBookingsCount() {
      return this.bookings.filter(b => b.status === 'active').length;
    },
    completedBookingsCount() {
      return this.bookings.filter(b => b.status === 'completed').length;
    },
    filteredBookings() {
      if (this.currentFilter === 'all') return this.bookings;
      return this.bookings.filter(b => b.status === this.currentFilter);
    }
  },

  methods: {
    async fetchUserData() {
      try {
        const [userRes, bookingsRes] = await Promise.all([
          fetch('/api/user/profile', {
            headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
          }),
          fetch('/api/user/bookings', {
            headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
          })
        ]);

        const userData = await userRes.json();
        const bookingsData = await bookingsRes.json();

        this.userData = userData;
        this.bookings = bookingsData.bookings || [];
        this.recentActivities = bookingsData.recent_activities || [];
      } catch (err) {
        console.error(err);
        this.$router.push('/login');
      }
    },

    async releaseBooking(id) {
      if (!confirm('Release this spot?')) return;
      try {
        const res = await fetch(`/api/reservations/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth_token')
          }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        alert(`Released. Cost ₹${data.final_cost} for ${data.total_hours} hours`);
        this.fetchUserData();
      } catch (e) {
        alert('Failed to release booking- ' + e.message);
      }
    },

    formatDate(d) {
      return new Date(d).toLocaleDateString();
    },
    formatDateTime(dt) {
      return new Date(dt).toLocaleString();
    },
    calculateDuration(start, end) {
      const diff = new Date(end) - new Date(start);
      const h = Math.floor(diff / 36e5);
      const m = Math.round((diff % 36e5) / 60000);
      return `${h}h ${m}m`;
    },
    formatCurrency(v) {
      return `₹${parseFloat(v).toFixed(2)}`;
    },
    formatActivityAmount(a) {
      const s = a > 0 ? '+' : '-';
      return `${s}₹${Math.abs(a).toFixed(2)}`;
    },

    showAllBookings() { this.currentFilter = 'all'; },
    showActiveOnly() { this.currentFilter = 'active'; },
    showCompletedOnly() { this.currentFilter = 'completed'; },

    navigateToNewBooking() { this.$router.push('/bookings/new'); },
    navigateToFindParking() { this.$router.push('/find-parking'); },
    navigateToPaymentMethods() { this.$router.push('/payment-methods'); },
    viewBookingDetails(id) { this.$router.push(`/bookings/${id}`); },
    extendBooking(id) { alert('Extend logic placeholder'); },
    cancelBooking(id) { alert('Cancel logic placeholder'); }
  },

  mounted() {
    this.fetchUserData();
  }
};
