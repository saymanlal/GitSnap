// Shared utilities
window.showToast = function(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = isError ? '#dc2626' : '#1f2937';
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
};

// Generate unique ID
window.generateUserId = function(firstName, lastName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${timestamp}_${random}`;
};

// Format date
window.formatDate = function(timestamp) {
    return new Date(timestamp).toLocaleString();
};