export default {
  template: `
  <div class="container mt-4">
    <h2 class="mb-4 text-primary"><i class="fas fa-user-edit me-2"></i>Edit Profile</h2>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <form @submit.prevent="submitForm" class="card p-4 shadow-sm">

        <div class="mb-3">
          <label class="form-label">Name</label>
          <input v-model="form.name" type="text" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Username</label>
          <input v-model="form.username" type="text" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Phone</label>
          <input v-model="form.phone" type="text" class="form-control" />
        </div>

        <hr />
        <h5 class="text-secondary">Change Password <small class="text-muted">(Optional)</small></h5>

        <div class="mb-3">
          <label class="form-label">New Password</label>
          <input v-model="form.password" type="password" class="form-control" minlength="6" />
        </div>

        <div class="mb-3">
          <label class="form-label">Confirm Password</label>
          <input v-model="form.confirm_password" type="password" class="form-control" />
          <div v-if="form.password && form.confirm_password && form.password !== form.confirm_password"
               class="text-danger mt-1">
            Passwords do not match
          </div>
        </div>

        <div class="d-flex justify-content-between">
          <router-link to="/user/profile" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left me-1"></i> Cancel
          </router-link>
          <button type="submit" class="btn btn-success" :disabled="!isFormValid">
            <i class="fas fa-save me-1"></i> Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  `,
  data() {
    return {
      loading: true,
      form: {
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: ''
      }
    };
  },
  computed: {
    isFormValid() {
      if (this.form.password || this.form.confirm_password) {
        return this.form.password.length >= 6 && this.form.password === this.form.confirm_password;
      }
      return true;
    }
  },
  methods: {
    async fetchProfile() {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/user/profile', {
          headers: { 'Authentication-Token': token }
        });

        if (!res.ok) throw new Error('Failed to load user');

        const data = await res.json();
        this.form.name = data.name;
        this.form.username = data.username;
        this.form.email = data.email;
        this.form.phone = data.phone;
      } catch (err) {
        console.error(err);
        alert("Failed to load user profile.");
      } finally {
        this.loading = false;
      }
    },

    async submitForm() {
      if (!this.isFormValid) {
        alert("Please check password fields.");
        return;
      }

      const payload = {
        name: this.form.name,
        username: this.form.username,
        email: this.form.email,
        phone: this.form.phone
      };

      if (this.form.password) {
        payload.password = this.form.password;
      }

      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': token
          },
          body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (!res.ok) {
          alert(result.message || 'Failed to update profile');
          return;
        }

        alert("Profile updated successfully!");
        this.$router.push('/user/profile');

      } catch (err) {
        console.error(err);
        alert("An error occurred while updating profile.");
      }
    }
  },
  mounted() {
    this.fetchProfile();
  }
};
