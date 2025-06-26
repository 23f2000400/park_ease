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
                    <h5 class="card-title">Total Users - {{ users.length }}</h5>
                  </div>
                  <i class="fas fa-users fa-3x"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card stat-card bg-success text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="card-title">Parking Spots</h5>
                  </div>
                  <i class="fas fa-parking fa-3x"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card stat-card bg-warning text-dark">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="card-title">Active Bookings</h5>
                  </div>
                  <i class="fas fa-calendar-check fa-3x"></i>
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

        <!-- Parking Lots Section -->
        <div class="py-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Parking Lots</h2>
            <button class="btn btn-primary" @click="showAddForm = !showAddForm">
              <i class="fas fa-plus me-2"></i>Add Parking Lot
            </button>
          </div>
                  
        <div class="py-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Parking Lots</h2>
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
                    <strong>Area:</strong> {{ lot.area }}<br />
                    <strong>Address:</strong> {{ lot.address }}<br />
                    <strong>Pincode:</strong> {{ lot.pincode }}<br />
                    <strong>Price:</strong> ₹{{ lot.price }} per hour
                  </p>

                  <!-- Parking spot grid -->
                  <div class="d-flex flex-wrap gap-2">
                    <button
                      v-for="n in lot.total_spots"
                        :key="'spot-' + lot.id + '-' + n"

                      class="spot-box btn btn-sm fw-bold d-flex align-items-center justify-content-center"
                      :class="isSpotOccupied(lot, n) ? 'btn-danger' : 'btn-success'"
                      style="width: 30px; height: 30px; padding: 0;"
                      @click="handleSpotClick(lot, n)"
                    >
                      {{ isSpotOccupied(lot, n) ? 'O' : 'A' }}
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
          <strong class="text-primary">Add Lot</strong>
        </div>
      </div>
    </div>
  </div>
</div>
        </div>

        <!-- Add Parking Lot Form (conditionally shown) -->
        <div class="card mt-4" v-if="showAddForm">
          <div class="card-body">
            <h5 class="card-title">Add New Parking Lot</h5>
            <form @submit.prevent="createOrUpdateParkingLot">
              <div class="row mb-3">
                <div class="col-md-6">
                  <input v-model="newLot.name" class="form-control" placeholder="Name" required />
                </div>
                <div class="col-md-6">
                  <input v-model="newLot.area" class="form-control" placeholder="Area" required />
                </div>
              </div>
              <div class="mb-3">
                <input v-model="newLot.address" class="form-control" placeholder="Address" required />
              </div>
              <div class="row mb-3">
                <div class="col-md-4">
                  <input v-model="newLot.pincode" class="form-control" placeholder="Pincode" required />
                </div>
                <div class="col-md-4">
                  <input type="number" v-model.number="newLot.price" class="form-control" placeholder="Price" required />
                </div>
                <div class="col-md-4">
                  <input type="number" v-model.number="newLot.total_spots" class="form-control" placeholder="Total Spots" required />
                </div>
              </div>
              <h5 class="card-title">{{ selectedLotId ? 'Edit Parking Lot' : 'Add New Parking Lot' }}</h5>
              <button type="submit" class="btn btn-primary">
                {{ selectedLotId ? 'Update Parking Lot' : 'Create Parking Lot' }}
              </button>              
            </form><button type="button" class="btn btn-secondary ms-2" @click="resetForm">Cancel</button>

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
            selectedLotId: null, // <--- track if editing

            newLot: {
                name: '',
                area: '',
                address: '',
                pincode: '',
                price: null,
                total_spots: null
            },
        };
    },
    created() {
        this.fetchAdminData();
        this.fetchUsers();
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
              
        handleSpotClick(lot, spotNumber) {
          const spot = lot.spots?.find(s => s.spot_number === spotNumber);
          if (spot && spot.status === 'O') {
            alert(`Occupied by: ${spot.vehicle_number || 'N/A'}`);
            // You can also show a modal here instead of alert
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
      area: '',
      address: '',
      pincode: '',
      price: null,
      total_spots: null
    };
    this.showAddForm = false;
  }
      



    },
    mounted() {
        this.fetchParkingLots();

    },
   

}