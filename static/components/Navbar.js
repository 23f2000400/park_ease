export default {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div class="container-fluid">
            <!-- Logo on left with spacing -->
            <a class="navbar-brand ms-5 ps-1" href="#">Park Ease</a>
            
            <!-- Centered navigation items -->
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav ps-5">  <!-- mx-auto centers the nav -->
                    <li class="nav-item px-3">
                        <router-link class="nav-link" to="/">Home</router-link>
                    </li>
                    <li class="nav-item px-3">
                        <router-link class="nav-link" to="/user/home">User Home</router-link>
                    </li>
                    <li class="nav-item px-3">
                        <router-link class="nav-link" to="/login">Login</router-link>
                    </li>
                    <li class="nav-item px-3">
                        <router-link class="nav-link" to="/register">Register</router-link>
                    </li>
                    <li class="nav-item px-3">
                        <router-link class="nav-link" to="/admin/summary">Summary</router-link>
                    </li>
                    <li class="nav-item px-3">
                        <router-link class="nav-link" to="/api/logout">Logout</router-link>
                    </li>
                </ul>
            </div>
            
            <!-- Mobile toggler on right -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
        </div>
    </nav>
    `
}