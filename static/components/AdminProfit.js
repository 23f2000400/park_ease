export default {
    template: `
  <div class="profit-analytics-pc">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">
          <i class="fas fa-chart-line"></i> Profit Analytics Dashboard
        </h1>
        <p class="dashboard-subtitle">Comprehensive overview of your parking business performance</p>
      </div>
      <div class="header-aside">
        <div class="last-updated">
          <i class="fas fa-sync-alt"></i> Updated: {{ new Date().toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Analyzing profit data...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="dashboard-content">
      <!-- Summary Cards Row -->
      <div class="summary-row">
        <div class="summary-card profit-card">
          <div class="card-icon">
            <i class="fas fa-rupee-sign"></i>
          </div>
          <div class="card-content">
            <h3>Today's Profit</h3>
            <div class="card-value">₹{{ (analytics.today_profit || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</div>
            <div class="card-footer">
              <span class="trend positive" v-if="analytics.today_vs_yesterday > 0">
                <i class="fas fa-arrow-up"></i> {{ analytics.today_vs_yesterday }}% from yesterday
              </span>
              <span class="trend negative" v-else-if="analytics.today_vs_yesterday < 0">
                <i class="fas fa-arrow-down"></i> {{ Math.abs(analytics.today_vs_yesterday) }}% from yesterday
              </span>
              <span class="trend" v-else>
                <i class="fas fa-equals"></i> Same as yesterday
              </span>
            </div>
          </div>
        </div>

        <div class="summary-card month-card">
          <div class="card-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="card-content">
            <h3>Monthly Profit</h3>
            <div class="card-value">₹{{ (analytics.month_profit || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</div>
            <div class="card-footer">
              <span class="trend positive" v-if="analytics.month_vs_last_month > 0">
                <i class="fas fa-arrow-up"></i> {{ analytics.month_vs_last_month }}% from last month
              </span>
              <span class="trend negative" v-else-if="analytics.month_vs_last_month < 0">
                <i class="fas fa-arrow-down"></i> {{ Math.abs(analytics.month_vs_last_month) }}% from last month
              </span>
              <span class="trend" v-else>
                <i class="fas fa-equals"></i> Same as last month
              </span>
            </div>
          </div>
        </div>

        <div class="summary-card average-card">
          <div class="card-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="card-content">
            <h3>Daily Average</h3>
            <div class="card-value">₹{{ (analytics.daily_average || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</div>
            <div class="card-footer">
              <span>Based on {{ analytics.days_in_month }} days</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="main-content-area">
        <!-- Left Column -->
        <div class="content-column">
          <!-- Top Parking Lots -->
          <div class="data-section">
            <div class="section-header">
              <h2><i class="fas fa-warehouse"></i> Top Performing Parking Lots</h2>
              <div class="section-actions">
                <button class="btn-view-all">View All <i class="fas fa-chevron-right"></i></button>
              </div>
            </div>
            <div class="data-table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="rank-col">Rank</th>
                    <th class="name-col">Lot Name</th>
                    <th class="revenue-col">Revenue</th>
                    <th class="occupancy-col">Avg. Occupancy</th>
                    <th class="trend-col">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(lot, index) in analytics?.top_parking_lots || []" :key="lot.lot">
                    <td class="rank-col">
                      <span class="rank-badge" :class="{
                        'gold': index === 0,
                        'silver': index === 1,
                        'bronze': index === 2
                      }">{{ index + 1 }}</span>
                    </td>
                    <td class="name-col">{{ lot.lot }}</td>
                    <td class="revenue-col">₹{{ lot.revenue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                    <td class="occupancy-col">
                      <div class="progress-bar-container">
                        <div class="progress-bar" :style="{width: lot.occupancy + '%'}"></div>
                        <span>{{ lot.occupancy }}%</span>
                      </div>
                    </td>
                    <td class="trend-col">
                      <span class="trend-indicator" :class="{
                        'up': lot.trend > 0,
                        'down': lot.trend < 0,
                        'neutral': lot.trend === 0
                      }">
                        <i class="fas" :class="{
                          'fa-arrow-up': lot.trend > 0,
                          'fa-arrow-down': lot.trend < 0,
                          'fa-equals': lot.trend === 0
                        }"></i>
                        {{ Math.abs(lot.trend) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="content-column">
          <!-- Top Earning Spots -->
          <div class="data-section">
            <div class="section-header">
              <h2><i class="fas fa-parking"></i> Top Performing Spots</h2>
              <div class="section-actions">
                <button class="btn-view-all">View All <i class="fas fa-chevron-right"></i></button>
              </div>
            </div>
            <div class="data-table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="rank-col">Rank</th>
                    <th class="spot-col">Spot ID</th>
                    <th class="lot-col">Lot</th>
                    <th class="revenue-col">Revenue</th>
                    <th class="utilization-col">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(spot, index) in analytics?.top_spots || []" :key="spot.spot_id">
                    <td class="rank-col">
                      <span class="rank-badge" :class="{
                        'gold': index === 0,
                        'silver': index === 1,
                        'bronze': index === 2
                      }">{{ index + 1 }}</span>
                    </td>
                    <td class="spot-col">SP-{{ spot.spot_id }}</td>
                    <td class="lot-col">{{ spot.lot_id }}</td>
                    <td class="revenue-col">₹{{ spot.revenue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                    <td class="utilization-col">
                      <div class="sparkline">
                        <span v-for="(value, i) in spot.utilization" :key="i" 
                          class="sparkline-bar" 
                          :style="{height: value + '%'}"
                          :class="{
                            'peak': value > 70,
                            'average': value > 30 && value <= 70,
                            'low': value <= 30
                          }"></span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="quick-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-car"></i>
              </div>
              <div class="stat-content">
                <h4>Total Vehicles</h4>
                <div class="stat-value">{{ analytics.total_vehicles || 0 }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <h4>Avg. Duration</h4>
                <div class="stat-value">{{ analytics.avg_duration || '0h 0m' }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-percentage"></i>
              </div>
              <div class="stat-content">
                <h4>Overall Occupancy</h4>
                <div class="stat-value">{{ analytics.overall_occupancy || 0 }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,

 data() {
    return {
      analytics: null,
      loading: true
    };
  },
  methods: {
    async fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/profit-analytics', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token')
          }
        });
        this.analytics = await res.json();
      } catch (err) {
        alert("Failed to load profit analytics");
        console.error(err);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchAnalytics();
  }
};


