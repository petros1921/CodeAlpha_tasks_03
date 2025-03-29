// Authentication Service

class AuthService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
    }
    
    isAuthenticated() {
        return !!this.token;
    }
    
    getToken() {
        return this.token;
    }
    
    getUser() {
        return this.user;
    }
    
    async login(email, password) {
        try {
            const response = await AuthAPI.login({ email, password });
            this.setSession(response.token, response.user);
            return response.user;
        } catch (error) {
            throw error;
        }
    }
    
    async register(username, email, password) {
        try {
            const response = await AuthAPI.register({ username, email, password });
            this.setSession(response.token, response.user);
            return response.user;
        } catch (error) {
            throw error;
        }
    }
    
    setSession(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }
    
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

// Create a singleton instance
const Auth = new AuthService();