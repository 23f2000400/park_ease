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

        <!-- Main Content Area -->
        <main class="dashboard-content">
            <!-- Quick Actions -->
            <section class="quick-actions">
                <h2 class="section-title">Quick Actions</h2>
                <div class="action-grid">
                    <button class="action-btn" @click="navigateToNewBooking">
                        <i class="fas fa-plus-circle"></i>
                        <span>New Booking</span>
                    </button>
                    <button class="action-btn" @click="showAllBookings">
                        <i class="fas fa-calendar-alt"></i>
                        <span>My Bookings</span>
                    </button>
                    <button class="action-btn" @click="navigateToFindParking">
                        <i class="fas fa-map-marked-alt"></i>
                        <span>Find Parking</span>
                    </button>
                    <button class="action-btn" @click="navigateToPaymentMethods">
                        <i class="fas fa-wallet"></i>
                        <span>Payment Methods</span>
                    </button>
                </div>
            </section>

            <!-- Bookings Section -->
            <section class="upcoming-bookings">
                <div class="section-header">
                    <h2 class="section-title">
                        <span class="booking-filter" :class="{active: currentFilter === 'all'}" @click="showAllBookings">All Bookings</span> |
                        <span class="booking-filter" :class="{active: currentFilter === 'active'}" @click="showActiveOnly">Active</span> |
                        <span class="booking-filter" :class="{active: currentFilter === 'completed'}" @click="showCompletedOnly">Completed</span>
                    </h2>
                    <span class="booking-count">{{ filteredBookings.length }} bookings</span>
                </div>
                
                <div v-if="filteredBookings.length === 0" class="no-bookings">
                    <i class="fas fa-calendar-times"></i>
                    <p>No {{ currentFilter }} bookings found</p>
                </div>
                
                <div v-for="booking in filteredBookings" :key="booking.id" 
                     class="booking-card" :class="{featured: booking.status === 'active'}">
                    <div class="booking-info">
                        <h3>{{ booking.parking_lot.name }}</h3>
                        <p class="location">
                            <i class="fas fa-map-marker-alt"></i> {{ booking.parking_lot.address }}
                        </p>
                        <div class="booking-details">
                            <div class="detail">
                                <i class="fas fa-calendar-day"></i>
                                <span>{{ formatDateTime(booking.check_in) }}</span>
                            </div>
                            <div v-if="booking.check_out" class="detail">
                                <i class="fas fa-clock"></i>
                                <span>{{ calculateDuration(booking.check_in, booking.check_out) }}</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-dollar-sign"></i>
                                <span>{{ formatCurrency(booking.cost) }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="booking-actions">
                        <button class="btn btn-sm btn-outline" @click="viewBookingDetails(booking.id)">Details</button>
                        <button v-if="booking.status === 'active'" 
                                class="btn btn-sm btn-primary" 
                                @click="extendBooking(booking.id)">
                            Extend
                        </button>
                        <button v-if="booking.status === 'active'" 
                                class="btn btn-sm btn-warning" 
                                @click="cancelBooking(booking.id)">
                            Cancel
                        </button>
                    </div>
                </div>
            </section>

            <!-- Recent Activity -->
            <section class="activity-section">
                <div class="recent-activity">
                    <h2 class="section-title">Recent Activity</h2>
                    <ul class="activity-list">
                        <li v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                            <div class="activity-icon" :class="activity.type">
                                <i :class="activity.icon"></i>
                            </div>
                            <div class="activity-content">
                                <p>{{ activity.message }}</p>
                                <small>{{ formatDateTime(activity.timestamp) }}</small>
                            </div>
                            <span v-if="activity.amount !== null && activity.amount !== undefined" class="activity-amount">
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
            currentFilter: 'active', // 'all', 'active', or 'completed'
            isLoading: true,
            error: null
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
            switch (this.currentFilter) {
                case 'active':
                    return this.bookings.filter(b => b.status === 'active');
                case 'completed':
                    return this.bookings.filter(b => b.status === 'completed');
                default:
                    return this.bookings;
            }
        }
    },
    methods: {
        async fetchUserData() {
            this.isLoading = true;
            this.error = null;
            
            try {
                // Fetch user data and bookings in parallel
                const [userResponse, bookingsResponse] = await Promise.all([
                    fetch('/api/user/profile', {
                        headers: {
                            "Authentication-Token": localStorage.getItem('auth_token')
                        }
                    }),
                    fetch('/api/user/bookings', {
                        headers: {
                            "Authentication-Token": localStorage.getItem('auth_token')
                        }
                    })
                ]);
                
                if (!userResponse.ok || !bookingsResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }
                
                const userData = await userResponse.json();
                const bookingsData = await bookingsResponse.json();
                
                this.userData = userData;
                this.bookings = this.processBookings(bookingsData.bookings || []);
                this.recentActivities = this.processActivities(bookingsData.recent_activities || []);
                
                // Sort bookings by check-in date (newest first)
                this.bookings.sort((a, b) => new Date(b.check_in) - new Date(a.check_in));
                
            } catch (err) {
                console.error('Error fetching user data:', err);
                this.error = err.message;
                this.$router.push('/login');
            } finally {
                this.isLoading = false;
            }
        },
        
        processBookings(bookings) {
            return bookings.map(booking => ({
                ...booking,
                cost: booking.cost || 0,
                check_in: booking.check_in || new Date().toISOString(),
                check_out: booking.check_out || null,
                parking_lot: {
                    name: booking.parking_lot?.name || 'Unknown Location',
                    address: booking.parking_lot?.address || 'Address not available',
                    ...booking.parking_lot
                }
            }));
        },
        
        processActivities(activities) {
            return activities.map(activity => ({
                ...activity,
                amount: activity.amount || 0,
                timestamp: activity.timestamp || new Date().toISOString(),
                type: activity.type || 'info',
                icon: activity.icon || 'fa-info-circle'
            }));
        },
        
        formatDate(date) {
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        },
        
        formatDateTime(dateTime) {
            const options = { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateTime).toLocaleDateString('en-US', options);
        },
        
        calculateDuration(start, end) {
            if (!start || !end) return 'N/A';
            
            const startDate = new Date(start);
            const endDate = new Date(end);
            const diffHours = Math.abs(endDate - startDate) / 36e5;
            
            if (diffHours < 1) {
                const minutes = Math.round(diffHours * 60);
                return `${minutes} min`;
            } else if (diffHours < 24) {
                return `${Math.round(diffHours)} hours`;
            } else {
                const days = Math.round(diffHours / 24);
                return `${days} days`;
            }
        },
        
        formatCurrency(amount) {
            if (amount === null || amount === undefined) return '$0.00';
            return `$${parseFloat(amount).toFixed(2)}`;
        },
        
        formatActivityAmount(amount) {
            if (amount === null || amount === undefined) return '';
            const sign = amount > 0 ? '+' : '';
            return `${sign}$${Math.abs(amount).toFixed(2)}`;
        },
        
        showAllBookings() {
            this.currentFilter = 'all';
        },
        
        showActiveOnly() {
            this.currentFilter = 'active';
        },
        
        showCompletedOnly() {
            this.currentFilter = 'completed';
        },
        
        viewBookingDetails(bookingId) {
            this.$router.push(`/bookings/${bookingId}`);
        },
        
        async extendBooking(bookingId) {
            try {
                const response = await fetch(`/api/reservations/${bookingId}/extend`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authentication-Token": localStorage.getItem('auth_token')
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to extend booking');
                }
                
                await this.fetchUserData(); // Refresh data
            } catch (error) {
                console.error('Error extending booking:', error);
                alert('Failed to extend booking');
            }
        },
        
        async cancelBooking(bookingId) {
            if (!confirm('Are you sure you want to cancel this booking?')) return;
            
            try {
                const response = await fetch(`/api/reservations/${bookingId}`, {
                    method: 'DELETE',
                    headers: {
                        "Authentication-Token": localStorage.getItem('auth_token')
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to cancel booking');
                }
                
                await this.fetchUserData(); // Refresh data
            } catch (error) {
                console.error('Error canceling booking:', error);
                alert('Failed to cancel booking');
            }
        },
        
        navigateToNewBooking() {
            this.$router.push('/bookings/new');
        },
        
        navigateToFindParking() {
            this.$router.push('/parking');
        },
        
        navigateToPaymentMethods() {
            this.$router.push('/payment-methods');
        }
    },
    mounted() {
        this.fetchUserData();
    }
};