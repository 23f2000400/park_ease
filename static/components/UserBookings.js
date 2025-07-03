export default {
  template: `
    <div class="container py-5">
      <h2 class="mb-4 text-center">Your Bookings</h2>

      <!-- No bookings message -->
      <div v-if="bookings.length === 0" class="alert alert-info text-center">
        <i class="fas fa-info-circle me-2"></i>No bookings found. Please check back later.
      </div>

      <!-- Bookings Table -->
      <div v-else>
        <div class="table-responsive">
          <table class="table table-striped table-bordered table-hover align-middle shadow-sm">
            <thead class="table-dark text-center">
              <tr>
                <th>Booking ID</th>
                <th>Lot Name</th>
                <th>Address</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Total (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="text-center">
              <tr v-for="booking in paginatedBookings" :key="booking.id">
                <td>{{ booking.id }}</td>
                <td>{{ booking.parking_lot.name }}</td>
                <td>{{ booking.parking_lot.address }}</td>
                <td>{{ formatDateTime(booking.check_in) }}</td>
                <td>{{ booking.check_out ? formatDateTime(booking.check_out) : '—' }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-primary': booking.status === 'active',
                          'bg-success': booking.status === 'completed',
                          'bg-danger': booking.status === 'cancelled'
                        }">
                    {{ booking.status.toUpperCase() }}
                  </span>
                </td>
                <td>₹{{ parseFloat(booking.cost || 0).toFixed(2) }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-info" @click="showDetails(booking)">
                    <i class="fas fa-info-circle me-1"></i>Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="text-center mt-3">
          <button class="btn btn-outline-secondary me-2"
                  :disabled="currentPage === 1"
                  @click="currentPage--">
            <i class="fas fa-chevron-left me-1"></i> Prev
          </button>
          <span class="fw-bold">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn btn-outline-secondary ms-2"
                  :disabled="currentPage === totalPages"
                  @click="currentPage++">
            Next <i class="fas fa-chevron-right ms-1"></i>
          </button>
        </div>
      </div>

      <!-- Details Modal -->
      <div v-if="selectedBooking" class="modal-overlay d-flex justify-content-center align-items-center"
           style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                  background: rgba(0, 0, 0, 0.6); z-index: 1050;">
        <div class="bg-white p-4 rounded shadow" style="width: 450px; max-width: 95%;">
          <div class="mb-3 text-center">
            <h5 class="text-primary"><i class="fas fa-info-circle me-2"></i>Booking Details</h5>
            <hr />
          </div>

          <ul class="list-group list-group-flush">
            <li class="list-group-item"><strong>ID:</strong> {{ selectedBooking.id }}</li>
            <li class="list-group-item"><strong>Status:</strong> {{ selectedBooking.status }}</li>
            <li class="list-group-item"><strong>Vehicle No:</strong> {{ selectedBooking.vehicle_number }}</li>
            <li class="list-group-item"><strong>Parking Lot:</strong> {{ selectedBooking.parking_lot.name }}</li>
            <li class="list-group-item"><strong>City:</strong> {{ selectedBooking.parking_lot.city }}</li>
            <li class="list-group-item"><strong>Area:</strong> {{ selectedBooking.parking_lot.area }}</li>
            <li class="list-group-item"><strong>Address:</strong> {{ selectedBooking.parking_lot.address }}</li>
            <li class="list-group-item"><strong>Pincode:</strong> {{ selectedBooking.parking_lot.pincode }}</li>
            <li class="list-group-item"><strong>Check-in:</strong> {{ formatDateTime(selectedBooking.check_in) }}</li>
            <li class="list-group-item"><strong>Check-out:</strong> {{ selectedBooking.check_out ? formatDateTime(selectedBooking.check_out) : '—' }}</li>
            <li class="list-group-item"><strong>Cost:</strong> ₹{{ parseFloat(selectedBooking.cost || 0).toFixed(2) }}</li>
          </ul>

          <div class="text-end mt-3">
            <button class="btn btn-secondary" @click="selectedBooking = null">
              <i class="fas fa-times me-1"></i> Close
            </button>
          </div>
        </div>
      </div>
      <div class="text-center mt-4">
        <button class="btn btn-outline-secondary" @click="$router.back()">
          <i class="fas fa-arrow-left me-1"></i> Back
        </button>
    </div>
  `,

  data() {
    return {
      bookings: [],
      userData: {},
      recentActivities: [],
      currentPage: 1,
      perPage: 10,
      selectedBooking: null
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.bookings.length / this.perPage);
    },
    paginatedBookings() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.bookings.slice(start, start + this.perPage);
    }
  },

  created() {
    this.fetchUserData();
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
        this.bookings = bookingsData.bookings || bookingsData;
        this.recentActivities = bookingsData.recent_activities || [];
      } catch (err) {
        console.error('Error fetching user or booking data:', err);
        this.$router.push('/login');
      }
    },

    formatDateTime(isoString) {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    },

    showDetails(booking) {
      this.selectedBooking = booking;
    }
  }
};
