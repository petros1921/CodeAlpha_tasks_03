// Main application entry point

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    initApp();
});

function initApp() {
    // Check if user is authenticated
    if (Auth.isAuthenticated()) {
        UI.renderDashboard();
    } else {
        UI.renderAuth();
    }
}