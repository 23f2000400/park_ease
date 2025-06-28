export default {
  template: `
  <div class="container py-5">
    <div class="card mx-auto p-4" style="max-width: 500px;">
      <h4 class="text-center mb-4">Payment</h4>
        <p><strong>Parking Lot:</strong> {{ lot_name }}</p>
        <p><strong>Area:</strong> {{ area }}</p>
        <p><strong>Address:</strong> {{ address }}</p>
        <p><strong>Pincode:</strong> {{ pincode }}</p>

      <p><strong>City</strong> {{ city }}</p>
      <p><strong>Vehicle:</strong> {{ vehicle_number }}</p>
        <p><strong>Spot ID:</strong> {{ spot_id }}</p>
        <p><strong>Check-in:</strong> {{ check_in }}</p>
        <p><strong>Check-out:</strong> {{ check_out }}</p>
        <p><strong>Duration:</strong> {{ new Date(check_out) - new Date(check_in) }} ms</p>
      <p><strong>Cost:</strong> ₹{{ cost }}</p>

      <button class="btn btn-success w-100 mt-3" @click="confirmPayment">Pay & Confirm</button>
    </div>
  </div>
`,


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
    async confirmPayment() {
      try {
        const payload = {
          spot_id: this.spot_id,
          vehicle_number: this.vehicle_number,
          check_in: this.check_in,
            check_out: this.check_out,
            hours: Math.ceil((new Date(this.check_out) - new Date(this.check_in)) / (1000 * 60 * 60)), // convert ms to hours
            
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

        alert('Payment & booking successful!');
        this.$router.push('/user/home');
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }
  }
}

