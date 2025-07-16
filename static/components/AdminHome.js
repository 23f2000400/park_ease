export default {
    template: `
    <div class="admin-dashboard">
      <!-- Header Section -->
      <div class="dashboard-header bg-primary text-white p-4 shadow">
        <div class="container">
          <h1 class="mb-0"><i class="fas fa-tachometer-alt me-2"></i>Admin Dashboard</h1>
        </div>
      </div>

      <!-- Admin Profile -->
      <div class="container mt-4">
        <div class="row">
          <div class="col-md-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Admin Profile</h5>
                <p class="card-text">
                  <strong>Name:</strong> {{ admin.name || 'N/A' }}<br />
                  <strong>Email:</strong> {{ admin.email || 'N/A' }}<br />
                  <strong>Username:</strong> {{ admin.username || 'N/A' }}<br />
                  <strong>Roles:</strong> {{ admin.roles ? admin.roles.join(', ') : 'N/A' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container py-4">
        <!-- Stats Cards -->
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="card stat-card bg-info text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <i class="fas fa-users fa-3x"></i>
                    <h5 class="card-title">Total Users - {{ users.length }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card stat-card bg-success text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <i class="fas fa-parking fa-3x"></i>
                    <h5 class="card-title">Parking Spots - {{parkingLots.length}}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card stat-card bg-warning text-dark">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <i class="fas fa-calendar-check fa-3x"></i>
                    <h5 class="card-title">Active Bookings - {{ active_reservations.length }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Section -->
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone || '-' }}</td>
              <td><span class="badge bg-secondary">{{ user.roles.join(', ') }}</span></td>
              <td>
                <span class="badge" :class="user.active ? 'bg-success' : 'bg-danger'">
                  {{ user.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-danger" @click="view(user.id)">View</button>
              </td>
            </tr>
            <tr v-if="usersLoading">
              <td colspan="7" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="users.length ==0">
              <td colspan="7" class="text-center text-muted py-4">No users found</td>
            </tr>
          </tbody>
        </table>

        <!-- Parking History Section -->
        <div class="container mt-5">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="mb-0 text-primary"><i class="fas fa-history me-2"></i>Parking History</h2>
          </div>
          <div class="text-end mb-3">
            <button class="btn btn-outline-secondary" @click="csvExport">Download CSV</button>
          </div>
          <div class="table-responsive shadow-sm border rounded">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>S No</th>
                  <th>Spot ID</th>
                  <th>Customer Name</th>
                  <th>City</th>
                  <th>Area</th>
                  <th>Lot Name</th>
                  <th>Vehicle No</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                  <th>Estimated Cost (₹)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
  <tr v-for="(res, index) in paginatedReservationHistory" :key="res.id">
    <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
    <td>{{ res.id }}</td>
    <td>{{ res.user_name || 'N/A' }}<br /><small>User ID: {{ res.user_id }}</small></td>
    <td>{{ res.city || 'N/A' }}</td>
    <td>{{ res.area || 'N/A' }}</td>
    <td>{{ res.lot_name || 'N/A' }}</td>
    <td>{{ res.vehicle_number || 'N/A' }}</td>
    <td>
      <div>{{ formatDate(res.check_in).date }}</div>
      <small class="text-muted">{{ formatDate(res.check_in).time }}</small>
    </td>
    <td>
      <div>{{ formatDate(res.check_out).date }}</div>
      <small class="text-muted">{{ formatDate(res.check_out).time }}</small>
    </td>
    <td>
      <span class="badge"
        :class="{
          'bg-primary': res.status === 'active',
          'bg-success': res.status === 'completed',
          'bg-danger': res.status === 'cancelled'
        }">
        {{ res.status ? res.status.toUpperCase() : 'UNKNOWN' }}
      </span>
    </td>
    <td>₹{{ res.cost || '0.00' }}</td>
    <td>
      <button class="btn btn-sm btn-outline-primary" @click="showReservationDetails(res)">
        <i class="fas fa-info-circle me-1"></i>Details
      </button>
    </td>
  </tr>
  <tr v-if="paginatedReservationHistory.length === 0">
    <td colspan="12" class="text-center text-muted py-4">
      <i class="fas fa-info-circle me-2"></i>No matching reservation history found.
    </td>
  </tr>
</tbody>

            </table>

            <!-- Improved Pagination -->
            <div v-if="totalPages > 1" class="d-flex justify-content-center align-items-center gap-3 mt-3">
              <button 
                class="btn btn-outline-secondary" 
                :disabled="currentPage === 1 || isPageLoading" 
                @click.prevent="changePage(currentPage - 1)"
              >
                <i class="fas fa-chevron-left"></i> Prev
              </button>

              <span class="fw-bold">Page {{ currentPage }} of {{ totalPages }}</span>

              <button 
                class="btn btn-outline-secondary" 
                :disabled="currentPage === totalPages || isPageLoading" 
                @click.prevent="changePage(currentPage + 1)"
              >
                Next <i class="fas fa-chevron-right"></i>
              </button>
            </div>
              <!-- Reservation Detail Modal -->
      <div v-if="selectedReservation" class="modal-overlay"
           style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050;">
        <div class="bg-white rounded shadow-lg p-4" style="width: 450px; max-width: 95%;">
          <div class="text-center mb-3">
            <h5 class="text-primary fw-bold"><i class="fas fa-info-circle me-2"></i>Reservation Details</h5>
            <hr />
          </div>

          <ul class="list-group list-group-flush mb-3">
            <li class="list-group-item"><strong>ID:</strong> {{ selectedReservation.id }}</li>
            <li class="list-group-item"><strong>Status:</strong> {{ selectedReservation.status }}</li>
            <li class="list-group-item"><strong>Vehicle No:</strong> {{ selectedReservation.vehicle_number }}</li>
            <li class="list-group-item"><strong>Customer ID:</strong> {{ selectedReservation.user_id }}</li>
            <li class="list-group-item"><strong>Customer Name:</strong> {{ selectedReservation.user_name }}</li>
            <li class="list-group-item"><strong>City:</strong> {{ selectedReservation.city }}</li>
            <li class="list-group-item"><strong>Area:</strong> {{ selectedReservation.area }}</li>
            <li class="list-group-item"><strong>Lot:</strong> {{ selectedReservation.lot_name }}</li>
            <li class="list-group-item"><strong>Check-in:</strong> {{ selectedReservation.check_in }}</li>
            <li class="list-group-item"><strong>Check-out:</strong> {{ selectedReservation.check_out ? (selectedReservation.check_out) : '—' }}</li>
            <li class="list-group-item"><strong>Duration:</strong> {{ selectedReservation.duration }}</li>
            <li class="list-group-item"><strong>Cost:</strong> ₹{{ selectedReservation.cost }}</li>
          </ul>

          <div class="d-flex justify-content-end">
            <button class="btn btn-secondary" @click="selectedReservation = null">
              <i class="fas fa-times me-1"></i> Close
            </button>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
        return {
            admin: {
                name: '',
                email: '',
                username: '',
                roles: []
            },
            loading: true,
            error: null,
            users: [],
            usersLoading: false,
            parkingLots: [],
            showAddForm: false,
            selectedLotId: null,
            selectedSpot: null,
            showSpotOModal: false,
            showSpotAModal: false,
            reservationHistory: [],
            searchField: '',
            searchQuery: '',
            selectedReservation: null,
            currentPage: 1,
            perPage: 10,
            isPageLoading: false,
            pageChangeTimeout: null,

            newLot: {
                name: '',
                city: '',
                area: '',
                address: '',
                pincode: '',
                price: null,
                total_spots: null
            },

            cities: [
                'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata'
            ]
        };
    },
    created() {
        this.fetchAdminData();
        this.fetchUsers();
        this.fetchParkingLots();
        this.fetchReservationHistory();
    },
    computed: {
        filteredReservationHistory() {
          if (!this.searchField || !this.searchQuery) return this.reservationHistory;
          return this.reservationHistory.filter(res => {
            const val = String(res[this.searchField] || '').toLowerCase();
            return val.includes(this.searchQuery.toLowerCase());
          });
        },
        paginatedReservationHistory() {
          const filtered = this.filteredReservationHistory;
          const start = (this.currentPage - 1) * this.perPage;
          return filtered.slice(start, start + this.perPage);
        },
        totalPages() {
          return Math.ceil(this.filteredReservationHistory.length / this.perPage);
        },
        active_reservations() {
          return this.reservationHistory.filter(res => res.status === 'active');
        }
    },
    watch: {
      searchField() {
        this.currentPage = 1;
      },
      searchQuery() {
        this.currentPage = 1;
      }
    },
    methods: {
        async fetchAdminData() {
            this.loading = true;
            this.error = null;
        
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    throw new Error('No authentication token found - please login');
                }

                const response = await fetch('/api/admin/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Authentication-Token': token
                    },
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('auth_token');
                        this.$router.push('/login');
                        return;
                    }
                    throw new Error(`Request failed with status ${response.status}`);
                }
                
                const userData = await response.json();
                this.admin = userData;
            } catch (error) {
                console.error('Fetch error:', error);
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async fetchUsers() {
            this.usersLoading = true;
            this.error = null;
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) throw new Error('No authentication token found - please login');
                const response = await fetch('/api/admin/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Authentication-Token': token
                    },
                    credentials: 'include'
                });
                this.users = await response.json();
            } catch (error) {
                this.error = error.message;
            } finally {
                this.usersLoading = false;
            }
        },
        view(userId) {
            this.$router.push(`/admin/user/${userId}`);
        },
        gotoprofit() {
            this.$router.push('/admin/profit-analytics');
        },
        async fetchParkingLots() {
          try {
            const response = await fetch('/api/lots', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem('auth_token')
              },
              credentials: 'include'
            });

            const data = await response.json();
            if (Array.isArray(data)) {
              this.parkingLots = data.filter(lot => lot && lot.id);
            } else {
              this.parkingLots = [];
            }
          } catch (error) {
            console.error('Error fetching parking lots:', error);
            this.error = error.message;
          }
        },
        async fetchReservationHistory() {
          try {
            this.isPageLoading = true;
            const token = localStorage.getItem('auth_token');
            const res = await fetch('/api/admin/reservations', {
              headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': token
              }
            });
            const data = await res.json();
            this.reservationHistory = Array.isArray(data) ? data : [];
          } catch (err) {
            console.error("Failed to fetch reservation history:", err);
          } finally {
            this.isPageLoading = false;
          }
        },
        async changePage(newPage) {
          if (this.pageChangeTimeout) {
            clearTimeout(this.pageChangeTimeout);
          }

          if (newPage < 1 || newPage > this.totalPages) return;

          this.isPageLoading = true;

          this.pageChangeTimeout = setTimeout(() => {
            this.currentPage = newPage;
            this.isPageLoading = false;
            
            this.$nextTick(() => {
              const table = this.$el.querySelector('.table-responsive');
              if (table) table.scrollIntoView({ behavior: 'smooth' });
            });
          }, 150);
        },
        formatDate(dateStr) {
          if (!dateStr) return { date: 'N/A', time: '' };
          const d = new Date(dateStr);
          const date = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
          const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          return { date, time };
        },
        showReservationDetails(reservation) {
            this.selectedReservation = reservation;
        },
        csvExport() {
            fetch('/api/export')
            .then(response => response.json())
            .then(data => {
                window.location.href = `/api/csv_result/${data.id}`;
            })
            .catch(error => console.error('Error exporting CSV:', error));
        }
    }
}