export default {
    template: `
    
<div class="auth-container">        
<div class="card shadow-sm" style="width: 100%; max-width: 500px;">
            <div class="card-body p-4">
                <h2 class="card-title text-center mb-4">Create Account</h2>
                
                <form @submit.prevent="registerUser" class="needs-validation" novalidate>
                    <div class="mb-3">
                        <label for="name" class="form-label">Full Name</label>
                        <input type="text" class="form-control form-control-sm" id="name" 
                               v-model="formData.name" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="username" class="form-label">Username</label>
                        <input type="text" class="form-control form-control-sm" id="username" 
                               v-model="formData.username" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control form-control-sm" id="email" 
                               v-model="formData.email" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="phone" class="form-label">Phone</label>
                        <input type="tel" class="form-control form-control-sm" id="phone" 
                               v-model="formData.phone" required>
                    </div>
                    
                    <div class="mb-4">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control form-control-sm" id="password" 
                               v-model="formData.password" required>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary btn-sm">
                            Register
                        </button>
                    </div>
                    
                    <div class="text-center mt-3">
                        <small class="text-muted">
                            Already have an account? 
                            <a href="#" @click.prevent="$router.push('/login')" class="text-decoration-none">Login</a>
                        </small>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            formData: {
                name: '',
                username: '',
                email: '',
                phone: '',
                password: ''
            }
        };
    },
    methods: {
        registerUser() {
            // Simple client-side validation
            if (!this.formData.name || !this.formData.email || !this.formData.password) {
                alert('Please fill in all required fields');
                return;
            }

            fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.formData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { 
                        throw new Error(err.message || 'Registration failed'); 
                    });
                }
                return response.json();
            })
            .then(() => {
                alert('Registration successful! Please login with your credentials.');
                this.$router.push('/login');
            })
            .catch(err => {
                alert(err.message || 'Registration failed. Please try again.');
            });
        }
    }
}