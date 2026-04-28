// GitHub configuration (hardcoded - users never see this)
const GITHUB_OWNER = 'YOUR_GITHUB_USERNAME';  // ← CHANGE THIS
const GITHUB_REPO = 'gitsnap-users';           // ← CREATE THIS REPO
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN';      // ← GENERATE THIS

class AuthManager {
    static async signUp(firstName, lastName) {
        const userId = generateUserId(firstName, lastName);
        const timestamp = Date.now();
        const secretKey = CryptoJS.lib.WordArray.random(32).toString();
        
        const userData = {
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            fullName: `${firstName} ${lastName}`,
            createdAt: timestamp,
            secretKey: secretKey,
            lastLogin: timestamp
        };
        
        // Store user metadata on GitHub
        const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/users/${userId}.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Create user ${userId}`,
                content: btoa(JSON.stringify(userData, null, 2))
            })
        });
        
        if (!response.ok) throw new Error('Signup failed');
        
        // Create and download secret key file
        const keyFile = {
            userId: userId,
            secretKey: secretKey,
            fullName: `${firstName} ${lastName}`
        };
        
        const blob = new Blob([JSON.stringify(keyFile, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gitsnap_${userId}.key`;
        a.click();
        URL.revokeObjectURL(url);
        
        localStorage.setItem('gitsnap_user', JSON.stringify({ userId, fullName: `${firstName} ${lastName}` }));
        
        return userData;
    }
    
    static async signIn(fullName, keyFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const keyData = JSON.parse(e.target.result);
                    
                    // Find user by fullName (search GitHub)
                    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/users/`);
                    const files = await response.json();
                    
                    let found = false;
                    for (const file of files) {
                        const userResp = await fetch(file.download_url);
                        const userData = await userResp.json();
                        
                        if (userData.fullName === fullName && userData.secretKey === keyData.secretKey) {
                            localStorage.setItem('gitsnap_user', JSON.stringify({
                                userId: userData.userId,
                                fullName: userData.fullName
                            }));
                            found = true;
                            resolve(userData);
                            break;
                        }
                    }
                    
                    if (!found) reject(new Error('Invalid credentials'));
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(keyFile);
        });
    }
    
    static logout() {
        localStorage.removeItem('gitsnap_user');
        window.location.href = 'index.html';
    }
    
    static isAuthenticated() {
        return localStorage.getItem('gitsnap_user') !== null;
    }
    
    static getCurrentUser() {
        const user = localStorage.getItem('gitsnap_user');
        return user ? JSON.parse(user) : null;
    }
}

// Handle signup/signin page
if (window.location.pathname.includes('auth.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('signup') === 'true') {
        document.querySelector('[data-tab="signup"]').click();
    }
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
            document.getElementById(`${tab}-tab`).classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        
        try {
            await AuthManager.signUp(firstName, lastName);
            showToast('Account created! Redirecting...');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        } catch (err) {
            showToast(err.message, true);
        }
    });
    
    document.getElementById('signinForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signinUsername').value;
        const keyFile = document.getElementById('secretKeyFile').files[0];
        
        if (!keyFile) {
            showToast('Please select your secret key file', true);
            return;
        }
        
        try {
            await AuthManager.signIn(username, keyFile);
            showToast('Signed in! Redirecting...');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        } catch (err) {
            showToast('Invalid credentials or key file', true);
        }
    });
}