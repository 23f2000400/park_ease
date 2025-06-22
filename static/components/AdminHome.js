export default {
    template: `
        <div class="admin-dashboard">
            <!-- Header Section -->
            <div class="dashboard-header bg-primary text-white p-4 shadow">
                <div class="container">
                    <h1 class="mb-0"><i class="fas fa-tachometer-alt me-2"></i>Admin Dashboard</h1>
                </div>
            </div>
            
            <div class="container mt-4">
                <!-- Success State -->
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Admin Profile</h5>
                                <p class="card-text">
                                    <strong>Name:</strong> {{ admin.name || 'N/A' }}<br>
                                    <strong>Email:</strong> {{ admin.email || 'N/A' }}<br>
                                    <strong>Username:</strong> {{ admin.username || 'N/A' }}<br>
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
                <div class="card shadow-sm mb-4">
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
            usersLoading: false
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
            method: 'GET',  // Explicitly set method
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Authentication-Token': token  // Add this if your backend expects it
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
                        'Authentication-Token': token  // Add this if your backend expects it

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
        }
    }
}