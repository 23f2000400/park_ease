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
      <!-- Quick Actions -->
      <section class="quick-actions">
        <h2 class="section-title">Quick Actions</h2>
        <div class="action-grid">
          <button class="action-btn" @click="navigateToFindParking">
            <i class="fas fa-map-marked-alt"></i><span>Find Parking</span>
          </button>
          <button class="action-btn" @click="showAllBookings">
            <i class="fas fa-calendar-alt"></i><span>My Bookings</span>
          </button>
          
          <button class="action-btn" @click="navigateToBookingHistory" >
            <i class="fas fa-plus-circle"></i><span> Bookings History</span>
          </button>

        </div>
      </section>

      <!-- Booking Cards -->
      <section class="upcoming-bookings">
        <div class="section-header d-flex justify-content-between align-items-center mb-3">
          <h2 class="section-title">
            <span class="booking-filter" :class="{active: currentFilter === 'all'}" @click="showAllBookings">All</span> |
            <span class="booking-filter" :class="{active: currentFilter === 'active'}" @click="showActiveOnly">Active</span> |
            <span class="booking-filter" :class="{active: currentFilter === 'completed'}" @click="showCompletedOnly">Completed</span>
          </h2>
          <span class="badge bg-dark fs-6">{{ filteredBookings.length }} Bookings</span>
        </div>

        <div v-if="paginatedBookings.length === 0" class="alert alert-info text-center">
          <i class="fas fa-info-circle me-2"></i> No {{ currentFilter }} bookings found.
        </div>

        <!-- Updated Booking Cards Grid -->
        <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          <div v-for="booking in paginatedBookings" :key="booking.id" class="col d-flex">
            <div class="card shadow-sm w-100 h-100"
                 :class="{'border-danger': booking.status === 'active', 'border-success': booking.status === 'completed'}">
              <div class="card-header fw-semibold text-uppercase position-relative">
                {{ booking.status === 'active' ? 'Active Booking' : 'Completed Booking' }}
                <span class="badge rounded-pill status-badge"
                      :class="{'bg-primary': booking.status === 'active', 'bg-success': booking.status === 'completed', 'bg-danger': booking.status === 'cancelled'} ">
                  {{ booking.status.toUpperCase() }}
                </span>
              </div>
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">
                  <i class="fas fa-parking me-2" :class="{'text-primary': booking.status === 'active', 'text-success': booking.status === 'completed', 'text-danger': booking.status === 'cancelled'}"></i>
                  {{ booking.parking_lot.name }}
                </h5>
                
                <p class="text-muted small mb-2">
                  <i class="fas fa-map-marker-alt me-1"></i>{{ booking.parking_lot.address }}
                </p>

                <ul class="list-unstyled mb-3">
                  <li><i class="fas fa-calendar-day me-1"></i>Check-in: <strong>{{ formatDateTime(booking.check_in) }}</strong></li>
                  <li v-if="booking.check_out">
                    <i class="fas fa-sign-out-alt me-1"></i>Check-out: <strong>{{ formatDateTime(booking.check_out) }}</strong>
                  </li>
                  <li v-if="booking.check_out">
                    <i class="fas fa-clock me-1"></i>Duration: <strong>{{ calculateDuration(booking.check_in, booking.check_out) }}</strong>
                  </li>
                  <li><i class="fas fa-rupee-sign me-1"></i>Cost: <strong>{{ formatCurrency(booking.cost) }}</strong></li>
                </ul>

                <div class="d-flex flex-wrap gap-2 mt-auto">
                  <button class="btn btn-sm btn-outline-primary" @click="openBookingDetails(booking)">
                    <i class="fas fa-info-circle me-1"></i>Details
                  </button>

                  <button v-if="canCancel(booking)" class="btn btn-sm btn-outline-warning" @click="cancelBooking(booking.id)">
                    <i class="fas fa-clock me-1"></i>Cancel
                  </button>
                  <button v-if="booking.status === 'active'" class="btn btn-sm btn-outline-danger" @click="releaseBooking(booking.id)">
                    <i class="fas fa-sign-out-alt me-1"></i>Release
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
                <div v-if="totalPages > 1" class="text-center mt-4">
          <button class="btn btn-outline-secondary me-2" :disabled="currentPage === 1" @click="currentPage--">
            <i class="fas fa-chevron-left me-1"></i>Prev
          </button>
          <span class="fw-bold">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn btn-outline-secondary ms-2" :disabled="currentPage === totalPages" @click="currentPage++">
            Next<i class="fas fa-chevron-right ms-1"></i>
          </button>
        </div>
      </section>
            <!-- details -->


          <div v-if="showSpotOModal && selectedBooking" class="modal-overlay"
     style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050;">
  <div class="bg-white rounded shadow-lg p-4" style="width: 450px; max-width: 95%;">
    <div class="text-center mb-3">
      <h5 class="text-danger fw-bold"><i class="fas fa-info-circle me-2"></i>Booking Details</h5>
      <hr />
    </div>

    <ul class="list-group list-group-flush mb-3">
      <li class="list-group-item"><strong>ID:</strong> {{ selectedBooking.id }}</li>
      <li class="list-group-item"><strong>Status:</strong> {{ selectedBooking.status }}</li>
      <li class="list-group-item"><strong>Vehicle No:</strong> {{ selectedBooking.vehicle_number }}</li>
      <li class="list-group-item"><strong>Parking Lot:</strong> {{ selectedBooking.parking_lot.name }}</li>
      <li class="list-group-item"><strong>City:</strong> {{ selectedBooking.parking_lot.city }}</li>
      <li class="list-group-item"><strong>Area:</strong> {{ selectedBooking.parking_lot.area }}</li>
      <li class="list-group-item"><strong>Address:</strong> {{ selectedBooking.parking_lot.address }}</li>
      <li class="list-group-item"><strong>Pincode:</strong> {{ selectedBooking.parking_lot.pincode }}</li>
      <li class="list-group-item"><strong>Check-in:</strong> {{ formatDateTime(selectedBooking.check_in) }}</li>
      <li class="list-group-item"><strong>Check-out:</strong> {{ formatDateTime(selectedBooking.check_out) }}</li>
      <li class="list-group-item"><strong>Cost:</strong> ₹{{ formatCurrency(selectedBooking.cost) }}</li>
    </ul>

    <div class="d-flex justify-content-end">
      <button class="btn btn-secondary" @click="showSpotOModal = false">
        <i class="fas fa-times me-1"></i> Close
      </button>
    </div>
  </div>
</div>


      <!-- Recent Activity -->
      <section class="activity-section mt-5">
        <div class="recent-activity">
          <h2 class="section-title">Recent Activity</h2>
          <ul class="activity-list list-group">
            <li v-for="activity in recentActivities" :key="activity.id" class="list-group-item d-flex justify-content-between align-items-start">
              <div class="ms-2 me-auto">
                <div class="fw-bold">{{ activity.message }}</div>
                <small class="text-muted">{{ formatDateTime(activity.timestamp) }}</small>
              </div>
              <span v-if="activity.amount !== null && activity.amount !== undefined" class="badge bg-success rounded-pill">
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
      currentPage: 1,
      perPage: 6,
      isLoading: true,
      error: null,
      showSpotOModal: false,
      selectedBooking: null
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
    },
    paginatedBookings() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredBookings.slice(start, start + this.perPage);
    },
    totalPages() {
      return Math.ceil(this.filteredBookings.length / this.perPage);
    },

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

    releaseBooking(id) {
      if (!confirm('Release this spot?')) return;
      fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('auth_token')
        }
      })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) throw new Error(data.message);
          alert(`Released. Cost ₹${data.final_cost} for ${data.total_hours} hours.`);
          this.fetchUserData();
        })
        .catch(e => alert('Failed to release booking: ' + e.message));
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

    showAllBookings() {
      this.currentFilter = 'all';
      this.currentPage = 1;
    },
    showActiveOnly() {
      this.currentFilter = 'active';
      this.currentPage = 1;
    },
    showCompletedOnly() {
      this.currentFilter = 'completed';
      this.currentPage = 1;
    },

    navigateToBookingHistory() {
      this.$router.push('/user/bookings-history');
    },
    navigateToFindParking() {
      this.$router.push('/find-parking');
    },
    navigateToPaymentMethods() {
      this.$router.push('/payment-methods');
    },
    viewBookingDetails(id) {
      this.$router.push(`/bookings/${id}`);
    },
    extendBooking(id) {
      alert('Extend logic placeholder');
    },
cancelBooking(id) {
  if (!confirm('Cancel this reservation?')) return;
  fetch(`/api/reservations/${id}`, {
    method: 'DELETE',
    headers: {
      'Authentication-Token': localStorage.getItem('auth_token')
    }
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.message);
      
      // 👇 Update status locally so filtered view updates instantly
      this.bookings = this.bookings.map(b =>
        b.id === id ? { ...b, status: 'cancelled' } : b
      );

    alert(`Reservation cancelled. ₹${data.refund_amount.toFixed(2)} refunded.`);
      this.fetchUserData();
    })
    .catch(e => this.$toast.error('Cancel failed: ' + e.message));
},


      canCancel(booking) {
        if (booking.status !== 'active') return false;
        const checkInTime = new Date(booking.check_in);
        const now = new Date();
        return now < checkInTime;
      },
      openBookingDetails(booking) {
        this.selectedBooking = booking;
        this.showSpotOModal = true;
      }


  },

  mounted() {
    this.fetchUserData();
  }
};
