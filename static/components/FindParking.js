export default {
  template: `
    <div class="container py-5">
      <!-- City Selection -->
      <div class="row justify-content-center mb-5">
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h3 class="text-center mb-4">Find Parking</h3>
              <form @submit.prevent="findParking">
                <label for="city" class="form-label">Select City</label>
                <select
                  id="city"
                  class="form-select"
                  v-model="selectedCity"
                  @change="findParking"
                  required
                >
                  <option disabled value="">-- Choose a City --</option>
                  <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                </select>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Parking Lots -->
      <div v-if="parkingLots.length > 0">
        <h5 class="mb-4 text-center">Available Parking in <span class="text-primary">{{ selectedCity }}</span></h5>
        <div class="row g-4">
          <div v-for="lot in parkingLots" :key="lot.id" class="col-md-4">
            <div class="card shadow border-0 h-100">
              <div class="card-body">
                <h5 class="card-title text-primary fw-bold">{{ lot.name }}</h5>
                <p class="card-text small text-muted">
                  <strong>Available:</strong> {{ lot.available_spots }}<br/>
                  <strong>Occupied:</strong> {{ lot.occupied_spots }}/{{ lot.total_spots }}<br/>
                  <strong>Area:</strong> {{ lot.area }}<br/>
                  <strong>Address:</strong> {{ lot.address }}<br/>
                  <strong>Pincode:</strong> {{ lot.pincode }}<br/>
                  <strong>Price:</strong> ₹{{ lot.price }}/hour
                </p>

                <!-- Spot Visualization -->
                <div class="d-flex flex-wrap gap-1 mb-3">
                  <span
                    v-for="spot in lot.spots"
                    :key="spot.id"
                    class="badge"
                    :class="spot.status === 'A' ? 'bg-success' : 'bg-danger'"
                  >
                    {{ spot.status === 'A' ? 'A' : 'O' }}
                  </span>
                </div>

                <!-- Book Button -->
                <div class="d-grid">
                  <button class="btn btn-primary" :disabled="lot.available_spots === 0" @click="prepareBooking(lot)">
                    Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Modal -->
      <div v-if="showBookingModal" class="modal-overlay d-flex justify-content-center align-items-center"
           style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1050;">
        <div class="bg-white p-4 rounded shadow" style="width: 450px;">
          <h5 class="text-center text-primary mb-3">Book the Parking Spot</h5>

          <div class="mb-3">
            <label class="form-label">Mode</label><br>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" id="bookNow" value="now" v-model="bookingForm.mode">
              <label class="form-check-label" for="bookNow">Book Now</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" id="schedule" value="schedule" v-model="bookingForm.mode">
              <label class="form-check-label" for="schedule">Schedule</label>
            </div>
          </div>

          <div class="mb-3">
            <label for="vehicleNumber" class="form-label">Vehicle Number</label>
            <input id="vehicleNumber" v-model="bookingForm.vehicleNumber" class="form-control" required />
          </div>

          <div class="mb-3">
            <div v-if="bookingForm.mode === 'schedule'">
              <label for="checkInTime" class="form-label">Check-in</label>
              <input type="datetime-local" id="checkInTime" v-model="bookingForm.scheduledCheckIn" class="form-control" />
            </div>

            <label for="checkOutTime" class="form-label mt-2">Check-out</label>
            <input type="datetime-local" id="checkOutTime" v-model="bookingForm.scheduledCheckOut" class="form-control" />

            <div v-if="validTimes" class="mt-3">
              <div><strong>Estimated Duration:</strong> {{ estimatedHours }} hours</div>
              <div><strong>Estimated Cost:</strong> ₹{{ estimatedCost }}</div>
            </div>
          </div>

          <div class="d-flex justify-content-end">
            <button class="btn btn-outline-secondary me-2" @click="showBookingModal = false">Cancel</button>
            <button class="btn btn-primary" @click="proceedToPayment">Pay & Book</button>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      cities: [],
      selectedCity: '',
      parkingLots: [],
      showBookingModal: false,
      bookingSpot: null,
      bookingForm: {
        vehicleNumber: '',
        mode: 'now',
        scheduledCheckIn: '',
        scheduledCheckOut: ''
      }
    };
  },

  computed: {
    checkInTime() {
      return this.bookingForm.mode === 'now' ? new Date().toISOString() : this.bookingForm.scheduledCheckIn;
    },
    validTimes() {
      return this.bookingForm.scheduledCheckOut && new Date(this.checkInTime) < new Date(this.bookingForm.scheduledCheckOut);
    },
    estimatedHours() {
      if (!this.validTimes) return 0;
      const diff = (new Date(this.bookingForm.scheduledCheckOut) - new Date(this.checkInTime)) / (1000 * 60 * 60);
      return Math.max(0, Math.ceil(diff));
    },
    estimatedCost() {
      const lot = this.parkingLots.find(l => l.id === this.bookingSpot?.lotId);
      return Math.ceil(this.estimatedHours * (lot?.price || 0));
    }
  },

  methods: {
    async fetchCities() {
      const response = await fetch('/api/cities');
      this.cities = await response.json();
    },

    async findParking() {
      if (!this.selectedCity) return (this.parkingLots = []);
      const response = await fetch(`/api/lots?city=${encodeURIComponent(this.selectedCity)}`);
      this.parkingLots = await response.json();
    },

    prepareBooking(lot) {
      const spot = lot.spots.find(s => s.status === 'A');
      if (!spot) return alert('No available spots in this lot.');

      this.bookingSpot = {
        spotId: spot.id,
        lotId: lot.id,
        lotName: lot.name
      };

      // Reset form
      this.bookingForm.vehicleNumber = '';
      this.bookingForm.mode = 'now';
      this.bookingForm.scheduledCheckIn = '';
      this.bookingForm.scheduledCheckOut = '';
      this.showBookingModal = true;
    },

 proceedToPayment() {
      if (!this.bookingForm.vehicleNumber || !this.bookingForm.scheduledCheckOut) {
        return alert('Please complete all fields.');
      }
      if (this.bookingForm.mode === 'schedule' && !this.bookingForm.scheduledCheckIn) {
        return alert('Please select check-in time.');
      }

      // Format datetime for backend (convert to ISO string with timezone)
      const formatForBackend = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        // Convert to ISO string with timezone offset
        return date.toISOString();
      };

      // For "Book Now", use current time in ISO format
      const checkIn = this.bookingForm.mode === 'schedule'
        ? formatForBackend(this.bookingForm.scheduledCheckIn + ':00') // Add seconds if missing
        : new Date().toISOString();
      const checkOut = formatForBackend(this.bookingForm.scheduledCheckOut + ':00');


      // Validate times
      if (new Date(checkIn) >= new Date(checkOut)) {
        return alert('Check-out must be after check-in.');
      }

      const lot = this.parkingLots.find(l => l.id === this.bookingSpot.lotId);

      this.$router.push({
        path: '/user/payment',
        query: {
          spot_id: this.bookingSpot.spotId,
          vehicle_number: this.bookingForm.vehicleNumber,
          check_in: checkIn,
          check_out: checkOut,
          cost: this.estimatedCost,
          lot_name: this.bookingSpot.lotName,
          area: lot?.area || '',
          address: lot?.address || '',
          pincode: lot?.pincode || '',
          city: this.selectedCity
        }
      });
    }
  },

  mounted() {
    this.fetchCities();
  }
};
