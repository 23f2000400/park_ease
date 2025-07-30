export default {
  template: `
    <div class="container mt-4">

      <h2 class="text-primary mb-4"><i class="fas fa-chart-line me-2"></i>User Summary</h2>

      <div class="text-end mb-3">
  <button class="btn btn-outline-primary" @click="exportCSV">
    <i class="fas fa-file-csv me-1"></i> Export My Parking Data
  </button>
</div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <div v-else>
        <!-- Stats Cards -->
        <div class="row mb-4">
          <div class="col-md-4" v-for="(value, label) in statsSummary" :key="label">
            <div class="card shadow-sm">
              <div class="card-body text-center">
                <h5 class="card-title text-secondary">{{ label }}</h5>
                <h3 class="text-dark">{{ value }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Favorite lot -->
        <div class="mb-4">
          <h5><i class="fas fa-heart text-danger me-2"></i>Favorite Lot:</h5>
          <p class="fs-5">{{ profile.stats.favorite_lot || 'N/A' }}</p>
        </div>

        <!-- Bar Chart -->
        <div class="card shadow-sm p-4 mt-4">
        <h5 class="text-center text-primary mb-3">Parking Spot Usage Summary</h5>
        <canvas id="usageChart" height="350"></canvas>
        </div>
    </div>
  `,
  data() {
    return {
      profile: {},
      loading: true,
    };
  },
  computed: {
    statsSummary() {
      return {
        'Total Bookings': this.profile.stats?.total_bookings ?? 0,
        'Completed': this.profile.stats?.completed_bookings ?? 0,
        'Active': this.profile.stats?.active_bookings ?? 0,
        'Total Spent (₹)': this.profile.stats?.total_spent?.toFixed(2) ?? '0.00'
      };
    }
  },
methods: {
  async loadUserSummary() {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/user/profile', {
        headers: { 'Authentication-Token': token }
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      this.profile = data;
    } catch (err) {
      console.error(err);
      alert("Failed to load profile summary");
    } finally {
      this.loading = false;
    }
  },

      exportCSV() {
        fetch('/api/user/export')
        .then(response => response.json())
        .then(data => {
            window.location.href = `/api/user/export_result/${data.id}`;
        })
        .then(() => {
            alert("CSV export downloaded.");
        })
        .catch(error => console.error('Error exporting CSV:', error));
    },
    

 renderChart(stats) {
  const canvas = document.getElementById('usageChart');
  if (!canvas) {
    console.warn("Chart canvas not found.");
    return;
  }

  const ctx = canvas.getContext('2d');

  // Destroy any existing chart to prevent overlap
  if (this.chartInstance) {
    this.chartInstance.destroy();
  }

  this.chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Completed', 'Active', 'Cancelled'],
      datasets: [{
        label: 'Usage Summary',
        data: [
          stats.completed_bookings || 0,
          stats.active_bookings || 0,
          (stats.total_bookings || 0) - (stats.completed_bookings || 0) - (stats.active_bookings || 0)
        ],
        backgroundColor: ['#4CAF50', '#2196F3', '#F44336'],
        borderRadius: 10,
        barThickness: 40,
        maxBarThickness: 50
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#333',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 10,
          cornerRadius: 6
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            stepSize: 1
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });

  }
},

mounted() {
  this.loadUserSummary().then(() => {
    this.$nextTick(() => {
      this.renderChart(this.profile.stats);
    });
  });
}

};
