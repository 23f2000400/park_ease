export default {
  template: `
  <div class="container py-5">
    <h2 class="mb-4 text-primary"><i class="fas fa-chart-line me-2"></i>Admin Summary Dashboard</h2>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <!-- Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card bg-success text-white shadow">
            <div class="card-body">
              <h5 class="card-title">Today's Profit</h5>
              <h3>₹{{ analytics.today_profit.toFixed(2) }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-info text-white shadow">
            <div class="card-body">
              <h5 class="card-title">This Month's Profit</h5>
              <h3>₹{{ analytics.month_profit.toFixed(2) }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-primary text-white shadow">
            <div class="card-body">
              <h5 class="card-title">Daily Average</h5>
              <h3>₹{{ analytics.daily_average.toFixed(2) }}</h3>
              <small>Based on {{ analytics.days_in_month }} days</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Parking Lots Table -->
      <div class="mb-5">
        <h4 class="text-secondary"><i class="fas fa-warehouse me-2"></i>Top Performing Parking Lots</h4>
        <table class="table table-bordered mt-3">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Lot Name</th>
              <th>Revenue (₹)</th>
              <th>Avg. Occupancy (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(lot, index) in analytics.top_parking_lots" :key="lot.lot">
              <td>{{ index + 1 }}</td>
              <td>{{ lot.lot }}</td>
              <td>₹{{ lot.revenue.toFixed(2) }}</td>
              <td>{{ lot.occupancy.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Top Users -->
      <div class="mb-5">
        <h4 class="text-secondary"><i class="fas fa-user-tie me-2"></i>Top Performing Users</h4>
        <table class="table table-bordered mt-3">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>User Name</th>
              <th>Email</th>
              <th>Total Profit (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in analytics.top_users" :key="user.user_id">
              <td>{{ index + 1 }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>₹{{ user.total_spent.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick Stats -->
      <div class="row mb-5">
        <div class="col-md-4">
          <div class="card bg-light text-dark shadow">
            <div class="card-body">
              <h5 class="card-title">Total Vehicles</h5>
              <h3>{{ analytics.total_vehicles }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light text-dark shadow">
            <div class="card-body">
              <h5 class="card-title">Avg. Duration</h5>
              <h3>{{ analytics.avg_duration }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light text-dark shadow">
            <div class="card-body">
              <h5 class="card-title">Overall Occupancy</h5>
              <h3>{{ analytics.overall_occupancy.toFixed(2) }}%</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphs -->
<div class="row">
  <!-- Revenue Bar Chart -->
  <div class="col-md-6 mb-4">
    <div class="card shadow">
      <div class="card-body">
        <h5 class="card-title">Revenue by Lot</h5>
        <div style="position: relative; height: 300px; width: 100%;">
          <canvas id="revenueChart"></canvas>
        </div>
      </div>
    </div>
  </div>

  <!-- Occupancy Pie Chart -->
  <div class="col-md-6 mb-4">
    <div class="card shadow">
      <div class="card-body">
        <h5 class="card-title">Occupancy Summary</h5>
        <div style="position: relative; height: 300px; width: 100%;">
          <canvas id="occupancyChart"></canvas>
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
    loading: true,
    revenueChart: null,
    occupancyChart: null
    };
  },

  methods: {
    async fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/summary', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token')
          }
        });
        const data = await res.json();
        this.analytics = data;

        // draw charts after DOM updates
        this.$nextTick(() => {
          this.drawCharts();
        });
      } catch (err) {
        alert("Failed to load summary");
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

 drawCharts() {
      // Generate distinct colors for pie chart segments
      const generatePieColors = (count) => {
        const colors = [];
        const hueStep = 360 / count;
        for (let i = 0; i < count; i++) {
          const hue = i * hueStep;
          colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return colors;
      };

      // Revenue Pie Chart
      const revCtx = document.getElementById("revenueChart")?.getContext("2d");
      if (revCtx && this.analytics.revenue_by_lot) {
        if (this.revenueChart) this.revenueChart.destroy();
        
        const pieColors = generatePieColors(this.analytics.revenue_by_lot.length);
        
        this.revenueChart = new Chart(revCtx, {
          type: 'pie',
          data: {
            labels: this.analytics.revenue_by_lot.map(l => l.name),
            datasets: [{
              label: 'Revenue (₹)',
              data: this.analytics.revenue_by_lot.map(l => l.revenue),
              backgroundColor: pieColors,
              borderColor: '#fff',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }

      // Occupancy Bar Chart (kept as is with your original colors)
      const occCtx = document.getElementById("occupancyChart")?.getContext("2d");
      if (occCtx && this.analytics.occupancy_summary) {
        if (this.occupancyChart) this.occupancyChart.destroy();
        this.occupancyChart = new Chart(occCtx, {
          type: 'bar',
          data: {
            labels: this.analytics.occupancy_summary.map(l => l.lot),
            datasets: [
              {
                label: 'Occupied',
                data: this.analytics.occupancy_summary.map(l => l.occupied),
                backgroundColor: '#f44336',
                borderColor: '#d32f2f',
                borderWidth: 1
              },
              {
                label: 'Available',
                data: this.analytics.occupancy_summary.map(l => l.available),
                backgroundColor: '#2196f3',
                borderColor: '#1976d2',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              }
            }
          }
        });
      }
    }
  },

mounted() {
  this.fetchAnalytics().then(() => {

    setTimeout(() => this.drawCharts(), 200); // delay to ensure canvas exists
  });
}
};
