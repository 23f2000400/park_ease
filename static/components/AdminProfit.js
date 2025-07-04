<<<<<<< HEAD
export default {
  template: `
  <div class="container py-5">
    <h2 class="mb-4 text-primary"><i class="fas fa-chart-line me-2"></i>Profit Analytics</h2>

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

      <!-- Top Parking Lots -->
      <div class="mb-4">
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

      <!-- Top Performing Users -->
      <div>
        <h4 class="text-secondary"><i class="fas fa-user me-2"></i>Top Performing Users</h4>
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
      <div class="row mt-5">
        <div class="col-md-4 ">
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
=======
export default {
  template: `
  <div class="container py-5">
    <h2 class="mb-4 text-primary"><i class="fas fa-chart-line me-2"></i>Profit Analytics</h2>

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

      <!-- Top Parking Lots -->
      <div class="mb-4">
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

      <!-- Top Performing Users -->
      <div>
        <h4 class="text-secondary"><i class="fas fa-user me-2"></i>Top Performing Users</h4>
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
      <div class="row mt-5">
        <div class="col-md-4 ">
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
>>>>>>> cac058d (export backend done)
