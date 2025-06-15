export default {
    template: `
    <div class="parking-dashboard">
        <!-- Header with User Info -->
        <header class="dashboard-header">
            <div class="user-greeting">
                <h1>Welcome back, <span class="user-name">{{ userData.name || 'Valued Customer' }}</span></h1>
                <p class="last-login">Last login: {{ formatDate(new Date()) }}</p>
            </div>
            <div class="quick-stats">
                <div class="stat-card">
                    <div class="stat-icon bg-primary">
                        <i class="fas fa-car"></i>
                    </div>
                    <div class="stat-info">
                        <h3>3</h3>
                        <p>Active Bookings</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>12</h3>
                        <p>Completed Trips</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-warning">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Gold</h3>
                        <p>Membership Tier</p>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content Area -->
        <main class="dashboard-content">
            <!-- Quick Actions -->
            <section class="quick-actions">
                <h2 class="section-title">Quick Actions</h2>
                <div class="action-grid">
                    <button class="action-btn">
                        <i class="fas fa-plus-circle"></i>
                        <span>New Booking</span>
                    </button>
                    <button class="action-btn">
                        <i class="fas fa-calendar-alt"></i>
                        <span>My Bookings</span>
                    </button>
                    <button class="action-btn">
                        <i class="fas fa-map-marked-alt"></i>
                        <span>Find Parking</span>
                    </button>
                    <button class="action-btn">
                        <i class="fas fa-wallet"></i>
                        <span>Payment Methods</span>
                    </button>
                </div>
            </section>

            <!-- Upcoming Bookings -->
            <section class="upcoming-bookings">
                <div class="section-header">
                    <h2 class="section-title">Upcoming Bookings</h2>
                    <a href="#" class="view-all">View All</a>
                </div>
                <div class="booking-card featured">
                    <div class="booking-info">
                        <h3>Airport Parking</h3>
                        <p class="location"><i class="fas fa-map-marker-alt"></i> JFK International Airport</p>
                        <div class="booking-details">
                            <div class="detail">
                                <i class="fas fa-calendar-day"></i>
                                <span>Tomorrow, 9:00 AM</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-clock"></i>
                                <span>3 days</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-dollar-sign"></i>
                                <span>$42.00</span>
                            </div>
                        </div>
                    </div>
                    <div class="booking-actions">
                        <button class="btn btn-sm btn-outline">Details</button>
                        <button class="btn btn-sm btn-primary">Extend</button>
                    </div>
                </div>
                <div class="booking-card">
                    <div class="booking-info">
                        <h3>Downtown Garage</h3>
                        <p class="location"><i class="fas fa-map-marker-alt"></i> 123 Main Street</p>
                        <div class="booking-details">
                            <div class="detail">
                                <i class="fas fa-calendar-day"></i>
                                <span>Fri, Jun 18, 2:00 PM</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-clock"></i>
                                <span>5 hours</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-dollar-sign"></i>
                                <span>$18.50</span>
                            </div>
                        </div>
                    </div>
                    <div class="booking-actions">
                        <button class="btn btn-sm btn-outline">Details</button>
                        <button class="btn btn-sm btn-primary">Modify</button>
                    </div>
                </div>
            </section>

            <!-- Recent Activity & Notifications -->
            <section class="activity-section">
                <div class="recent-activity">
                    <h2 class="section-title">Recent Activity</h2>
                    <ul class="activity-list">
                        <li class="activity-item">
                            <div class="activity-icon success">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="activity-content">
                                <p>Booking completed at Airport Parking</p>
                                <small>Today, 10:30 AM</small>
                            </div>
                            <span class="activity-amount">-$42.00</span>
                        </li>
                        <li class="activity-item">
                            <div class="activity-icon primary">
                                <i class="fas fa-plus"></i>
                            </div>
                            <div class="activity-content">
                                <p>Added new payment method</p>
                                <small>Yesterday, 4:15 PM</small>
                            </div>
                        </li>
                        <li class="activity-item">
                            <div class="activity-icon warning">
                                <i class="fas fa-exclamation"></i>
                            </div>
                            <div class="activity-content">
                                <p>Received parking reminder</p>
                                <small>Jun 12, 9:00 AM</small>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="notifications">
                    <h2 class="section-title">Notifications</h2>
                    <div class="notification-card important">
                        <div class="notification-icon">
                            <i class="fas fa-bell"></i>
                        </div>
                        <div class="notification-content">
                            <h4>Special Weekend Offer!</h4>
                            <p>Get 20% off all downtown parking this weekend with code PARK20</p>
                            <small>Expires in 2 days</small>
                        </div>
                    </div>
                    <div class="notification-card">
                        <div class="notification-icon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="notification-content">
                            <h4>New Feature Available</h4>
                            <p>Try our new automated parking extension feature</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
    `,
    data() {
        return {
            userData: {},
            isLoading: true,
            error: null
        };
    },
    methods: {
        async fetchUserData() {
            this.isLoading = true;
            this.error = null;
            
            try {
                const response = await fetch('/api/user/home', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authentication-Token": localStorage.getItem('auth_token')  
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                
                const data = await response.json();
                
                if (!data || Object.keys(data).length === 0) {
                    this.$router.push('/login');
                    return;
                }
                
                this.userData = data;
            } catch (err) {
                console.error('Error fetching user data:', err);
                this.error = err.message;
                this.$router.push('/login');
            } finally {
                this.isLoading = false;
            }
        },
        formatDate(date) {
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }
    },
    mounted() {
        this.fetchUserData();
    }
};