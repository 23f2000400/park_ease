export default {
    template: `
<div class="auth-container">        
<div class="card shadow-sm" style="width: 100%; max-width: 500px;">
            <div class="card-body p-4">
                <h2 class="card-title text-center mb-4">Welcome Back</h2>
                
                <form @submit.prevent="loginUser" class="auth-form" novalidate>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control form-control-sm" id="email" 
                               v-model="formData.email" required>
                    </div>
                    
                    <div class="mb-4">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control form-control-sm" id="password" 
                               v-model="formData.password" required>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary btn-sm">
                            Login
                        </button>
                    </div>
                    
                    <div class="text-center mt-3">
                        <small class="text-muted">
                            Don't have an account? 
                            <a href="#" @click.prevent="$router.push('/register')" class="text-decoration-none">Register</a>
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
                email: '',
                password: ''
            }
        };
    },
    methods: {
        loginUser() {
            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.formData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { 
                        throw new Error(err.message || 'Login failed'); 
                    });
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem('auth_token', data['auth-token']);
                localStorage.setItem('id', data['id']);
                localStorage.setItem('username', data.username);
                localStorage.setItem('role', data['roles']); // Save roles if needed

                alert('Login successful! You will be redirected to the home page.');
                if (data.roles.includes('admin')) {
                        this.$router.push('/admin/home');
                    } else if (data.roles.includes('user')) {
                        this.$router.push('/user/home');
                    } else {
                        alert('Unknown role. Contact support.');
                    }            
            })
            .catch(err => {
                alert(err.message || 'Login failed. Please check your credentials.');
            });
        }
    }
}