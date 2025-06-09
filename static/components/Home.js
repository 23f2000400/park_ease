/* HomeParking.js */
export default {
  template: `
  <div class="home-page">

    <!-- ▸ Hero Banner -->
    <section
      class="banner-section d-flex flex-column flex-md-row align-items-center py-5 px-4"
      style="background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);color:white;"
    >
      <div class="banner-content text-md-start text-center mb-4 mb-md-0 me-md-5">
        <h1 class="display-4 fw-bold">Welcome to Park Ease</h1>
        <p class="lead">Smart parking made simple. Find and reserve your spot instantly.</p>

        <div v-if="role === 'admin'">
          <router-link to="/admin-dashboard" class="btn btn-warning btn-lg mt-3">Admin Dashboard</router-link>
        </div>
        <div v-else-if="role === 'user'">
          <router-link to="/user-dashboard" class="btn btn-success btn-lg mt-3">Find Parking</router-link>
        </div>
        <div v-else>
          <router-link to="/login" class="btn btn-primary btn-lg mt-3">Find Parking</router-link>
        </div>
      </div>

      <div class="banner-image">
        <img src="/static/images/banner.jpg" alt="Parking banner"
             class="img-fluid rounded shadow" style="max-height:400px;" />
      </div>
    </section>


    <!-- ▸ Additional Feature Grid (from screenshot) -->
    <section class="py-5 bg-white">
  <div class="container">
    <div class="row g-4 text-center">
      <!-- First Row - 3 Cards -->
      <div class="col-lg-4 col-md-6">
        <div class="feature-card2 border rounded p-4 shadow-sm bg-white h-100">
          <div class="feature-icon mb-3 text-primary fs-1">
            <i class="fas fa-search"></i>
          </div>
          <h5 class="fw-bold">Check Availability</h5>
          <p class="text-muted">Vehicle owners can check availability of parking slots.</p>
        </div>
      </div>

      <div class="col-lg-4 col-md-6">
        <div class="feature-card2 border rounded p-4 shadow-sm bg-white h-100">
          <div class="feature-icon mb-3 text-info fs-1">
            <i class="fas fa-route"></i>
          </div>
          <h5 class="fw-bold">Navigation</h5>
          <p class="text-muted">Navigate to parking areas with live rates & availability.</p>
        </div>
      </div>

      <div class="col-lg-4 col-md-6">
        <div class="feature-card2 border rounded p-4 shadow-sm bg-white h-100">
          <div class="feature-icon mb-3 text-success fs-1">
            <i class="fas fa-wallet"></i>
          </div>
          <h5 class="fw-bold">Wallet Payment</h5>
          <p class="text-muted">Registered users can pay parking fees through their wallet.</p>
        </div>
      </div>

      <!-- Second Row - 3 Cards -->
      <div class="col-lg-4 col-md-6">
        <div class="feature-card2 border rounded p-4 shadow-sm bg-white h-100">
          <div class="feature-icon mb-3 text-warning fs-1">
            <i class="fas fa-calendar-check"></i>
          </div>
          <h5 class="fw-bold">Advance Booking</h5>
          <p class="text-muted">Regular users can book parking spots in advance.</p>
        </div>
      </div>

      <div class="col-lg-4 col-md-6">
        <div class="feature-card2 border rounded p-4 shadow-sm bg-white h-100">
          <div class="feature-icon mb-3 text-danger fs-1">
            <i class="fas fa-ticket-alt"></i>
          </div>
          <h5 class="fw-bold">Parking Pass</h5>
          <p class="text-muted">Daily & monthly parking passes available for vehicle owners.</p>
        </div>
      </div>

      <div class="col-lg-4 col-md-6">
        <div class="feature-card2 border rounded p-4 shadow-sm bg-white h-100">
          <div class="feature-icon mb-3 text-secondary fs-1">
            <i class="fas fa-smile"></i>
          </div>
          <h5 class="fw-bold">Paperless Transaction</h5>
          <p class="text-muted">Completely paper-free check-in and check-out process.</p>
        </div>
      </div>
    </div>
  </div>
</section>
    <!-- ▸ Popular Cities Section -->
<section class="popular-cities-section py-5 bg-light">
  <div class="container">
    <div class="row align-items-center">

      <!-- Left Image -->
      <div class="col-md-6 mb-4 mb-md-0">
        <img src="/static/images/banner4.png" alt="Driving Image" class="img-fluid rounded shadow">
      </div>

      <!-- Right List -->
      <div class="col-md-6 text-center text-md-start">
        <h3 class="fw-bold">POPULAR CITIES<span style="color: #ffa500;">.</span></h3>
        <ul class="list-unstyled mt-3 mb-4 fs-5">
          <li><i class="fas fa-circle text-warning me-2" style="font-size: 0.6rem;"></i>🏙 Delhi</li>
          <li><i class="fas fa-circle text-warning me-2" style="font-size: 0.6rem;"></i>🏙 Mumbai</li>
          <li><i class="fas fa-circle text-warning me-2" style="font-size: 0.6rem;"></i>🏙 Kolkata</li>
          <li><i class="fas fa-circle text-warning me-2" style="font-size: 0.6rem;"></i>🏙 Banguluru</li>
          <li><i class="fas fa-circle text-warning me-2" style="font-size: 0.6rem;"></i>🏙 Chennai</li>
          <li><i class="fas fa-circle text-warning me-2" style="font-size: 0.6rem;"></i>🏙 Hydrabad</li>
        </ul>
        <button class="btn btn-danger btn-lg px-4">FIND YOUR CITY</button>
      </div>

    </div>
  </div>
</section>


    <!-- ▸ CTA with image -->
    <section class="cta-section py-5 text-center text-white"
             style="background:linear-gradient(135deg,rgb(255,33,136),#0072ff);">
      <div class="container">
        <img src="/static/images/banner3.png" alt="Parking promo"
             class="img-fluid rounded shadow" style="max-height:400px;" />
      </div>
    </section>


        <!-- ▸ Core Features -->
    <section class="features-section py-5 bg-light">
      <div class="container">
        <h2 class="text-center fw-bold mb-5">Why Choose Park Ease?</h2>
        <div class="row g-4">
          <div class="col-md-4">
                <div class="feature-card p-4 rounded shadow-sm" style="background-color:rgb(200, 141, 255);">
              <i class="fas fa-map-marked-alt fa-3x text-primary mb-3"></i>
              <h4 class="fw-bold">Live Spot Availability</h4>
              <p class="text-muted">See live parking availability in real time based on your location.</p>
            </div>
          </div>
          <div class="col-md-4">
                <div class="feature-card p-4 rounded shadow-sm" style="background-color: rgb(255, 86, 213);">
              <i class="fas fa-credit-card fa-3x text-success mb-3"></i>
              <h4 class="fw-bold">Contactless Payments</h4>
              <p class="text-muted">Easily pay through the app—no tickets or cash required.</p>
            </div>
          </div>
          <div class="col-md-4">
                <div class="feature-card p-4 rounded shadow-sm" style="background-color: rgb(76, 243, 255);">
              <i class="fas fa-shield-alt fa-3x text-danger mb-3"></i>
              <h4 class="fw-bold">Verified Locations</h4>
              <p class="text-muted">We partner only with safe, secure, and trusted parking providers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
  `,

};
