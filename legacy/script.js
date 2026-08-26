// Mock Data
const schemesData = [
    {
        id: 'scheme-1',
        name: 'PM-KISAN Samman Nidhi',
        description: 'Income support of ₹6,000 per year to all landholding farmers families',
        category: 'agriculture',
        status: 'Active',
        icon: 'fa-tractor'
    },
    {
        id: 'scheme-2',
        name: 'Ayushman Bharat PM-JAY',
        description: 'Health insurance coverage of ₹5 lakh per family per year',
        category: 'health',
        status: 'Active',
        icon: 'fa-notes-medical'
    },
    {
        id: 'scheme-3',
        name: 'PM Awas Yojana - Gramin',
        description: 'Pucca houses with basic amenities to rural homeless families',
        category: 'housing',
        status: 'Active',
        icon: 'fa-house-chimney'
    },
    {
        id: 'scheme-4',
        name: 'Pradhan Mantri Mudra Yojana',
        description: 'Loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises',
        category: 'finance',
        status: 'Active',
        icon: 'fa-money-bill-wave'
    },
    {
        id: 'scheme-5',
        name: 'Stand-Up India Scheme',
        description: 'Facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one SC/ST borrower',
        category: 'finance',
        status: 'Active',
        icon: 'fa-briefcase'
    },
    {
        id: 'scheme-6',
        name: 'Skill India Mission',
        description: 'Provides training and skill development to youth across the country',
        category: 'education',
        status: 'Active',
        icon: 'fa-graduation-cap'
    }
];

let applicationsData = [
    {
        id: 'PMK2026001',
        name: 'PM-KISAN Samman Nidhi',
        date: '12/08/2026',
        status: 'Approved',
        details: 'Amount of ₹2,000 has been credited to your linked bank account.'
    },
    {
        id: 'AB2026002',
        name: 'Ayushman Bharat PM-JAY',
        date: '18/08/2026',
        status: 'Pending',
        details: 'Verification of income certificate is currently under process.'
    }
];

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    setupPageNavigation();
    renderSchemes(schemesData);
    renderApplications();
    updateDashboardStats();
    setupDashboardTabs();
    setupSearch();
    setupChat();
    setupAuthLogic();
});

// Authentication Logic
function checkAuthState() {
    const isLoggedIn = localStorage.getItem('sih_isLoggedIn') === 'true';
    const loginBtn = document.getElementById('nav-login-btn');
    const userProfile = document.getElementById('nav-user-profile');

    if (isLoggedIn) {
        loginBtn.classList.add('d-none');
        userProfile.classList.remove('d-none');
    } else {
        loginBtn.classList.remove('d-none');
        userProfile.classList.add('d-none');
    }
}

function setupAuthLogic() {
    const loginBtn = document.getElementById('nav-login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Open Auth Modal
    if(loginBtn) {
        loginBtn.addEventListener('click', () => {
            document.getElementById('auth-modal').classList.add('active');
        });
    }

    // Handle Logout
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm("Are you sure you want to logout?")) {
                localStorage.removeItem('sih_isLoggedIn');
                localStorage.removeItem('sih_rememberMe');
                checkAuthState();
                
                // Redirect to Home if on Dashboard
                document.querySelector('.nav-link[data-page="home"]').click();
                showToast("Logged out successfully");
            }
        });
    }

    // Auth Tabs Switching
    const authTabs = document.querySelectorAll('.auth-tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            authTabs.forEach(b => b.classList.remove('active'));
            authForms.forEach(f => f.classList.add('d-none'));
            
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            document.getElementById(target).classList.remove('d-none');
            
            // Update Title
            document.getElementById('auth-title').textContent = target === 'login-form' ? 'Welcome Back' : 'Create Account';
        });
    });
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

function handleLogin() {
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Set Login State
    localStorage.setItem('sih_isLoggedIn', 'true');
    if (rememberMe) {
        localStorage.setItem('sih_rememberMe', 'true');
    } else {
        localStorage.removeItem('sih_rememberMe');
    }

    closeAuthModal();
    checkAuthState();
    showToast("Logged in successfully!");
    
    // Navigate to Dashboard
    document.querySelector('.nav-link[data-page="dashboard"]').click();
}

function handleRegister() {
    // Treat register as auto-login for mock purposes
    localStorage.setItem('sih_isLoggedIn', 'true');
    closeAuthModal();
    checkAuthState();
    showToast("Account created successfully!");
    document.querySelector('.nav-link[data-page="dashboard"]').click();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


// Page Navigation Logic
function setupPageNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // If trying to access Dashboard while logged out
            const targetPage = link.getAttribute('data-page');
            if (targetPage === 'dashboard' && localStorage.getItem('sih_isLoggedIn') !== 'true') {
                document.getElementById('auth-modal').classList.add('active');
                showToast("Please login to view your dashboard");
                return;
            }

            // Remove active classes
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));

            // Add active class to clicked link and corresponding page
            link.classList.add('active');
            document.getElementById(`page-${targetPage}`).classList.add('active');
        });
    });
}

// Render Schemes in Schemes Page
function renderSchemes(data) {
    const container = document.getElementById('schemes-list');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); padding: 1rem 0; grid-column: 1 / -1; text-align: center;">No schemes found matching your criteria.</p>';
        return;
    }

    data.forEach(scheme => {
        const card = document.createElement('div');
        card.className = 'scheme-card';
        card.innerHTML = `
            <div class="scheme-info">
                <div class="scheme-icon">
                    <i class="fa-solid ${scheme.icon}"></i>
                </div>
                <div class="scheme-details">
                    <h4>${scheme.name}</h4>
                    <p>${scheme.description}</p>
                    <div class="badges">
                        <span class="badge badge-outline">${scheme.category}</span>
                        <span class="badge badge-active">${scheme.status}</span>
                    </div>
                </div>
            </div>
            <button class="btn-primary full-width" onclick="handleSchemeApply('${scheme.name}')">Apply Now</button>
        `;
        container.appendChild(card);
    });
}

// Redirect to login if trying to apply while logged out
function handleSchemeApply(schemeName) {
    if (localStorage.getItem('sih_isLoggedIn') !== 'true') {
        document.getElementById('auth-modal').classList.add('active');
        showToast("Please login to apply for schemes");
    } else {
        openApplyModal(schemeName);
    }
}

// Render Applications in Dashboard
function renderApplications() {
    const container = document.getElementById('applications-list');
    container.innerHTML = '';
    
    if (applicationsData.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">You have not applied for any schemes yet.</p>';
        return;
    }

    applicationsData.forEach(app => {
        const card = document.createElement('div');
        card.className = 'scheme-card';
        
        let badgeClass = 'badge-outline';
        if (app.status === 'Approved') badgeClass = 'badge-success';
        if (app.status === 'Pending') badgeClass = 'badge-warning';
        if (app.status === 'Rejected') badgeClass = 'badge-danger';
        
        card.innerHTML = `
            <div class="scheme-info">
                <div class="scheme-details">
                    <h4>${app.name}</h4>
                    <p>Application ID: <strong>${app.id}</strong> | Date: ${app.date}</p>
                    <div class="badges">
                        <span class="badge ${badgeClass}">${app.status}</span>
                    </div>
                </div>
            </div>
            <button class="btn-outline" onclick="openApplicationDetails('${app.id}')">View Details</button>
        `;
        container.appendChild(card);
    });
}

// Update Dashboard Statistics
function updateDashboardStats() {
    let applied = applicationsData.length;
    let approved = applicationsData.filter(a => a.status === 'Approved').length;
    let pending = applicationsData.filter(a => a.status === 'Pending').length;
    let rejected = applicationsData.filter(a => a.status === 'Rejected').length;

    document.getElementById('stat-applied').textContent = applied;
    document.getElementById('stat-approved').textContent = approved;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-rejected').textContent = rejected;
}

// Dashboard Tabs (My Applications, Profile, AI)
function setupDashboardTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Search Functionality (in Schemes page)
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            
            const filtered = schemesData.filter(scheme => 
                scheme.name.toLowerCase().includes(query) || 
                scheme.description.toLowerCase().includes(query) ||
                scheme.category.toLowerCase().includes(query)
            );
            renderSchemes(filtered);
        });
    }
}

// Application Details Modal
function openApplicationDetails(appId) {
    const app = applicationsData.find(a => a.id === appId);
    if (!app) return;

    let badgeClass = 'badge-outline';
    if (app.status === 'Approved') badgeClass = 'badge-success';
    if (app.status === 'Pending') badgeClass = 'badge-warning';
    if (app.status === 'Rejected') badgeClass = 'badge-danger';

    const body = document.getElementById('details-modal-body');
    body.innerHTML = `
        <h4 style="margin-bottom: 10px; font-size: 1.1rem;">${app.name}</h4>
        <p style="margin-bottom: 5px;"><strong>Application ID:</strong> ${app.id}</p>
        <p style="margin-bottom: 5px;"><strong>Applied On:</strong> ${app.date}</p>
        <p style="margin-bottom: 15px;"><strong>Status:</strong> <span class="badge ${badgeClass}">${app.status}</span></p>
        <div style="background-color: var(--bg-color); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
            <h5 style="margin-bottom: 5px; color: var(--text-muted);">Remarks / Updates</h5>
            <p>${app.details}</p>
        </div>
    `;

    document.getElementById('details-modal').classList.add('active');
}

function closeDetailsModal() {
    document.getElementById('details-modal').classList.remove('active');
}

// Apply Modal Logic
function openApplyModal(schemeName) {
    document.getElementById('modal-scheme-name').textContent = schemeName;
    document.getElementById('apply-modal').classList.add('active');
}

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('apply-modal').classList.remove('active');
});

// Close modals if clicked outside
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
        }
    });
});

// Handle Application Submission
function submitApplication() {
    document.getElementById('apply-modal').classList.remove('active');
    
    showToast("Application submitted successfully!");
    
    // Add to Mock Applications
    const schemeName = document.getElementById('modal-scheme-name').textContent;
    const newApp = {
        id: 'APP' + Math.floor(Math.random() * 100000),
        name: schemeName,
        date: new Date().toLocaleDateString('en-GB'),
        status: 'Pending',
        details: 'Application received. Currently under initial review.'
    };
    applicationsData.unshift(newApp);
    
    // Re-render and update stats
    renderApplications();
    updateDashboardStats();
    
    setTimeout(() => {
        // Reset form
        document.getElementById('apply-form').reset();
    }, 1000);
}

// AI Chat Logic
function setupChat() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-msg-btn');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatInput || !sendBtn || !chatMessages) return;

    function sendMessage() {
        const msg = chatInput.value.trim();
        if (msg) {
            // Add User Message
            const userDiv = document.createElement('div');
            userDiv.className = 'message user-message';
            userDiv.textContent = msg;
            chatMessages.appendChild(userDiv);
            
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Mock AI Response
            setTimeout(() => {
                const aiDiv = document.createElement('div');
                aiDiv.className = 'message ai-message';
                aiDiv.textContent = "I can check your application statuses or suggest new schemes based on your profile. Would you like me to check the status of 'Ayushman Bharat'?";
                chatMessages.appendChild(aiDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// Save Profile Form Logic
function saveProfile() {
    // Basic validation is handled by HTML5 'required' attributes
    showToast("Profile details saved and sent for verification securely!");
    
    // Switch to Applications tab after saving profile
    setTimeout(() => {
        document.querySelector('.tab-btn[data-target="applications"]').click();
    }, 1500);
}
