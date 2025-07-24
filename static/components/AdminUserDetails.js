
export default {
    template: `
  <div class="container mt-4">
    <h2 class="mb-3 text-primary"><i class="fas fa-user me-2"></i>User Profile</h2>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <!-- User Info -->
      <div class="card mb-4 shadow-sm">
        <div class="card-body">
          <h4 class="card-title">{{ user.name }}</h4>
          <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Username:</strong> {{ user.username }}</p>
          <p><strong>Phone:</strong> {{ user.phone || 'N/A' }}</p>
            <p><strong>Joined:</strong> {{ new Date(user.created_at).toLocaleDateString() }}</p>
          <p><strong>Roles:</strong> {{ user.roles.join(', ') }}</p>
          <p><strong>Status:</strong> 
            <span class="badge" :class="user.active ? 'bg-success' : 'bg-danger'">
              {{ user.active ? 'Active' : 'Inactive' }}
            </span>
            <div class="mt-3">
              <button class="btn btn-danger me-2" @click="confirmDelete">
                <i class="fas fa-trash-alt me-1"></i> Delete User
              </button>
              <button class="btn btn-warning" @click="confirmBlock">
                <i class="fas fa-ban me-1"></i> {{ user.active ? 'Block User' : 'Unblock User' }}
              </button>
            </div>

          </p>
        </div>
      </div>

      <!-- Booking History -->
      <h4 class="text-secondary"><i class="fas fa-history me-2"></i>Booking History</h4>
      <table class="table table-bordered table-hover mt-3">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Lot</th>
            <th>Vehicle</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Status</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(res, i) in bookings" :key="res.id">
            <td>{{ i + 1 }}</td>
            <td>{{ res.parking_lot.name }}<br><small>{{ res.parking_lot.area }}, {{ res.parking_lot.city }}</small></td>
            <td>{{ res.vehicle_number }}</td>
            <td>{{ formatDateTime(res.check_in) }}</td>
            <td>{{ res.check_out ? formatDateTime(res.check_out) : 'N/A' }}</td>
            <td>
              <span class="badge"
                :class="{
                  'bg-primary': res.status === 'active',
                  'bg-success': res.status === 'completed',
                  'bg-danger': res.status === 'cancelled'
                }">
                {{ res.status.toUpperCase() }}
              </span>
            </td>
            <td>₹{{ res.cost.toFixed(2) }}</td>
          </tr>
          <tr v-if="bookings.length === 0">
            <td colspan="7" class="text-center text-muted">No bookings found</td>
          </tr>
        </tbody>
      </table>
    </div>
    <button class="btn btn-outline-secondary mb-3" @click="$router.back()">
  <i class="fas fa-arrow-left me-1"></i> Back
</button>
  </div>

    `,
  data() {
    return {
      user: {},
      bookings: [],
      loading: true,
    };
  },
  methods: {
    async fetchUserDetails() {
      try {
        const token = localStorage.getItem('auth_token');
        const userId = this.$route.params.id;

        const [userRes, bookingsRes] = await Promise.all([
        fetch(`/api/admin/users/${userId}`, {
            headers: { 'Authentication-Token': token }
        }),
        fetch(`/api/admin/users/${userId}/bookings`, {
            headers: { 'Authentication-Token': token }
        })
        ]);

        const userData = await userRes.json();
        const bookingData = await bookingsRes.json();

        this.user = userData;
        this.bookings = bookingData;
      } catch (err) {
        console.error(err);
        alert("Failed to load user data");
      } finally {
        this.loading = false;
      }
    },
    formatDateTime(date) {
      return new Date(date).toLocaleString();
    },
    confirmDelete() {
  if (confirm("Are you sure you want to permanently delete this user?")) {
    this.deleteUser();
  }
},

confirmBlock() {
  const action = this.user.active ? "block" : "unblock";
  if (confirm(`Are you sure you want to ${action} this user?`)) {
    this.toggleBlock();
  }
},

async deleteUser() {
  try {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`/api/admin/users/${this.user.id}`, {
      method: 'DELETE',
      headers: { 'Authentication-Token': token }
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message || "User deleted");
      this.$router.push('/admin/home');
    } else {
      alert(data.message || "Failed to delete user");
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting user");
  }
},

async toggleBlock() {
  try {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`/api/admin/users/${this.user.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authentication-Token': token
      },
      body: JSON.stringify({ active: !this.user.active })
    });

    const data = await res.json();
    if (res.ok) {
      this.user.active = data.active;
    } else {
      alert(data.message || "Failed to update status");
    }
  } catch (err) {
    console.error(err);
    alert("Error updating user status");
  }
}

  },
  mounted() {
    this.fetchUserDetails();
  }
};

