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
            <!-- Loading State -->
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            
            <!-- Error State -->
            <div v-else-if="error" class="alert alert-danger">
                {{ error }}
            </div>
            
            <!-- Success State -->
            <div v-else class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Admin Profile</h5>
                            <p class="card-text">
                                <strong>Name:</strong> {{ user.name || 'N/A' }}<br>
                                <strong>Email:</strong> {{ user.email || 'N/A' }}<br>
                                <strong>Username:</strong> {{ user.username || 'N/A' }}<br>
                                <strong>Roles:</strong> {{ user.roles ? user.roles.join(', ') : 'N/A' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            user: {
                name: '',
                email: '',
                username: '',
                roles: []
            },
            loading: true,
            error: null
        };
    },
    created() {
        this.fetchUserData();
    },
    methods: {
        async fetchUserData() {
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
        this.user = userData;
    } catch (error) {
        console.error('Fetch error:', error);
        this.error = error.message;
    } finally {
        this.loading = false;
    }
}
    }
}
