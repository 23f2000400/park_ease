export default {
  template: `
  <div class="payment-desktop-page">
    <div class="payment-desktop-container">
      <!-- Cute Header -->
      <div class="cute-desktop-header">
        <img src="https://cdn-icons-png.flaticon.com/512/2777/2777166.png" class="desktop-parking-icon">
        <h1 class="desktop-title">Parking Payment Receipt</h1>
        <div class="desktop-divider">
          <span class="desktop-dot"></span>
          <span class="desktop-dot"></span>
          <span class="desktop-dot"></span>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="desktop-content-area">
        <!-- Left Column - Parking Details -->
        <div class="desktop-left-column">
          <div class="desktop-details-card">
            <h3 class="desktop-card-title">
              <i class="fas fa-parking"></i> Parking Information
            </h3>
            
            <div class="desktop-detail-grid">
              <div class="desktop-detail-item">
                <span class="desktop-emoji">🏢</span>
                <div>
                  <div class="desktop-label">Parking Lot</div>
                  <div class="desktop-value">{{ lot_name }}</div>
                </div>
              </div>

              <div class="desktop-detail-item">
                <span class="desktop-emoji">📍</span>
                <div>
                  <div class="desktop-label">Location</div>
                  <div class="desktop-value">{{ area }}, {{ city }}</div>
                </div>
              </div>

              <div class="desktop-detail-item">
                <span class="desktop-emoji">🏠</span>
                <div>
                  <div class="desktop-label">Address</div>
                  <div class="desktop-value">{{ address }}</div>
                </div>
              </div>

              <div class="desktop-detail-item">
                <span class="desktop-emoji">📮</span>
                <div>
                  <div class="desktop-label">Pincode</div>
                  <div class="desktop-value">{{ pincode }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="desktop-details-card">
            <h3 class="desktop-card-title">
              <i class="fas fa-car"></i> Vehicle Details
            </h3>
            
            <div class="desktop-detail-grid">
              <div class="desktop-detail-item">
                <span class="desktop-emoji">🚗</span>
                <div>
                  <div class="desktop-label">Vehicle Number</div>
                  <div class="desktop-value vehicle-number">{{ vehicle_number }}</div>
                </div>
              </div>

              <div class="desktop-detail-item">
                <span class="desktop-emoji">🅿️</span>
                <div>
                  <div class="desktop-label">Spot ID</div>
                  <div class="desktop-value spot-id">#{{ spot_id }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Payment Summary -->
        <div class="desktop-right-column">
          <div class="desktop-summary-card">
            <h3 class="desktop-card-title">
              <i class="fas fa-clock"></i> Parking Duration
            </h3>

            <div class="desktop-time-display">
            <div class="desktop-time-box check-in">
                <div class="desktop-time-emoji">⏱️</div>
                <div class="desktop-time-label">Check-in</div>
                <div class="desktop-time-value">
                <div>{{ formatDate(check_in) }}</div>
                <div class="time-small">{{ formatTime(check_in) }}</div>
                </div>
            </div>

            <div class="desktop-duration-arrow">➡️</div>

            <div class="desktop-time-box check-out">
                <div class="desktop-time-emoji">⏰</div>
                <div class="desktop-time-label">Check-out</div>
                <div class="desktop-time-value">
                <div>{{ formatDate(check_out) }}</div>
                <div class="time-small">{{ formatTime(check_out) }}</div>
                </div>
            </div>
            </div>


            <div class="text-center">
              <i >   </i>    {{ formatDuration(check_in, check_out) }}
            </div></br>

            <div class="desktop-payment-summary">
              <h3 class="desktop-card-title">
                <i class="fas fa-file-invoice-dollar"></i> Payment Summary
              </h3>

              <div class="desktop-price-breakdown">
                <div class="desktop-price-row">
                  <span>Parking Fee</span>
                  <span>₹{{ cost }}</span>
                </div>
                <div class="desktop-price-row total">
                  <span>Total Amount</span>
                  <span>₹{{ cost }}</span>
                </div>
              </div>

              <button class="desktop-pay-button" @click="confirmPayment">
                <i class="fas fa-lock"></i> Pay & Confirm
                <span class="desktop-bouncing-arrow">👉</span>
              </button>

              <div class="desktop-security">
                <i class="fas fa-shield-alt"></i> Secure SSL Encrypted Payment
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cute Footer -->
      <div class="desktop-footer">
        <p>Thank you for parking with us! 💖</p>
        <div class="desktop-footer-emojis">
          <span>🚗</span>
          <span>🛣️</span>
          <span>🏁</span>
        </div>
      </div>
    </div>
      <div v-if="showSuccessModal" class="modal-overlay"
      style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
              background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050;">
<div class="bg-white rounded shadow-lg p-4" style="width: 400px; max-width: 90%;">
    <h5 class="text-success text-center mb-3">
      <i class="fas me-2"></i>Order Placed Successfully 🎉
    </h5>
    <p class="text-center fs-5">Your reservation has been successfully placed.</p>
    <p class="text-center fs-6">Check your reservation history</p>
    <div class="d-flex justify-content-end">
      <button class="btn btn-outline-primary" @click="closeModal">
        <i class="fas fa-check me-1"></i>OK
      </button>
    </div>
  </div>
</div>
  `,
  data() {
    return {
      showSuccessModal: false
    };
  },

  computed: {
    spot_id() { return this.$route.query.spot_id },
    vehicle_number() { return this.$route.query.vehicle_number },
    check_in() { return this.$route.query.check_in },
    check_out() { return this.$route.query.check_out },
    cost() { return this.$route.query.cost },
    lot_name() { return this.$route.query.lot_name },
    area() { return this.$route.query.area },
    address() { return this.$route.query.address },
    pincode() { return this.$route.query.pincode },
    city() { return this.$route.query.city }
  },

  methods: {
    formatDuration(start, end) {
      const diffMs = new Date(end) - new Date(start);
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
      }
      return `${minutes} minutes`;
    },

    async confirmPayment() {
      try {
        const payload = {
          spot_id: this.spot_id,
          vehicle_number: this.vehicle_number,
          check_in: this.check_in,
          check_out: this.check_out,
          hours: Math.ceil((new Date(this.check_out) - new Date(this.check_in)) / (1000 * 60 * 60))
        };

        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth_token')
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Booking failed.');
        this.showSuccessModal = true;

      } catch (e) {
        alert('😢 Error: ' + e.message);
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    },
  
    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    },

    formatDuration(start, end) {
      const diffMs = new Date(end) - new Date(start);
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
      }
      return `${minutes} minutes`;
    },
    closeModal() {
      this.showSuccessModal = false;
      this.$router.push('/user/home');
    }
}
}
