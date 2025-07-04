<<<<<<< HEAD
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
                    <i class="fas fa-users fa-3x align-items-center"></i>

                    <h5 class="card-title ">Total Users - {{ users.length }}</h5>
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

                    <h5 class="card-title">Parking Spots - {{parkingLots.length}} </h5>
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
                <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Profit</h2>
            <button class="btn btn-primary" @click="gotoprofit">
              <i class="fas fa-plus me-2"></i>Profit
            </button>
          </div>

        <!-- Parking Lots Section -->
        <div class="py-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Parking Lots</h2>
            <button class="btn btn-primary" @click="showAddForm = !showAddForm">
              <i class="fas fa-plus me-2"></i>+ Add Parking Lot
            </button>
          </div>
                  

          <div class="row">
            <div v-for="lot in parkingLots" :key="lot.id" class="col-md-4 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title mb-0">{{ lot.name }}</h5>
                    <div>
                      <a href="#" @click.prevent="editLot(lot)" class="text-primary me-2">Edit</a>
                      <a href="#" @click.prevent="deleteLot(lot.id)" class="text-danger">Delete</a>
                    </div>
                  </div>
                  <p class="text-success mb-2">
                    (Occupied: {{ lot.total_spots - lot.available_spots }}/{{ lot.total_spots }})
                  </p>
                  <p class="card-text mb-2">
                    <strong>State:</strong> {{ lot.state }}<br />
                    <strong>City:</strong> {{ lot.city }}<br />
                    <strong>Area:</strong> {{ lot.area }}<br />
                    <strong>Address:</strong> {{ lot.address }}<br />
                    <strong>Pincode:</strong> {{ lot.pincode }}<br />
                    <strong>Price:</strong> ₹{{ lot.price }} per hour
                  </p>

                  <!-- Parking spot grid -->
                  <div class="d-flex flex-wrap gap-2">
                    <button
                      v-for="spot in lot.spots"
                      :key="'spot-' + spot.id"
                      class="spot-box btn btn-sm fw-bold d-flex align-items-center justify-content-center"
                      :class="spot.status === 'O' ? 'btn-danger' : 'btn-success'"
                      style="width: 30px; height: 30px; padding: 0;"
                      @click="handleSpotClickDirect(spot)"
                    >
                      {{ spot.status === 'O' ? 'O' : 'A' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

    <!-- Add Lot Button Card -->
    <div class="col-md-4 mb-4">
      <div class="card h-100 border-primary text-center" style="cursor: pointer;" @click="showAddForm = true">
        <div class="card-body d-flex flex-column justify-content-center align-items-center">
          <i class="fas fa-plus fa-2x text-primary mb-2"></i>
          <strong class="text-primary">+ Add Lot</strong>
        </div>
      </div>
    </div>
  </div>
</div>
        </div>

        <!-- Add Parking Lot Form (conditionally shown) -->
          <!-- Add Parking Lot Modal -->
          <div v-if="showAddForm" class="modal-overlay" 
              style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                      background: rgba(0, 0, 0, 0.5); display: flex; 
                      justify-content: center; align-items: center; z-index: 999;">
            
            <div class="modal-content" 
                style="background: white; padding: 20px; border-radius: 8px; width: 500px; 
                        max-width: 95%; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">

              <h5 class="mb-3">{{ selectedLotId ? 'Edit Parking Lot' : 'Add New Parking Lot' }}</h5>
                <form @submit.prevent="createOrUpdateParkingLot" class="p-4 border rounded shadow-sm bg-light">
                  <h4 class="mb-4 text-primary fw-bold">
                    {{ selectedLotId ? 'Edit Parking Lot' : 'Add New Parking Lot' }}
                  </h4>

                  <!-- Name -->
                  <div class="mb-3">
                    <label for="name" class="form-label">Parking Lot Name</label>
                    <input v-model="newLot.name" id="name" class="form-control shadow-sm" placeholder="e.g., Skyline Plaza Lot" required />
                  </div>

                  <!-- City and Area -->
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="city" class="form-label">City</label>
                      <select id="city" v-model="newLot.city" class="form-select shadow-sm" :disabled="selectedLotId" required>
                        <option value="" disabled>Select City</option>
                        <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                      </select>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="area" class="form-label">Area</label>
                      <input v-model="newLot.area" id="area" class="form-control shadow-sm" placeholder="e.g., Sector 5" required />
                    </div>
                  </div>

                  <!-- Address -->
                  <div class="mb-3">
                    <label for="address" class="form-label">Address</label>
                    <input v-model="newLot.address" id="address" class="form-control shadow-sm" placeholder="Street, Landmark, etc." required />
                  </div>

                  <!-- Pincode, Price, and Total Spots -->
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <label for="pincode" class="form-label">Pincode</label>
                      <input v-model="newLot.pincode" id="pincode" class="form-control shadow-sm" placeholder="e.g., 400001" required />
                    </div>

                    <div class="col-md-4 mb-3">
                      <label for="price" class="form-label">Hourly Price (₹)</label>
                      <input type="number" v-model.number="newLot.price" id="price" class="form-control shadow-sm" min="0" placeholder="₹" required />
                    </div>

                    <div class="col-md-4 mb-3">
                      <label for="total_spots" class="form-label">Total Spots</label>
                      <input type="number" v-model.number="newLot.total_spots" id="total_spots" class="form-control shadow-sm" min="1" required />
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="d-flex justify-content-end mt-4">
                    <button type="button" class="btn btn-outline-secondary me-3" @click="resetForm">
                      <i class="fas fa-times me-1"></i>Cancel
                    </button>
                    <button type="submit" class="btn btn-primary px-4">
                      <i class="fas fa-save me-1"></i>{{ selectedLotId ? 'Update' : 'Create' }}
                    </button>
                  </div>
                </form>


            </div>
          </div>
            <!-- Spot Details Modal -->
          <!-- Occupied Spot Modal -->
          <div v-if="showSpotOModal" class="modal-overlay"
              style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                      background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050;">
            <div class="bg-white rounded shadow-lg p-4" style="width: 450px; max-width: 95%;">
              <div class="text-center mb-3">
                <h5 class="text-danger fw-bold"><i class="fas fa-car-crash me-2"></i>Occupied Spot Details</h5>
                <hr />
              </div>

              <ul class="list-group list-group-flush mb-3">
                <li class="list-group-item"><strong>ID:</strong> {{ selectedSpot?.id || 'N/A' }}</li>
                <li class="list-group-item"><strong>Status:</strong> <span class="text-danger">Occupied</span></li>
                <li class="list-group-item"><strong>Spot No. :</strong> {{ selectedSpot?.spotNumber || 'N/A' }}</li>
                <li class="list-group-item"><strong>Customer ID:</strong> {{ selectedSpot?.customerId || 'N/A' }}</li>
                <li class="list-group-item"><strong>Customer Name:</strong> {{ selectedSpot?.userName || 'N/A' }}</li>
                <li class="list-group-item"><strong>Vehicle No:</strong> {{ selectedSpot?.vehicleNumber || 'N/A' }}</li>
                <li class="list-group-item"><strong>Check-in Time:</strong> {{ formatDate(selectedSpot?.checkIn) }}</li>
                <li class="list-group-item"><strong>Check-out Time:</strong> {{ formatDate(selectedSpot?.checkOut) || 'N/A' }}</li>
                <li class="list-group-item"><strong>Estimated Cost:</strong> ₹{{ selectedSpot?.cost || 'N/A' }}</li>
              </ul>

              <div class="d-flex justify-content-end">
                <button class="btn btn-secondary me-2" @click="showSpotOModal = false">
                  <i class="fas fa-times me-1"></i> Close
                </button>
                <button class="btn btn-danger" @click="deleteSpot">
                  <i class="fas fa-trash-alt me-1"></i> Delete Spot
                </button>
              </div>
            </div>
          </div>

              <!-- Available Spot Modal -->
              <div v-if="showSpotAModal" class="modal-overlay"
                  style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                          background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050;">
                <div class="bg-white rounded shadow-lg p-4" style="width: 450px; max-width: 95%;">
                  <div class="text-center mb-3">
                    <h5 class="text-success fw-bold"><i class="fas fa-parking me-2"></i>Available Spot Details</h5>
                    <hr />
                  </div>

                  <ul class="list-group list-group-flush mb-3">
                    <li class="list-group-item"><strong>ID:</strong> {{ selectedSpot?.id || 'N/A' }}</li>
                    <li class="list-group-item"><strong>Status:</strong> <span class="text-success">Available</span></li>
                    <li class="list-group-item"><strong>Spot No. :</strong> {{ selectedSpot?.spotNumber || 'N/A' }}</li>
                  </ul>

                  <div class="d-flex justify-content-end">
                    <button class="btn btn-secondary me-2" @click="showSpotAModal = false">
                      <i class="fas fa-times me-1"></i> Close
                    </button>
                    <button class="btn btn-danger" @click="deleteSpot">
                      <i class="fas fa-trash me-1"></i> Delete Spot
                    </button>
                  </div>
                </div>
              </div>


 <!-- History Table -->
               <div class="container mt-5">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h2 class="mb-0 text-primary"><i class="fas fa-history me-2"></i>Parking History</h2>
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
              <td>{{ res.user_name || 'N/A' }}<br/>User Id : {{ res.user_id }}</td>
              <td>{{ res.city }}</td>
              <td>{{ res.area }}</td>
              <td>{{ res.lot_name }}</td>
              <td>{{ res.vehicle_number }}</td>
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
                    {{ res.status.toUpperCase() }}
                  </span>
              </td>
              <td>₹{{ res.cost }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary" @click="showReservationDetails(res)">
                  <i class="fas fa-info-circle me-1"></i>Details
                </button>
              </td>
            </tr>
            <tr v-if="paginatedReservationHistory.length === 0">
              <td colspan="11" class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i>No matching reservation history found.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="d-flex justify-content-center align-items-center gap-3 mt-3">
          <button class="btn btn-outline-secondary" :disabled="currentPage === 1" @click="currentPage--">
            <i class="fas fa-chevron-left"></i> Prev
          </button>

          <span class="fw-bold">Page {{ currentPage }} of {{ totalPages }}</span>

          <button class="btn btn-outline-secondary" :disabled="currentPage === totalPages" @click="currentPage++">
            Next <i class="fas fa-chevron-right"></i>
          </button>
        </div>
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
                'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 
                //  more cities as needed
            ]
        };
    },
    created() {
        this.fetchAdminData();
        this.fetchUsers();
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
          const start = (this.currentPage - 1) * this.perPage;
          return this.filteredReservationHistory.slice(start, start + this.perPage);
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
        viewLot(lotId) {
            this.$router.push(`/admin/parking-lot/${lotId}`);
        },
        gotoprofit() {
            this.$router.push('/admin/profit-analytics');
        },
        async createOrUpdateParkingLot() {
            try {
              const token = localStorage.getItem('auth_token');
              const method = this.selectedLotId ? 'PUT' : 'POST';
              const url = this.selectedLotId ? `/api/lots/${this.selectedLotId}` : '/api/lots';

              const response = await fetch(url, {
                method,
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-Token': token
                },
                credentials: 'include',
                body: JSON.stringify(this.newLot)
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save parking lot');
              }

              alert(this.selectedLotId ? 'Parking lot updated successfully' : 'Parking lot created successfully');

              // Reset form
              this.newLot = {
                name: '',
                city: '',
                area: '',
                address: '',
                pincode: '',
                price: null,
                total_spots: null
              };
              this.selectedLotId = null;
              this.showAddForm = false;

              // Reload lots
              this.fetchParkingLots();

            } catch (error) {
              console.error('Save error:', error);
              alert('Error: ' + error.message);
            }
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
            console.log("Fetched parking lots:", data);

            // Check if response is an array
            if (Array.isArray(data)) {
              this.parkingLots = data.filter(lot => lot && lot.id);
            } else {
              this.parkingLots = [];  // No lots found or unexpected structure
            }

          } catch (error) {
            console.error('Error fetching parking lots:', error);
            this.error = error.message;
          }
        },

        isSpotOccupied(lot, spotNumber) {
          return lot.spots?.some(s => s.spot_number === spotNumber && s.status === 'O');
        },
              
        handleSpotClickDirect(spot) {
            if (spot.status === 'O') {
              this.selectedSpot = {
                id: spot.id,
                status: spot.status,
                spotNumber: spot.spot_number,
                customerId: spot.reservation?.user_id,
                userName: spot.reservation?.user_name[0],
                vehicleNumber: spot.reservation?.vehicle_number,
                checkIn: spot.reservation?.check_in,
                checkOut: spot.reservation?.check_out,
                cost: spot.reservation?.cost
              };
              this.showSpotOModal = true;
            } else {
              this.selectedSpot = {
                id: spot.id,
                status: spot.status,
                spotNumber: spot.spot_number,
              };
              this.showSpotAModal = true;
            }
          },

      editLot(lot) {
        // Redirect or open edit modal
            this.newLot = { ...lot }; // pre-fill form
            this.selectedLotId = lot.id;
            this.showAddForm = true;           
      },

      async deleteLot(lotId) {
        if (!confirm('Are you sure you want to delete this parking lot?')) return;

        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/lots/${lotId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': token
            },
            credentials: 'include'
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete parking lot');
          }

          alert('Parking lot deleted successfully.');
          this.fetchParkingLots();
        } catch (error) {
          console.error('Delete error:', error);
          alert('Error: ' + error.message);
        }
      },
        resetForm() {
          this.selectedLotId = null;
          this.newLot = {
            name: '',
            city: '',
            area: '',
            address: '',
            pincode: '',
            price: null,
            total_spots: null
          };
          this.showAddForm = false;
        },
        formatDate(dateStr) {
          if (!dateStr) return { date: 'N/A', time: '' };
          const d = new Date(dateStr);
          const date = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
          const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          return { date, time };
        },

        async deleteSpot() {
            if (!this.selectedSpot || this.selectedSpot.status === 'O') {
              alert("Occupied spots cannot be deleted.");
              return;
            }

            if (!confirm("Are you sure you want to delete this available spot?")) return;

            try {
              const token = localStorage.getItem('auth_token');
              const response = await fetch(`/api/spots/${this.selectedSpot.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-Token': token
                },
                credentials: 'include'
              });

              const data = await response.json().catch(() => {
                throw new Error('Server did not return valid JSON');
              });

              if (!response.ok) throw new Error(data.message || 'Deletion failed');

              alert(data.message);
              this.showSpotAModal = false;
              this.fetchParkingLots(); // Refresh parking data

            } catch (error) {
              console.error('Delete spot error:', error);
              alert('Error: ' + error.message);
            }
          },

          async fetchReservationHistory() {
              try {
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
              }
            },

        showReservationDetails(reservation) {
            this.selectedReservation = reservation;
        }


      



    },
    mounted() {
        this.fetchParkingLots();
        this.fetchReservationHistory();


    },
   

=======
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
                    <i class="fas fa-users fa-3x align-items-center"></i>

                    <h5 class="card-title ">Total Users - {{ users.length }}</h5>
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

                    <h5 class="card-title">Parking Spots - {{parkingLots.length}} </h5>
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
                <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Profit</h2>
            <button class="btn btn-primary" @click="gotoprofit">
              <i class="fas fa-plus me-2"></i>Profit
            </button>
          </div>

        <!-- Parking Lots Section -->
        <div class="py-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Parking Lots</h2>
            <button class="btn btn-primary" @click="showAddForm = !showAddForm">
              <i class="fas fa-plus me-2"></i>+ Add Parking Lot
            </button>
          </div>
                  

          <div class="row">
            <div v-for="lot in parkingLots" :key="lot.id" class="col-md-4 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title mb-0">{{ lot.name }}</h5>
                    <div>
                      <a href="#" @click.prevent="editLot(lot)" class="text-primary me-2">Edit</a>
                      <a href="#" @click.prevent="deleteLot(lot.id)" class="text-danger">Delete</a>
                    </div>
                  </div>
                  <p class="text-success mb-2">
                    (Occupied: {{ lot.total_spots - lot.available_spots }}/{{ lot.total_spots }})
                  </p>
                  <p class="card-text mb-2">
                    <strong>City:</strong> {{ lot.city }}<br />
                    <strong>Area:</strong> {{ lot.area }}<br />
                    <strong>Address:</strong> {{ lot.address }}<br />
                    <strong>Pincode:</strong> {{ lot.pincode }}<br />
                    <strong>Price:</strong> ₹{{ lot.price }} per hour
                  </p>

                  <!-- Parking spot grid -->
                  <div class="d-flex flex-wrap gap-2">
                    <button
                      v-for="spot in lot.spots"
                      :key="'spot-' + spot.id"
                      class="spot-box btn btn-sm fw-bold d-flex align-items-center justify-content-center"
                      :class="spot.status === 'O' ? 'btn-danger' : 'btn-success'"
                      style="width: 30px; height: 30px; padding: 0;"
                      @click="handleSpotClickDirect(spot)"
                    >
                      {{ spot.status === 'O' ? 'O' : 'A' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

    <!-- Add Lot Button Card -->
    <div class="col-md-4 mb-4">
      <div class="card h-100 border-primary text-center" style="cursor: pointer;" @click="showAddForm = true">
        <div class="card-body d-flex flex-column justify-content-center align-items-center">
          <i class="fas fa-plus fa-2x text-primary mb-2"></i>
          <strong class="text-primary">+ Add Lot</strong>
        </div>
      </div>
    </div>
  </div>
</div>
        </div>

        <!-- Add Parking Lot Form (conditionally shown) -->
          <!-- Add Parking Lot Modal -->
          <div v-if="showAddForm" class="modal-overlay" 
              style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                      background: rgba(0, 0, 0, 0.5); display: flex; 
                      justify-content: center; align-items: center; z-index: 999;">
            
            <div class="modal-content" 
                style="background: white; padding: 20px; border-radius: 8px; width: 500px; 
                        max-width: 95%; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">

              <h5 class="mb-3">{{ selectedLotId ? 'Edit Parking Lot' : 'Add New Parking Lot' }}</h5>
                <form @submit.prevent="createOrUpdateParkingLot" class="p-4 border rounded shadow-sm bg-light">
                  <h4 class="mb-4 text-primary fw-bold">
                    {{ selectedLotId ? 'Edit Parking Lot' : 'Add New Parking Lot' }}
                  </h4>

                  <!-- Name -->
                  <div class="mb-3">
                    <label for="name" class="form-label">Parking Lot Name</label>
                    <input v-model="newLot.name" id="name" class="form-control shadow-sm" placeholder="e.g., Skyline Plaza Lot" required />
                  </div>

                  <!-- City and Area -->
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="city" class="form-label">City</label>
                      <select id="city" v-model="newLot.city" class="form-select shadow-sm" :disabled="selectedLotId" required>
                        <option value="" disabled>Select City</option>
                        <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                      </select>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="area" class="form-label">Area</label>
                      <input v-model="newLot.area" id="area" class="form-control shadow-sm" placeholder="e.g., Sector 5" required />
                    </div>
                  </div>

                  <!-- Address -->
                  <div class="mb-3">
                    <label for="address" class="form-label">Address</label>
                    <input v-model="newLot.address" id="address" class="form-control shadow-sm" placeholder="Street, Landmark, etc." required />
                  </div>

                  <!-- Pincode, Price, and Total Spots -->
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <label for="pincode" class="form-label">Pincode</label>
                      <input v-model="newLot.pincode" id="pincode" class="form-control shadow-sm" placeholder="e.g., 400001" required />
                    </div>

                    <div class="col-md-4 mb-3">
                      <label for="price" class="form-label">Hourly Price (₹)</label>
                      <input type="number" v-model.number="newLot.price" id="price" class="form-control shadow-sm" min="0" placeholder="₹" required />
                    </div>

                    <div class="col-md-4 mb-3">
                      <label for="total_spots" class="form-label">Total Spots</label>
                      <input type="number" v-model.number="newLot.total_spots" id="total_spots" class="form-control shadow-sm" min="1" required />
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="d-flex justify-content-end mt-4">
                    <button type="button" class="btn btn-outline-secondary me-3" @click="resetForm">
                      <i class="fas fa-times me-1"></i>Cancel
                    </button>
                    <button type="submit" class="btn btn-primary px-4">
                      <i class="fas fa-save me-1"></i>{{ selectedLotId ? 'Update' : 'Create' }}
                    </button>
                  </div>
                </form>


            </div>
          </div>
            <!-- Spot Details Modal -->
          <!-- Occupied Spot Modal -->
          <div v-if="showSpotOModal" class="modal-overlay"
              style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                      background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050;">
            <div class="bg-white rounded shadow-lg p-4" style="width: 450px; max-width: 95%;">
              <div class="text-center mb-3">
                <h5 class="text-danger fw-bold"><i class="fas fa-car-crash me-2"></i>Occupied Spot Details</h5>
                <hr />
              </div>

              <ul class="list-group list-group-flush mb-3">
                <li class="list-group-item"><strong>ID:</strong> {{ selectedSpot?.id || 'N/A' }}</li>
                <li class="list-group-item"><strong>Status:</strong> <span class="text-danger">Occupied</span></li>
                <li class="list-group-item"><strong>Spot No. :</strong> {{ selectedSpot?.spotNumber || 'N/A' }}</li>
                <li class="list-group-item"><strong>Customer ID:</strong> {{ selectedSpot?.customerId || 'N/A' }}</li>
                <li class="list-group-item"><strong>Customer Name:</strong> {{ selectedSpot?.userName || 'N/A' }}</li>
                <li class="list-group-item"><strong>Vehicle No:</strong> {{ selectedSpot?.vehicleNumber || 'N/A' }}</li>
                <li class="list-group-item"><strong>Check-in Time:</strong> {{ formatDate(selectedSpot?.checkIn) }}</li>
                <li class="list-group-item"><strong>Check-out Time:</strong> {{ formatDate(selectedSpot?.checkOut) || 'N/A' }}</li>
                <li class="list-group-item"><strong>Estimated Cost:</strong> ₹{{ selectedSpot?.cost || 'N/A' }}</li>
              </ul>

              <div class="d-flex justify-content-end">
                <button class="btn btn-secondary me-2" @click="showSpotOModal = false">
                  <i class="fas fa-times me-1"></i> Close
                </button>
                <button class="btn btn-danger" @click="deleteSpot">
                  <i class="fas fa-trash-alt me-1"></i> Delete Spot
                </button>
              </div>
            </div>
          </div>

              <!-- Available Spot Modal -->
              <div v-if="showSpotAModal" class="modal-overlay"
                  style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                          background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050;">
                <div class="bg-white rounded shadow-lg p-4" style="width: 450px; max-width: 95%;">
                  <div class="text-center mb-3">
                    <h5 class="text-success fw-bold"><i class="fas fa-parking me-2"></i>Available Spot Details</h5>
                    <hr />
                  </div>

                  <ul class="list-group list-group-flush mb-3">
                    <li class="list-group-item"><strong>ID:</strong> {{ selectedSpot?.id || 'N/A' }}</li>
                    <li class="list-group-item"><strong>Status:</strong> <span class="text-success">Available</span></li>
                    <li class="list-group-item"><strong>Spot No. :</strong> {{ selectedSpot?.spotNumber || 'N/A' }}</li>
                  </ul>

                  <div class="d-flex justify-content-end">
                    <button class="btn btn-secondary me-2" @click="showSpotAModal = false">
                      <i class="fas fa-times me-1"></i> Close
                    </button>
                    <button class="btn btn-danger" @click="deleteSpot">
                      <i class="fas fa-trash me-1"></i> Delete Spot
                    </button>
                  </div>
                </div>
              </div>


 <!-- History Table -->
               <div class="container mt-5">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h2 class="mb-0 text-primary"><i class="fas fa-history me-2"></i>Parking History</h2>
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
              <td>{{ res.user_name || 'N/A' }}<br/>User Id : {{ res.user_id }}</td>
              <td>{{ res.city }}</td>
              <td>{{ res.area }}</td>
              <td>{{ res.lot_name }}</td>
              <td>{{ res.vehicle_number }}</td>
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
                    {{ res.status.toUpperCase() }}
                  </span>
              </td>
              <td>₹{{ res.cost }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary" @click="showReservationDetails(res)">
                  <i class="fas fa-info-circle me-1"></i>Details
                </button>
              </td>
            </tr>
            <tr v-if="paginatedReservationHistory.length === 0">
              <td colspan="11" class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i>No matching reservation history found.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="d-flex justify-content-center align-items-center gap-3 mt-3">
          <button class="btn btn-outline-secondary" :disabled="currentPage === 1" @click="currentPage--">
            <i class="fas fa-chevron-left"></i> Prev
          </button>

          <span class="fw-bold">Page {{ currentPage }} of {{ totalPages }}</span>

          <button class="btn btn-outline-secondary" :disabled="currentPage === totalPages" @click="currentPage++">
            Next <i class="fas fa-chevron-right"></i>
          </button>
        </div>
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
                'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 
                //  more cities as needed
            ]
        };
    },
    created() {
        this.fetchAdminData();
        this.fetchUsers();
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
          const start = (this.currentPage - 1) * this.perPage;
          return this.filteredReservationHistory.slice(start, start + this.perPage);
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
        viewLot(lotId) {
            this.$router.push(`/admin/parking-lot/${lotId}`);
        },
        gotoprofit() {
            this.$router.push('/admin/profit-analytics');
        },
        async createOrUpdateParkingLot() {
            try {
              const token = localStorage.getItem('auth_token');
              const method = this.selectedLotId ? 'PUT' : 'POST';
              const url = this.selectedLotId ? `/api/lots/${this.selectedLotId}` : '/api/lots';

              const response = await fetch(url, {
                method,
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-Token': token
                },
                credentials: 'include',
                body: JSON.stringify(this.newLot)
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save parking lot');
              }

              alert(this.selectedLotId ? 'Parking lot updated successfully' : 'Parking lot created successfully');

              // Reset form
              this.newLot = {
                name: '',
                city: '',
                area: '',
                address: '',
                pincode: '',
                price: null,
                total_spots: null
              };
              this.selectedLotId = null;
              this.showAddForm = false;

              // Reload lots
              this.fetchParkingLots();

            } catch (error) {
              console.error('Save error:', error);
              alert('Error: ' + error.message);
            }
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
            console.log("Fetched parking lots:", data);

            // Check if response is an array
            if (Array.isArray(data)) {
              this.parkingLots = data.filter(lot => lot && lot.id);
            } else {
              this.parkingLots = [];  // No lots found or unexpected structure
            }

          } catch (error) {
            console.error('Error fetching parking lots:', error);
            this.error = error.message;
          }
        },

        isSpotOccupied(lot, spotNumber) {
          return lot.spots?.some(s => s.spot_number === spotNumber && s.status === 'O');
        },
              
        handleSpotClickDirect(spot) {
            if (spot.status === 'O') {
              this.selectedSpot = {
                id: spot.id,
                status: spot.status,
                spotNumber: spot.spot_number,
                customerId: spot.reservation?.user_id,
                userName: spot.reservation?.user_name[0],
                vehicleNumber: spot.reservation?.vehicle_number,
                checkIn: spot.reservation?.check_in,
                checkOut: spot.reservation?.check_out,
                cost: spot.reservation?.cost
              };
              this.showSpotOModal = true;
            } else {
              this.selectedSpot = {
                id: spot.id,
                status: spot.status,
                spotNumber: spot.spot_number,
              };
              this.showSpotAModal = true;
            }
          },

      editLot(lot) {
        // Redirect or open edit modal
            this.newLot = { ...lot }; // pre-fill form
            this.selectedLotId = lot.id;
            this.showAddForm = true;           
      },

      async deleteLot(lotId) {
        if (!confirm('Are you sure you want to delete this parking lot?')) return;

        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/lots/${lotId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': token
            },
            credentials: 'include'
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete parking lot');
          }

          alert('Parking lot deleted successfully.');
          this.fetchParkingLots();
        } catch (error) {
          console.error('Delete error:', error);
          alert('Error: ' + error.message);
        }
      },
        resetForm() {
          this.selectedLotId = null;
          this.newLot = {
            name: '',
            city: '',
            area: '',
            address: '',
            pincode: '',
            price: null,
            total_spots: null
          };
          this.showAddForm = false;
        },
        formatDate(dateStr) {
          if (!dateStr) return { date: 'N/A', time: '' };
          const d = new Date(dateStr);
          const date = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
          const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          return { date, time };
        },

        async deleteSpot() {
            if (!this.selectedSpot || this.selectedSpot.status === 'O') {
              alert("Occupied spots cannot be deleted.");
              return;
            }

            if (!confirm("Are you sure you want to delete this available spot?")) return;

            try {
              const token = localStorage.getItem('auth_token');
              const response = await fetch(`/api/spots/${this.selectedSpot.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-Token': token
                },
                credentials: 'include'
              });

              const data = await response.json().catch(() => {
                throw new Error('Server did not return valid JSON');
              });

              if (!response.ok) throw new Error(data.message || 'Deletion failed');

              alert(data.message);
              this.showSpotAModal = false;
              this.fetchParkingLots(); // Refresh parking data

            } catch (error) {
              console.error('Delete spot error:', error);
              alert('Error: ' + error.message);
            }
          },

          async fetchReservationHistory() {
              try {
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
              }
            },

        showReservationDetails(reservation) {
            this.selectedReservation = reservation;
        }


      



    },
    mounted() {
        this.fetchParkingLots();
        this.fetchReservationHistory();


    },
   

>>>>>>> cac058d (export backend done)
}