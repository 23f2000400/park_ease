export default {
    template: `
    <div class="admin-dashboard">
        <!-- Header Section -->
        <div class="dashboard-header bg-primary text-white p-4 shadow">
            <div class="container">
                <h1 class="mb-0"><i class="fas fa-tachometer-alt me-2"></i>Admin Dashboard</h1>
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
                                    <h5 class="card-title">Total Users</h5>
                                    <h2 class="mb-0">{{ users.length }}</h2>
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
                                    <h2 class="mb-0">{{ parkingSpots.length }}</h2>
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
                                    <h2 class="mb-0">{{ activeBookingsCount }}</h2>
                                </div>
                                <i class="fas fa-calendar-check fa-3x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Users Section -->
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <h2 class="h5 mb-0"><i class="fas fa-users me-2"></i>Manage Users</h2>
                    <button class="btn btn-sm btn-primary" @click="showAddUserModal = true">
                        <i class="fas fa-plus me-1"></i> Add User
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
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
                                    <td><span class="badge bg-secondary">{{ user.role }}</span></td>
                                    <td>
                                        <span class="badge" :class="user.active ? 'bg-success' : 'bg-danger'">
                                            {{ user.active ? 'Active' : 'Inactive' }}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary me-1" @click="editUser(user)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="confirmDelete('user', user.id, user.name)">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="usersLoading">
                                    <td colspan="7" class="text-center py-4">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-else-if="users.length === 0">
                                    <td colspan="7" class="text-center text-muted py-4">
                                        No users found
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Parking Spots Section -->
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <h2 class="h5 mb-0"><i class="fas fa-parking me-2"></i>Manage Parking Spots</h2>
                    <button class="btn btn-sm btn-primary" @click="showAddSpotModal = true">
                        <i class="fas fa-plus me-1"></i> Add Spot
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Location</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Price/Hour</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="spot in parkingSpots" :key="spot.id">
                                    <td>{{ spot.id }}</td>
                                    <td>{{ spot.location }}</td>
                                    <td><span class="badge" :class="spot.type === 'premium' ? 'bg-warning' : 'bg-info'">{{ spot.type }}</span></td>
                                    <td>
                                        <span class="badge" :class="spot.status === 'available' ? 'bg-success' : 'bg-danger'">
                                            {{ spot.status }}
                                        </span>
                                    </td>
                                    <td>{{ formatCurrency(spot.price_per_hour) }}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary me-1" @click="editSpot(spot)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="confirmDelete('spot', spot.id, spot.location)">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="spotsLoading">
                                    <td colspan="6" class="text-center py-4">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-else-if="parkingSpots.length === 0">
                                    <td colspan="6" class="text-center text-muted py-4">
                                        No parking spots found
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Bookings Section -->
            <div class="card shadow-sm">
                <div class="card-header bg-white">
                    <h2 class="h5 mb-0"><i class="fas fa-calendar-alt me-2"></i>Manage Bookings</h2>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <select class="form-select" v-model="bookingFilter" @change="fetchBookings">
                                <option value="all">All Bookings</option>
                                <option value="active">Active Only</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Spot</th>
                                    <th>Check-In</th>
                                    <th>Check-Out</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="booking in bookings" :key="booking.id">
                                    <td>{{ booking.id }}</td>
                                    <td>{{ booking.user.name }}</td>
                                    <td>{{ booking.parking_spot.location }}</td>
                                    <td>{{ formatDateTime(booking.check_in) }}</td>
                                    <td>{{ booking.check_out ? formatDateTime(booking.check_out) : '-' }}</td>
                                    <td>{{ formatCurrency(booking.amount) }}</td>
                                    <td>
                                        <span class="badge" :class="getBookingStatusClass(booking.status)">
                                            {{ booking.status }}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary me-1" @click="viewBooking(booking.id)">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="confirmDelete('booking', booking.id, 'booking #' + booking.id)">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="bookingsLoading">
                                    <td colspan="8" class="text-center py-4">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-else-if="bookings.length === 0">
                                    <td colspan="8" class="text-center text-muted py-4">
                                        No bookings found
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Delete</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete {{ itemToDelete.type }} <strong>{{ itemToDelete.name }}</strong>?</p>
                        <p class="text-danger">This action cannot be undone.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" @click="deleteItem">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            users: [],
            parkingSpots: [],
            bookings: [],
            usersLoading: false,
            spotsLoading: false,
            bookingsLoading: false,
            bookingFilter: 'all',
            itemToDelete: {
                type: '',
                id: null,
                name: ''
            }
        };
    },
    computed: {
        activeBookingsCount() {
            return this.bookings.filter(b => b.status === 'active').length;
        }
    },
    created() {
        this.fetchUsers();
        this.fetchParkingSpots();
        this.fetchBookings();
    },
    methods: {
        async fetchUsers() {
            this.usersLoading = true;
            try {
                const response = await fetch('/api/users');
                const data = await response.json();
                this.users = data.map(user => ({
                    ...user,
                    phone: user.phone || '-',
                    role: user.role || 'user',
                    active: user.active !== false
                }));
            } catch (error) {
                console.error('Error fetching users:', error);
                this.users = [];
            } finally {
                this.usersLoading = false;
            }
        },
        
        async fetchParkingSpots() {
            this.spotsLoading = true;
            try {
                const response = await fetch('/api/parking-spots');
                const data = await response.json();
                this.parkingSpots = data.map(spot => ({
                    ...spot,
                    price_per_hour: spot.price_per_hour ? parseFloat(spot.price_per_hour) : 0,
                    type: spot.type || 'regular',
                    status: spot.status || 'available'
                }));
            } catch (error) {
                console.error('Error fetching parking spots:', error);
                this.parkingSpots = [];
            } finally {
                this.spotsLoading = false;
            }
        },
        
        async fetchBookings() {
            this.bookingsLoading = true;
            try {
                const url = `/api/bookings?status=${this.bookingFilter}`;
                const response = await fetch(url);
                const data = await response.json();
                this.bookings = data.map(booking => ({
                    ...booking,
                    amount: booking.amount ? parseFloat(booking.amount) : 0,
                    check_in: booking.check_in || new Date().toISOString(),
                    check_out: booking.check_out || null,
                    status: booking.status || 'pending',
                    user: {
                        name: booking.user?.name || 'Unknown User',
                        ...booking.user
                    },
                    parking_spot: {
                        location: booking.parking_spot?.location || 'Unknown Location',
                        ...booking.parking_spot
                    }
                }));
            } catch (error) {
                console.error('Error fetching bookings:', error);
                this.bookings = [];
            } finally {
                this.bookingsLoading = false;
            }
        },
        
        formatCurrency(value) {
            if (value === null || value === undefined || isNaN(value)) {
                return '$0.00';
            }
            return '$' + parseFloat(value).toFixed(2);
        },
        
        formatDateTime(dateTime) {
            if (!dateTime) return '-';
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateTime).toLocaleDateString('en-US', options);
        },
        
        getBookingStatusClass(status) {
            switch (status.toLowerCase()) {
                case 'active': return 'bg-primary';
                case 'completed': return 'bg-success';
                case 'cancelled': return 'bg-danger';
                default: return 'bg-secondary';
            }
        },
        
        confirmDelete(type, id, name) {
            this.itemToDelete = { type, id, name };
            const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
            modal.show();
        },
        
        async deleteItem() {
            try {
                const { type, id } = this.itemToDelete;
                const response = await fetch(`/api/${type}s/${id}`, { 
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });
                
                if (!response.ok) throw new Error('Delete failed');
                
                // Refresh the data
                if (type === 'user') this.fetchUsers();
                if (type === 'spot') this.fetchParkingSpots();
                if (type === 'booking') this.fetchBookings();
                
                // Close the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                modal.hide();
                
            } catch (error) {
                console.error(`Error deleting ${this.itemToDelete.type}:`, error);
                alert(`Failed to delete ${this.itemToDelete.type}`);
            }
        },
        
        editUser(user) {
            // Implement edit user functionality
            console.log('Edit user:', user);
        },
        
        editSpot(spot) {
            // Implement edit spot functionality
            console.log('Edit spot:', spot);
        },
        
        viewBooking(id) {
            // Implement view booking details
            console.log('View booking:', id);
        }
    }
};