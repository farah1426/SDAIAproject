/* ==========================================================================
   MADAD (مدد) - CORE APPLICATION LOGIC & STATE
   Saudi Smart Rescue Platform JavaScript Engine
   ========================================================================== */
// 1. Mock Database & Application State
const state = {
    // Current Active Language ('en' or 'ar')
    lang: 'en',
    
    // Logged in User Profile
    currentUser: null,
    
    // User Profiles Mock Database (For Login and Missing Person Lookups)
    users: JSON.parse(localStorage.getItem('madad_users')) || [
        {
            username: "citizen",
            password: "123",
            name: "Fahad Ahmed bin Saeed",
            role: "citizen",
            nationalId: "1089274810",
            phone: "0501234567",
            emergencyContact: "0509876543",
            bloodType: "O+",
            medicalConditions: "Asthma",
            allergies: "Penicillin",
            vehicleType: "Toyota Land Cruiser Black",
            vehiclePlate: "أ ب ج 1 2 3 4",
            lastSyncedTrip: {
                destination: "Nafud Desert Sand Dunes",
                region: "Nafud",
                lat: 25.6200,
                lng: 45.2400,
                speed: 45, // km/h
                heading: 45, // degrees
                battery: 38,
                timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000) // 2.5 hours ago
            }
        },
        
        {
            username: "yousef",
            password: "123",
            name: "Yousef Khaled Al-Subaie",
            role: "citizen",
            nationalId: "1077263544",
            phone: "0547192837",
            emergencyContact: "0502223344",
            bloodType: "A+",
            medicalConditions: "Diabetes Type 1",
            allergies: "Nuts",
            vehicleType: "Nissan Patrol Gray",
            vehiclePlate: "ح ط ك 9 8 7 6",
            lastSyncedTrip: {
                destination: "Edge of the World, Riyadh",
                region: "Riyadh",
                lat: 24.9600,
                lng: 45.9900,
                speed: 12, // Walking/Slow driving
                heading: 180, // South
                battery: 14,
                timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000) // 4.5 hours ago
            }
        },
        {
            username: "sara",
            password: "123",
            name: "Sara Al-Otaibi",
            role: "citizen",
            nationalId: "2019842716",
            phone: "0561122334",
            emergencyContact: "0504445566",
            bloodType: "B+",
            medicalConditions: "None",
            allergies: "None",
            vehicleType: "N/A (Hiking)",
            vehiclePlate: "N/A",
            lastSyncedTrip: {
                destination: "Al-Sarawat Peaks, Asir",
                region: "Asir",
                lat: 18.2300,
                lng: 42.4800,
                speed: 4, // Walking speed
                heading: 270, // West
                battery: 92,
                timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000) // 30 minutes ago
            }
        }
    ],
    // Active Trip State (User Dashboard Side)
    activeTrip: null,
    tripTimer: null,
    tripGPSLog: [],
    isSignalLost: false,
    // Incidents Database (Rescue command center view)
    incidents: [
        {
            id: "2026-CD-1082",
            name: "Yousef Khaled Al-Subaie",
            nationalId: "1077263544",
            phone: "0547192837",
            region: "Riyadh",
            emergencyType: "Desert Dehydration / Lost",
            medicalInfo: "Diabetes Type 1",
            allergies: "Nuts",
            vehicleInfo: "Nissan Patrol Gray (ح ط ك 9876)",
            battery: 14,
            lastLocation: { lat: 24.9642, lng: 45.9915 },
            lastUpdate: new Date(Date.now() - 4.5 * 60 * 60 * 1000), // 4.5 hrs ago
            speed: 12, // last known speed
            heading: 180, // heading south
            terrainCoefficient: 1.3, // Sand dunes search friction
            priorityScore: 82, // Calculated AI score
            status: "REPORTED", // REPORTED, DISPATCHED, ON-SITE, RESCUED, CLOSED
            assignedTeam: null,
            assignedOfficer: null,
            eta: null,
            notes: "Vehicle trapped in deep sand, driver has insulin dependence, extreme heat risk.",
            timeline: [
                { time: "10:30", event_en: "Incident reported via Madad SSO.", event_ar: "تم تسجيل البلاغ عبر منصة مدد الموحدة." },
                { time: "10:32", event_en: "AI Priority engine flagged Case: Critical (82%).", event_ar: "نظام الذكاء الاصطناعي يصنف الحالة: حرجة (٨٢٪)." }
            ]
        },
        {
            id: "2026-CD-1083",
            name: "Sara Al-Otaibi",
            nationalId: "2019842716",
            phone: "0561122334",
            region: "Asir",
            emergencyType: "Mountain Fall / Injury",
            medicalInfo: "None",
            allergies: "None",
            vehicleInfo: "N/A (Hiking)",
            battery: 92,
            lastLocation: { lat: 18.2312, lng: 42.4842 },
            lastUpdate: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
            speed: 3, // walking speed
            heading: 270, // heading west
            terrainCoefficient: 1.6, // Heavy mountain ridges terrain friction
            priorityScore: 68,
            status: "DISPATCHED",
            assignedTeam: "Asir Mountain Rescue Team Alpha",
            assignedOfficer: "Capt. Bandar Al-Harbi",
            eta: "25 Min",
            notes: "Suspected ankle fracture on steep slope near Habala. Weather foggy with limited visibility.",
            timeline: [
                { time: "14:29", event_en: "Emergency SOS triggered by climber.", event_ar: "تفعيل نداء الاستغاثة من قبل متسلق الجبال." },
                { time: "14:32", event_en: "Asir Rescue Team Alpha dispatched with helicopter support.", event_ar: "توجيه فريق إنقاذ عسير (ألفا) بدعم جوي." }
            ]
        },
        {
            id: "2026-CD-1084",
            name: "Abdullah Mohammed Al-Nasser",
            nationalId: "1055627183",
            phone: "0554433221",
            region: "Eastern",
            emergencyType: "Flash Flood / Vehicle Trap",
            medicalInfo: "Hypertension",
            allergies: "None",
            vehicleInfo: "Toyota Hilux White (د ر س 5432)",
            battery: 48,
            lastLocation: { lat: 26.1520, lng: 48.8105 },
            lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
            speed: 0, // stranded
            heading: 0,
            terrainCoefficient: 1.1,
            priorityScore: 78,
            status: "DISPATCHED",
            assignedTeam: "Eastern Civil Defense Division 4",
            assignedOfficer: "Lt. Mansour Al-Qahtani",
            eta: "12 Min",
            notes: "Vehicle trapped inside wadi channel during flash flood. Water levels rising rapidly.",
            timeline: [
                { time: "14:44", event_en: "SOS received. Heavy rainfall reported in coordinates.", event_ar: "استلام نداء الاستغاثة. تقارير بهطول أمطار غزيرة في الموقع." },
                { time: "14:47", event_en: "Civil Defense Unit 4 dispatched with Zodiac boats.", event_ar: "انطلاق وحدة الدفاع المدني 4 مزودة بقوارب الإنقاذ." }
            ]
        }
    ],
    // Regional Rescue Team hubs (for closest team calculation)
    teams: [
        { name: "Riyadh Desert Patrol Section 2", region: "Riyadh", baseCoords: { lat: 24.7136, lng: 46.6753 } },
        { name: "Asir Mountain Rescue Team Alpha", region: "Asir", baseCoords: { lat: 18.2164, lng: 42.5053 } },
        { name: "Eastern Civil Defense Division 4", region: "Eastern", baseCoords: { lat: 26.2172, lng: 50.1971 } },
        { name: "Tabuk Wilderness rescue squad", region: "Tabuk", baseCoords: { lat: 28.3835, lng: 36.5662 } },
        { name: "Hail Desert Rescue division", region: "Nafud", baseCoords: { lat: 27.5114, lng: 41.7208 } },
        { name: "Makkah Wadi Operations hub", region: "Makkah", baseCoords: { lat: 21.3891, lng: 39.8579 } }
    ],
    // Officers directory for dispatch dropdown
    officers: [
        "Capt. Bandar Al-Harbi",
        "Lt. Mansour Al-Qahtani",
        "Maj. Khalid Al-Dosari",
        "Capt. Faisal bin Turki",
        "Lt. Sultan Al-Shammari"
    ],
    // Active Selected Incident ID in Ops Dashboard
    selectedIncidentId: null,
    
    // UI Filtering mode for Incidents ('ALL', 'CRITICAL', 'HIGH', 'MEDIUM')
    opsFilter: 'ALL'
};
// Leaflet Map State variables
let mapInstance = null;
let mapMarkersGroup = null;
let predictiveCirclesGroup = null;
let searchVectorLine = null;
// ==========================================================================
// 2. CORE TRANSLATION ENGINE (BILINGUAL SUPPORT)
// ==========================================================================
function toggleLanguage() {
    state.lang = state.lang === 'en' ? 'ar' : 'en';
    localStorage.setItem('madad_lang', state.lang);
    
    const htmlNode = document.documentElement;
    const btnLang = document.getElementById('btn-lang');
    
    if (state.lang === 'ar') {
        htmlNode.setAttribute('dir', 'rtl');
        htmlNode.setAttribute('lang', 'ar');
        btnLang.textContent = 'English';
    } else {
        htmlNode.setAttribute('dir', 'ltr');
        htmlNode.setAttribute('lang', 'en');
        btnLang.textContent = 'العربية';
    }
    
    // Translate all elements with data attributes
    applyTranslations();
    
    // Refresh active rendering elements to match language
    if (document.getElementById('page-user-dash').classList.contains('active')) {
        renderUserHistory();
        syncUserHUD();
    }
    if (document.getElementById('page-ops-dash').classList.contains('active')) {
        renderIncidentsList();
        renderIncidentDetails();
    }
    
    showToast(
        state.lang === 'en' ? "Language changed to English" : "تم تغيير اللغة إلى العربية",
        "info"
    );
}
function applyTranslations() {
    const elements = document.querySelectorAll('[data-en]');
    elements.forEach(el => {
        const text = state.lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-ar');
        if (text) {
            // Check if element is an input with placeholders
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = text;
            } else {
                el.textContent = text;
            }
        }
    });
    // Handle inputs placeholders separately if custom attributes exist
    const placeholders = document.querySelectorAll('[data-en-placeholder]');
    placeholders.forEach(el => {
        const ph = state.lang === 'en' ? el.getAttribute('data-en-placeholder') : el.getAttribute('data-ar-placeholder');
        if (ph) el.placeholder = ph;
    });
}
// ==========================================================================
// 3. TOAST NOTIFICATION UTILITY
// ==========================================================================
function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : ''}`;
    
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
// ==========================================================================
// 4. ROUTING / VIEW SWITCHING
// ==========================================================================
// ==========================================================================
// 4. ROUTING / VIEW SWITCHING
// ==========================================================================
function switchView(viewName) {
    // 1. Strict Dashboard Protection
    if (viewName === 'user-dash' || viewName === 'ops-dash') {
        if (!state.currentUser) {
            showToast("يجب تسجيل الدخول أولاً للوصول إلى لوحة التحكم.", "error");
            switchView('landing');
            return;
        }
        
        // Role check
        if (viewName === 'user-dash' && state.currentUser.role !== 'citizen') {
            showToast("غير مصرح بالدخول للوحة التحكم المحددة.", "error");
            switchView('landing');
            return;
        }
        if (viewName === 'ops-dash' && state.currentUser.role !== 'officer') {
            showToast("غير مصرح بالدخول للوحة العمليات.", "error");
            switchView('landing');
            return;
        }
    }
    // Clear active classes from nav buttons
    const navButtons = ['btn-nav-login', 'btn-nav-register', 'btn-nav-user', 'btn-nav-ops'];
    navButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('active');
    });
    // Highlight the active navigation button
    if (viewName === 'landing') {
        const regBox = document.getElementById('auth-register-box');
        const isRegisterActive = regBox && regBox.classList.contains('active');
        const activeNavBtnId = isRegisterActive ? 'btn-nav-register' : 'btn-nav-login';
        const activeBtn = document.getElementById(activeNavBtnId);
        if (activeBtn) activeBtn.classList.add('active');
    } else if (viewName === 'user-dash') {
        const activeBtn = document.getElementById('btn-nav-user');
        if (activeBtn) activeBtn.classList.add('active');
    } else if (viewName === 'ops-dash') {
        const activeBtn = document.getElementById('btn-nav-ops');
        if (activeBtn) activeBtn.classList.add('active');
    }
    // Toggle page views visibility
    document.querySelectorAll('.app-page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(`page-${viewName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    // Secondary setup triggers
    if (viewName === 'ops-dash') {
        initRescueMap();
        renderIncidentsList();
    } else if (viewName === 'user-dash') {
        syncUserHUD();
        renderUserHistory();
    }
    // Dynamic navbar state sync
    updateNavbar();
}
function updateNavbar() {
    const btnLogin = document.getElementById('btn-nav-login');
    const btnRegister = document.getElementById('btn-nav-register');
    const btnUser = document.getElementById('btn-nav-user');
    const btnOps = document.getElementById('btn-nav-ops');
    const navGreeting = document.getElementById('nav-user-greeting');
    const btnLogout = document.getElementById('btn-nav-logout');
    if (state.currentUser) {
        if (btnLogin) btnLogin.style.display = 'none';
        if (btnRegister) btnRegister.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'block';
        if (state.currentUser.role === 'officer') {
            if (btnUser) btnUser.style.display = 'none';
            if (btnOps) btnOps.style.display = 'block';
        } else {
            if (btnUser) btnUser.style.display = 'block';
            if (btnOps) btnOps.style.display = 'none';
        }
        if (navGreeting) {
            navGreeting.style.display = 'inline-block';
            const welcomeText = state.lang === 'en' ? `Welcome, ${state.currentUser.name}` : `مرحباً، ${state.currentUser.name}`;
            navGreeting.textContent = welcomeText;
        }
    } else {
        if (btnLogin) btnLogin.style.display = 'block';
        if (btnRegister) btnRegister.style.display = 'block';
        if (btnUser) btnUser.style.display = 'none';
        if (btnOps) btnOps.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'none';
        if (navGreeting) {
            navGreeting.style.display = 'none';
            navGreeting.textContent = '';
        }
    }
}
// ==========================================================================
// 5. AUTHENTICATION CONTROLLERS
// ==========================================================================
function toggleAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-box').forEach(box => box.classList.remove('active'));
    
    // Clear validation errors when switching tabs
    clearErrors();
    if (tab === 'login') {
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('auth-login-box').classList.add('active');
        
        // Update nav bar active states
        const btnLogin = document.getElementById('btn-nav-login');
        const btnRegister = document.getElementById('btn-nav-register');
        if (btnLogin) btnLogin.classList.add('active');
        if (btnRegister) btnRegister.classList.remove('active');
    } else {
        document.getElementById('tab-register').classList.add('active');
        document.getElementById('auth-register-box').classList.add('active');
        
        // Update nav bar active states
        const btnLogin = document.getElementById('btn-nav-login');
        const btnRegister = document.getElementById('btn-nav-register');
        if (btnLogin) btnLogin.classList.remove('active');
        if (btnRegister) btnRegister.classList.add('active');
    }
}
function clearErrors() {
    document.querySelectorAll('.validation-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.classList.remove('input-error-border');
    });
}
function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errSpan = document.getElementById(errorId);
    if (field) {
        field.classList.add('input-error-border');
    }
    if (errSpan) {
        errSpan.textContent = message;
        errSpan.style.display = 'block';
    }
}
function validateLogin() {
    clearErrors();
    let isValid = true;
    
    const userVal = document.getElementById('login-username').value.trim();
    const passVal = document.getElementById('login-password').value;
    if (!userVal) {
        showError('login-username', 'err-login-username', 'اسم المستخدم مطلوب');
        isValid = false;
    }
    if (!passVal) {
        showError('login-password', 'err-login-password', 'كلمة المرور مطلوبة');
        isValid = false;
    }
    return isValid;
}
function validateRegister() {
    clearErrors();
    let isValid = true;
    const role = document.getElementById('reg-role').value;
    const username = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value;
    const nationalId = document.getElementById('reg-nationalid').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const emergencyContact = document.getElementById('reg-emergency-contact').value.trim();
    const bloodType = document.getElementById('reg-blood').value;
    const medical = document.getElementById('reg-medical').value.trim();
    const allergies = document.getElementById('reg-allergies').value.trim();
    if (!role) {
        showError('reg-role', 'err-reg-role', 'نوع الحساب مطلوب');
        isValid = false;
    }
    if (!username) {
        showError('reg-username', 'err-reg-username', 'اسم المستخدم مطلوب');
        isValid = false;
    }
    if (!pass) {
        showError('reg-password', 'err-reg-password', 'كلمة المرور مطلوبة');
        isValid = false;
    }
    if (!nationalId) {
        showError('reg-nationalid', 'err-reg-nationalid', 'رقم الهوية الوطنية مطلوب');
        isValid = false;
    } else if (!/^[12]\d{9}$/.test(nationalId)) {
        showError('reg-nationalid', 'err-reg-nationalid', 'يجب أن يتكون رقم الهوية من 10 أرقام ويبدأ بـ 1 أو 2');
        isValid = false;
    }
    if (!phone) {
        showError('reg-phone', 'err-reg-phone', 'رقم الجوال مطلوب');
        isValid = false;
    } else if (!/^05\d{8}$/.test(phone)) {
        showError('reg-phone', 'err-reg-phone', 'يجب أن يكون رقم الجوال مكوناً من 10 أرقام ويبدأ بـ 05');
        isValid = false;
    }
    if (!emergencyContact) {
        showError('reg-emergency-contact', 'err-reg-emergency-contact', 'جوال الطوارئ مطلوب');
        isValid = false;
    } else if (!/^05\d{8}$/.test(emergencyContact)) {
        showError('reg-emergency-contact', 'err-reg-emergency-contact', 'يجب أن يكون رقم جوال الطوارئ مكوناً من 10 أرقام ويبدأ بـ 05');
        isValid = false;
    }
    if (!bloodType) {
        showError('reg-blood', 'err-reg-blood', 'فصيلة الدم مطلوبة');
        isValid = false;
    }
    return isValid;
}
function handleLogin(event) {
    event.preventDefault();
    if (!validateLogin()) {
        return;
    }
    
    const userVal = document.getElementById('login-username').value.trim().toLowerCase();
    const passVal = document.getElementById('login-password').value;
    loginUser(userVal, passVal);
}
function loginUser(username, password) {
    // 1. Civil Defense Officer Bypass
    if (username === 'officer') {
        const officerUser = {
            username: "officer",
            password: password,
            name: "Lt. Col. Faisal Al-Saud",
            role: "officer",
            nationalId: "1000000000",
            phone: "0500000000"
        };
        state.currentUser = officerUser;
        localStorage.setItem('madad_user', JSON.stringify(officerUser));
        showToast(
            state.lang === 'en' ? "Officer single sign-on authenticated." : "تم التحقق من الدخول الموحد لغرفة العمليات.",
            "success"
        );
        switchView('ops-dash');
        return;
    }
    // 2. Normal user authentication match
    const matchedUser = state.users.find(u => u.username === username || u.nationalId === username);
    
    if (matchedUser) {
        if (matchedUser.password !== password) {
            showError('login-password', 'err-login-password', 'كلمة المرور غير صحيحة');
            return;
        }
        state.currentUser = matchedUser;
        localStorage.setItem('madad_user', JSON.stringify(matchedUser));
        showToast(
            state.lang === 'en' ? `Welcome back, ${matchedUser.name}` : `مرحباً بك مجدداً، ${matchedUser.name}`,
            "success"
        );
        
        // Update user elements
        document.getElementById('user-display-name').textContent = matchedUser.name;
        document.getElementById('user-display-id').textContent = `ID: ${matchedUser.nationalId}`;
        
        if (matchedUser.role === 'officer') {
            switchView('ops-dash');
        } else {
            switchView('user-dash');
        }
    } else {
        showError('login-username', 'err-login-username', 'اسم المستخدم أو رقم الهوية غير مسجل');
    }
}
function handleRegister(event) {
    event.preventDefault();
    if (!validateRegister()) {
        return;
    }
    
    const role = document.getElementById('reg-role').value;
    const username = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value;
    const nationalId = document.getElementById('reg-nationalid').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const emergencyContact = document.getElementById('reg-emergency-contact').value.trim();
    const bloodType = document.getElementById('reg-blood').value;
    const medicalConditions = document.getElementById('reg-medical').value.trim() || "None";
    const allergies = document.getElementById('reg-allergies').value.trim() || "None";
    const vehicleType = document.getElementById('reg-vehicle-type').value.trim() || "N/A";
    const vehiclePlate = document.getElementById('reg-vehicle-plate').value.trim() || "N/A";
    const exists = state.users.some(u => u.username === username.toLowerCase().replace(/\s+/g, '') || u.nationalId === nationalId);
    if (exists) {
        showToast(state.lang === 'en' ? "Username or National ID already registered" : "اسم المستخدم أو رقم الهوية مسجل مسبقاً", "error");
        return;
    }
    const newUser = {
        username: username.toLowerCase().replace(/\s+/g, ''),
        password: pass,
        name: username,
        role: role,
        nationalId,
        phone,
        emergencyContact,
        bloodType,
        medicalConditions,
        allergies,
        vehicleType,
        vehiclePlate
    };
    state.users.push(newUser);
    localStorage.setItem('madad_users', JSON.stringify(state.users));
    state.currentUser = newUser;
    localStorage.setItem('madad_user', JSON.stringify(newUser));
    
    document.getElementById('user-display-name').textContent = newUser.name;
    document.getElementById('user-display-id').textContent = `ID: ${newUser.nationalId}`;
    
    showToast(
        state.lang === 'en' ? "Registration successful! Profile synchronized." : "تم التسجيل بنجاح! مزامنة الهوية الرقمية.",
        "success"
    );
    if (role === 'officer') {
        switchView('ops-dash');
    } else {
        switchView('user-dash');
    }
}
function handleLogout() {
    state.currentUser = null;
    localStorage.removeItem('madad_user');
    if (state.tripTimer) {
        clearInterval(state.tripTimer);
        state.tripTimer = null;
    }
    state.activeTrip = null;
    state.tripGPSLog = [];
    state.isSignalLost = false;
    
    showToast(
        state.lang === 'en' ? "Logged out successfully" : "تم تسجيل الخروج بنجاح",
        "info"
    );
    switchView('landing');
}
// ==========================================================================
// 6. USER PANEL SWITCH CONTROLLER
// ==========================================================================
function openUserPanel(panelId) {
    // Hide default empty states and other active panels
    document.querySelectorAll('.user-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
}
function closeUserPanel() {
    document.querySelectorAll('.user-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById('panel-default').classList.add('active');
}
// ==========================================================================
// 7. USER TRIP SIMULATOR & GPS LOGGING
// ==========================================================================
function startTripSimulation(event) {
    event.preventDefault();
    const destination = document.getElementById('trip-destination').value.trim();
    const returnTime = document.getElementById('trip-return-time').value;
    const transport = document.getElementById('trip-transport').value;
    const companions = parseInt(document.getElementById('trip-companions').value) || 0;
    const plate = document.getElementById('trip-plate').value.trim() || "N/A";
    const region = document.getElementById('trip-region').value;
    // Define coordinate start anchors in Saudi Arabia based on region
    let startLat = 24.7136;
    let startLng = 46.6753; // Default Riyadh center
    if (region === 'Riyadh') { startLat = 24.8912; startLng = 46.8385; } // Thumamah desert region
    else if (region === 'Makkah') { startLat = 21.4391; startLng = 39.8179; } // Wadi regions
    else if (region === 'Eastern') { startLat = 25.4124; startLng = 49.6201; } // Al-Ahsa sand borders
    else if (region === 'Asir') { startLat = 18.2312; startLng = 42.4842; } // Mountain sector
    else if (region === 'Tabuk') { startLat = 28.5201; startLng = 35.1204; } // Mountain/desert coast
    else if (region === 'Nafud') { startLat = 27.5211; startLng = 41.7208; } // Hail desert dunes
    // Create Active Trip state structure
    state.activeTrip = {
        destination,
        returnTime,
        transport,
        companions,
        plate,
        region,
        startLat,
        startLng,
        currentLat: startLat,
        currentLng: startLng,
        speed: transport.includes('Hiking') ? 4 : 45, // default starting speed in km/h
        heading: 45, // direction vector angle (degrees, North-East)
        battery: 100,
        startTime: new Date(),
        isCriticalSOS: false
    };
    state.tripGPSLog = [];
    state.isSignalLost = false;
    // Reset simulator visual elements
    document.getElementById('form-safe-trip').classList.add('hidden');
    document.getElementById('user-trip-hud').classList.remove('hidden');
    document.getElementById('btn-simulate-disconnect').checked = false;
    
    const signalLabel = document.getElementById('signal-label');
    signalLabel.className = "signal-label-text col-green";
    signalLabel.textContent = state.lang === 'en' ? "Connected (Online)" : "متصل (أونلاين)";
    document.getElementById('gps-log-table').querySelector('tbody').innerHTML = '';
    // Clear any previous timer loop
    if (state.tripTimer) clearInterval(state.tripTimer);
    
    // Start Simulation Loop (Triggers every 3 seconds)
    state.tripTimer = setInterval(simulateGPSProgress, 3000);
    showToast(
        state.lang === 'en' ? "Trip initiated. Local GPS syncing active." : "تم تفعيل الرحلة ومسار الملاحة النشط.",
        "success"
    );
    simulateGPSProgress(); // run first tick immediately
}
function simulateGPSProgress() {
    if (!state.activeTrip) return;
    // 1. Simulating movement trigonometry
    // Convert heading from degrees to radians.
    // Coordinates step calculations: 1 degree latitude ~ 111km.
    const speedKms = state.activeTrip.speed / 3600 * 3; // speed distance in 3 seconds tick
    const latDelta = (speedKms * Math.cos(state.activeTrip.heading * Math.PI / 180)) / 111;
    const lngDelta = (speedKms * Math.sin(state.activeTrip.heading * Math.PI / 180)) / (111 * Math.cos(state.activeTrip.currentLat * Math.PI / 180));
    state.activeTrip.currentLat += latDelta;
    state.activeTrip.currentLng += lngDelta;
    // 2. Fluctuations to battery, speed, and heading
    state.activeTrip.battery = Math.max(0, state.activeTrip.battery - (Math.random() > 0.7 ? 1 : 0));
    state.activeTrip.heading = (state.activeTrip.heading + (Math.floor(Math.random() * 15) - 7) + 360) % 360;
    
    if (state.activeTrip.transport.includes('Hiking')) {
        state.activeTrip.speed = Math.max(1, state.activeTrip.speed + (Math.random() * 1 - 0.5));
    } else {
        state.activeTrip.speed = Math.max(15, state.activeTrip.speed + (Math.floor(Math.random() * 10) - 5));
    }
    // 3. Capture breadcrumb coordinate record
    const timestamp = new Date();
    const breadcrumb = {
        time: timestamp.toLocaleTimeString(),
        lat: state.activeTrip.currentLat.toFixed(5),
        lng: state.activeTrip.currentLng.toFixed(5),
        speed: state.activeTrip.speed.toFixed(1),
        heading: state.activeTrip.heading,
        battery: state.activeTrip.battery
    };
    // Store in device local cache list
    state.tripGPSLog.unshift(breadcrumb); // insert at front to see newest records in UI table
    // Update simulation HUD layout fields
    document.getElementById('hud-speed').textContent = `${breadcrumb.speed} km/h`;
    document.getElementById('hud-heading').textContent = `N ${breadcrumb.heading}°`;
    document.getElementById('hud-battery').textContent = `${breadcrumb.battery}%`;
    const timerDiff = Math.floor((Date.now() - state.activeTrip.startTime.getTime()) / 1000);
    const hrs = String(Math.floor(timerDiff / 3600)).padStart(2, '0');
    const mins = String(Math.floor((timerDiff % 3600) / 60)).padStart(2, '0');
    const secs = String(timerDiff % 60).padStart(2, '0');
    document.getElementById('hud-timer-val').textContent = `${hrs}:${mins}:${secs}`;
    // Update local table layout
    const tbody = document.getElementById('gps-log-table').querySelector('tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${breadcrumb.time}</td>
        <td>${breadcrumb.lat}, ${breadcrumb.lng}</td>
        <td>${breadcrumb.speed}</td>
        <td>${breadcrumb.battery}%</td>
    `;
    tbody.insertBefore(row, tbody.firstChild);
    // Keep table records clean
    if (tbody.children.length > 20) {
        tbody.removeChild(tbody.lastChild);
    }
    // 4. SYNC WITH BACKEND SERVER IF SIGNAL CONNECTED
    if (!state.isSignalLost) {
        // Upload coordinates to database server registry
        if (state.currentUser) {
            state.currentUser.lastSyncedTrip = {
                destination: state.activeTrip.destination,
                region: state.activeTrip.region,
                lat: state.activeTrip.currentLat,
                lng: state.activeTrip.currentLng,
                speed: state.activeTrip.speed,
                heading: state.activeTrip.heading,
                battery: state.activeTrip.battery,
                timestamp: timestamp
            };
        }
    }
}
function toggleSignalLoss(checkbox) {
    state.isSignalLost = checkbox.checked;
    const label = document.getElementById('signal-label');
    const statusVal = document.getElementById('hud-link-status');
    if (state.isSignalLost) {
        label.className = "signal-label-text col-red-text";
        label.textContent = state.lang === 'en' ? "Disconnected (Offline)" : "منقطع (أوفلاين)";
        statusVal.textContent = state.lang === 'en' ? "Offline (Cell Lost)" : "أوفلاين (مفقود)";
        statusVal.className = "col-red-text";
        
        showToast(
            state.lang === 'en' ? "⚠️ Network Connection Terminated. Local caching active. Server is NOT receiving coordinate updates." 
                               : "⚠️ تم محاكاة انقطاع الإنترنت. يتم حفظ البيانات محلياً فقط. لن تتلقى غرفة العمليات تحديثات مسارك.",
            "warning"
        );
    } else {
        label.className = "signal-label-text col-green";
        label.textContent = state.lang === 'en' ? "Connected (Online)" : "متصل (أونلاين)";
        statusVal.textContent = state.lang === 'en' ? "Connected" : "متصل";
        statusVal.className = "col-green";
        
        showToast(
            state.lang === 'en' ? "✓ Connection Restored. Local logs successfully synced with Civil Defense servers." 
                               : "✓ تمت استعادة الاتصال. تمت مزامنة السجلات المحلية مع خوادم الدفاع المدني.",
            "success"
        );
    }
}
function endTripSimulation() {
    if (state.tripTimer) {
        clearInterval(state.tripTimer);
        state.tripTimer = null;
    }
    if (state.activeTrip && state.currentUser) {
        // Save current trip to history array
        const pastTrip = {
            id: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
            destination: state.activeTrip.destination,
            region: state.activeTrip.region,
            status: "SAFE",
            date: new Date().toLocaleDateString(),
            details: `${state.activeTrip.transport} • Companions: ${state.activeTrip.companions}`
        };
        
        if (!state.currentUser.history) state.currentUser.history = [];
        state.currentUser.history.unshift(pastTrip);
    }
    state.activeTrip = null;
    state.tripGPSLog = [];
    state.isSignalLost = false;
    // Reset views
    document.getElementById('user-trip-hud').classList.add('hidden');
    document.getElementById('form-safe-trip').classList.remove('hidden');
    document.getElementById('form-safe-trip').reset();
    showToast(
        state.lang === 'en' ? "Trip terminated. Status marked SAFE." : "تم إنهاء الرحلة بسلام وحفظ السجل.",
        "success"
    );
    
    renderUserHistory();
}
// ==========================================================================
// 8. SOS ALERTS DISPATCH FLOW (USER SIDE)
// ==========================================================================
function triggerHudSOS() {
    openUserPanel('panel-sos');
    
    // Autofill notes from active trip state
    if (state.activeTrip) {
        document.getElementById('sos-notes').value = `Active simulation SOS: Destination ${state.activeTrip.destination}. Transport ${state.activeTrip.transport}. Signal state: ${state.isSignalLost ? 'OFFLINE' : 'ONLINE'}.`;
    }
}
function sendSOSAlert() {
    if (!state.currentUser) {
        showToast(
            state.lang === 'en' ? "Please log in before initiating SOS" : "يرجى تسجيل الدخول أولاً قبل تفعيل الاستغاثة",
            "error"
        );
        return;
    }
    const sosType = document.getElementById('sos-type').value;
    const sosNotes = document.getElementById('sos-notes').value.trim() || "No notes provided.";
    
    // Locate coordinate variables
    let lat = 24.7136;
    let lng = 46.6753; // fallbacks
    let battery = 100;
    let speed = 0;
    let heading = 0;
    let region = "Riyadh";
    // 1. Gather coordinates from active trip or default user profile sync
    if (state.activeTrip) {
        // If simulated signal was lost, the server only has the LAST SYNCED coordinates in database.
        // We simulate sending the SOS: if there's cellular loss, satellite distress takes the last coordinate.
        lat = state.activeTrip.currentLat;
        lng = state.activeTrip.currentLng;
        battery = state.activeTrip.battery;
        speed = state.activeTrip.speed;
        heading = state.activeTrip.heading;
        region = state.activeTrip.region;
    } else if (state.currentUser.lastSyncedTrip) {
        lat = state.currentUser.lastSyncedTrip.lat;
        lng = state.currentUser.lastSyncedTrip.lng;
        battery = state.currentUser.lastSyncedTrip.battery;
        speed = state.currentUser.lastSyncedTrip.speed;
        heading = state.currentUser.lastSyncedTrip.heading;
        region = state.currentUser.lastSyncedTrip.region;
    }
    const newCaseId = `2026-CD-${Math.floor(1000 + Math.random() * 9000)}`;
    // Build emergency incident object
    const newIncident = {
        id: newCaseId,
        name: state.currentUser.name,
        nationalId: state.currentUser.nationalId,
        phone: state.currentUser.phone,
        region: region,
        emergencyType: sosType,
        medicalInfo: state.currentUser.medicalConditions,
        allergies: state.currentUser.allergies,
        vehicleInfo: `${state.currentUser.vehicleType} (${state.currentUser.vehiclePlate})`,
        battery: battery,
        lastLocation: { lat, lng },
        lastUpdate: new Date(),
        speed: speed,
        heading: heading,
        terrainCoefficient: region === 'Asir' ? 1.7 : region === 'Nafud' ? 1.4 : 1.1,
        priorityScore: 0, // calculated below
        status: "REPORTED",
        assignedTeam: null,
        assignedOfficer: null,
        eta: null,
        notes: sosNotes,
        timeline: [
            { time: new Date().toLocaleTimeString().substring(0, 5), event_en: "Emergency SOS Broadcast activated.", event_ar: "تم تنشيط نداء الاستغاثة المفتوح." }
        ]
    };
    // Calculate AI priority index
    newIncident.priorityScore = calculateAIPriority(newIncident);
    // Save into operations list
    state.incidents.unshift(newIncident);
    // Display SOS status tracker HUD
    document.getElementById('sos-case-number').textContent = `CASE #${newCaseId}`;
    document.getElementById('sos-status-hud').classList.remove('hidden');
    // Trigger visual step state reset
    const stepRep = document.getElementById('step-reported');
    const stepDisp = document.getElementById('step-dispatched');
    const stepRes = document.getElementById('step-rescued');
    stepRep.className = "step completed";
    stepDisp.className = "step";
    stepRes.className = "step";
    document.getElementById('sos-feedback-msg-text').innerHTML = `
        <span data-en="SOS Sent. Operations command calculates your location using last synced coordinates. Civil Defense dispatch is mobilizing."
              data-ar="تم إرسال الاستغاثة. تقوم غرفة العمليات بحساب موقعك التقديري بناء على آخر إحداثية. يجري إعداد فرقة الإنقاذ.">
            SOS Sent. Operations command calculates your location using last synced coordinates. Civil Defense dispatch is mobilizing.
        </span>
    `;
    applyTranslations();
    showToast(
        state.lang === 'en' ? "🚨 SOS Broadcast Active! Coordinates synced with command center." 
                           : "🚨 تم إطلاق الاستغاثة الطارئة بنجاح ومزامنة إحداثياتك.",
        "error"
    );
    // Trigger user history update
    if (!state.currentUser.history) state.currentUser.history = [];
    state.currentUser.history.unshift({
        id: newCaseId,
        destination: "Emergency SOS Triggered",
        region: region,
        status: "ACTIVE",
        date: new Date().toLocaleDateString(),
        details: `${sosType}`
    });
    renderUserHistory();
    // Auto-advance simulation after 8 seconds (to dispatch team automatically for demonstration)
    setTimeout(() => {
        const incident = state.incidents.find(i => i.id === newCaseId);
        if (incident && incident.status === "REPORTED") {
            incident.status = "DISPATCHED";
            incident.assignedTeam = state.teams.find(t => t.region === region)?.name || "Central Operations Wing";
            incident.assignedOfficer = state.officers[Math.floor(Math.random() * state.officers.length)];
            incident.eta = "18 Min";
            incident.timeline.push({
                time: new Date().toLocaleTimeString().substring(0, 5),
                event_en: "Civil defense rescue helicopter dispatched.",
                event_ar: "انطلاق مروحية الدفاع المدني للإنقاذ."
            });
            // Update user HUD if still on SOS page
            if (document.getElementById('panel-sos').classList.contains('active')) {
                stepDisp.className = "step completed dispatched";
                document.getElementById('sos-feedback-msg-text').innerHTML = `
                    <span data-en="Dispatched: ${incident.assignedTeam} is enroute. ETA: ${incident.eta}."
                          data-ar="تم التحرك: فريق ${incident.assignedTeam} في طريقه إليك. الوقت المتوقع: ${incident.eta}.">
                        Dispatched: ${incident.assignedTeam} is enroute. ETA: ${incident.eta}.
                    </span>
                `;
                applyTranslations();
                showToast(
                    state.lang === 'en' ? "🚁 Rescue crew dispatched to your calculated sector!" 
                                       : "🚁 انطلقت فرق الإنقاذ باتجاه موقعك التقديري المحسوب!",
                    "warning"
                );
            }
        }
    }, 12000);
}
// ==========================================================================
// 9. MISSING PERSON REGISTRY REGISTRATION & LOOKUP
// ==========================================================================
function lookupMissingPerson() {
    const lookupId = document.getElementById('missing-id').value.trim();
    
    if (!lookupId.match(/^[12]\d{9}$/)) {
        showToast(
            state.lang === 'en' ? "Please enter a valid 10-digit National ID starting with 1 or 2" 
                               : "يرجى إدخال رقم هوية وطنية صحيح مكون من 10 أرقام ويبدأ بـ 1 أو 2",
            "error"
        );
        return;
    }
    const matchedUser = state.users.find(u => u.nationalId === lookupId);
    const profileCard = document.getElementById('missing-profile-card');
    const failCard = document.getElementById('missing-lookup-fail');
    if (matchedUser && matchedUser.lastSyncedTrip) {
        failCard.classList.add('hidden');
        profileCard.classList.remove('hidden');
        // Populate match details
        document.getElementById('m-found-name').textContent = matchedUser.name;
        document.getElementById('m-found-phone').textContent = matchedUser.phone;
        document.getElementById('m-found-blood').textContent = matchedUser.bloodType;
        document.getElementById('m-found-trip').textContent = matchedUser.lastSyncedTrip.destination;
        document.getElementById('m-found-gps').textContent = `${matchedUser.lastSyncedTrip.lat.toFixed(4)}, ${matchedUser.lastSyncedTrip.lng.toFixed(4)}`;
        
        // Calculate dynamic relative hours ago string
        const diffHrs = Math.max(1, Math.round((Date.now() - matchedUser.lastSyncedTrip.timestamp.getTime()) / (60 * 60 * 1000)));
        document.getElementById('m-found-time').textContent = state.lang === 'en' ? `${diffHrs} hours ago` : `قبل ${diffHrs} ساعة`;
        showToast(
            state.lang === 'en' ? "✓ Latest coordinates retrieved from platform registry." 
                               : "✓ تم العثور على إحداثيات المشترك بنجاح.",
            "success"
        );
    } else {
        profileCard.classList.add('hidden');
        failCard.classList.remove('hidden');
        showToast(
            state.lang === 'en' ? "National ID has no active synced trip records." 
                               : "لم يتم العثور على رحلات نشطة مسجلة بهذه الهوية الوطنية.",
            "warning"
        );
    }
}
function handleMissingReport(event) {
    event.preventDefault();
    
    const lookupId = document.getElementById('missing-id').value.trim();
    const relation = document.getElementById('missing-relation').value;
    const notes = document.getElementById('missing-notes').value.trim();
    // Check if profile was found
    const matchedUser = state.users.find(u => u.nationalId === lookupId);
    let lat = 24.7136;
    let lng = 46.6753; // default center Fallback
    let name = `Missing Citizen (ID: ${lookupId})`;
    let phone = "N/A";
    let medical = "None";
    let blood = "Unknown";
    let battery = 50;
    let speed = 0;
    let heading = 0;
    let region = "Riyadh";
    if (matchedUser && matchedUser.lastSyncedTrip) {
        name = matchedUser.name;
        phone = matchedUser.phone;
        medical = matchedUser.medicalConditions;
        blood = matchedUser.bloodType;
        lat = matchedUser.lastSyncedTrip.lat;
        lng = matchedUser.lastSyncedTrip.lng;
        battery = matchedUser.lastSyncedTrip.battery;
        speed = matchedUser.lastSyncedTrip.speed;
        heading = matchedUser.lastSyncedTrip.heading;
        region = matchedUser.lastSyncedTrip.region;
    }
    const newCaseId = `2026-CD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newIncident = {
        id: newCaseId,
        name: name,
        nationalId: lookupId,
        phone: phone,
        region: region,
        emergencyType: "Missing Person Search",
        medicalInfo: medical,
        allergies: matchedUser ? matchedUser.allergies : "Unknown",
        vehicleInfo: matchedUser ? `${matchedUser.vehicleType} (${matchedUser.vehiclePlate})` : "Manual Entry details",
        battery: battery,
        lastLocation: { lat, lng },
        lastUpdate: matchedUser ? matchedUser.lastSyncedTrip.timestamp : new Date(Date.now() - 3.5 * 60 * 60 * 1000), // 3.5 hrs ago default
        speed: speed,
        heading: heading,
        terrainCoefficient: region === 'Asir' ? 1.7 : region === 'Nafud' ? 1.4 : 1.1,
        priorityScore: 0,
        status: "REPORTED",
        assignedTeam: null,
        assignedOfficer: null,
        eta: null,
        notes: `Reported by ${state.currentUser ? state.currentUser.name : 'Citizen'} (Relationship: ${relation}). Notes: ${notes}`,
        timeline: [
            { time: new Date().toLocaleTimeString().substring(0, 5), event_en: `Missing person report filed by ${relation}.`, event_ar: `تسجيل بلاغ مفقود من قبل القرابة: ${relation}.` },
            { time: new Date().toLocaleTimeString().substring(0, 5), event_en: "AI Search polygons generated using latest telemetry sync.", event_ar: "نظام تحديد النطاق التنبؤي يرسم نطاق البحث الأرجح." }
        ]
    };
    newIncident.priorityScore = calculateAIPriority(newIncident);
    state.incidents.unshift(newIncident);
    showToast(
        state.lang === 'en' ? "✓ Missing person rescue dispatch logged. Civil Defense command notified." 
                           : "✓ تم تقديم بلاغ الإنقاذ بنجاح وجارٍ التقييم في العمليات.",
        "success"
    );
    // Reset Form & HUD
    document.getElementById('form-missing-person').reset();
    document.getElementById('missing-profile-card').classList.add('hidden');
    document.getElementById('missing-lookup-fail').classList.add('hidden');
    
    closeUserPanel();
}
// ==========================================================================
// 10. AI PRIORITY SCORE ENGINE
// ==========================================================================
function calculateAIPriority(incident) {
    let score = 20; // Base baseline score
    // 1. Critical low battery scoring (+25 points)
    if (incident.battery <= 15) {
        score += 25;
    } else if (incident.battery <= 50) {
        score += 12;
    }
    // 2. Time passed since last sync telemetry check (+20 points)
    const elapsedHrs = (Date.now() - new Date(incident.lastUpdate).getTime()) / (60 * 60 * 1000);
    if (elapsedHrs >= 4) {
        score += 20;
    } else if (elapsedHrs >= 1.5) {
        score += 10;
    }
    // 3. Chronic illness hazard weighting (+15 points)
    if (incident.medicalInfo && incident.medicalInfo.toLowerCase() !== 'none' && incident.medicalInfo.toLowerCase() !== 'unknown') {
        score += 15;
    }
    // 4. Region or scenario hazard (Flash flood wadis or extreme heat) (+20 points)
    if (incident.emergencyType.includes('Flood') || incident.emergencyType.includes('Dehydration')) {
        score += 20;
    } else if (incident.emergencyType.includes('Mountain')) {
        score += 10;
    }
    // 5. Age vulnerability mock check (derived from National ID birth century markers - optional demo weighting)
    // If national ID indicates older citizen (e.g. starting with 10... first few numbers)
    if (incident.nationalId.startsWith("102") || incident.nationalId.startsWith("101")) {
        score += 8; // senior citizen bump
    }
    return Math.min(100, score);
}
// ==========================================================================
// 11. USER HISTORY RENDERING
// ==========================================================================
function renderUserHistory() {
    const listContainer = document.getElementById('user-history-list');
    
    if (!state.currentUser) {
        listContainer.innerHTML = `<p class="text-center font-size-12 color-muted">No records available</p>`;
        return;
    }
    // Insert fallback mock histories if empty
    if (!state.currentUser.history) {
        state.currentUser.history = [
            { id: "TRIP-8274", destination: "Thumamah National Park", region: "Riyadh", status: "SAFE", date: "2026-06-18", details: "4x4 SUV • 2 Companions" },
            { id: "TRIP-1294", destination: "Wadi Hanifah Valleys", region: "Riyadh", status: "SAFE", date: "2026-05-12", details: "Hiking • 0 Companions" }
        ];
    }
    listContainer.innerHTML = '';
    
    state.currentUser.history.forEach(item => {
        const card = document.createElement('div');
        card.className = "history-card";
        
        let statusBadge = '';
        if (item.status === 'SAFE') {
            statusBadge = `<span class="badge-status safe" data-en="Completed" data-ar="مكتملة بسلام">Completed</span>`;
        } else if (item.status === 'ACTIVE') {
            statusBadge = `<span class="badge-status active" data-en="Active SOS" data-ar="استغاثة نشطة">Active SOS</span>`;
        } else {
            statusBadge = `<span class="badge-status closed" data-en="Closed" data-ar="مغلقة">Closed</span>`;
        }
        card.innerHTML = `
            <div class="history-card-header">
                <strong>${item.destination}</strong>
                ${statusBadge}
            </div>
            <div class="history-details">
                <span><strong>${state.lang === 'en' ? 'Region' : 'المنطقة'}:</strong> ${item.region}</span>
                <span><strong>${state.lang === 'en' ? 'Date' : 'التاريخ'}:</strong> ${item.date}</span>
                <span><strong>${state.lang === 'en' ? 'Details' : 'التفاصيل'}:</strong> ${item.details}</span>
                <span><strong>${state.lang === 'en' ? 'Reference Code' : 'رقم المرجعية'}:</strong> ${item.id}</span>
            </div>
        `;
        listContainer.appendChild(card);
    });
    applyTranslations();
}
function syncUserHUD() {
    if (state.currentUser) {
        document.getElementById('user-display-name').textContent = state.currentUser.name;
        document.getElementById('user-display-id').textContent = `ID: ${state.currentUser.nationalId}`;
    }
}
// ==========================================================================
// 12. SURVIVAL GUIDE CATEGORY SWITCHER
// ==========================================================================
function switchGuide(category) {
    document.querySelectorAll('.guide-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.guide-content-box').forEach(box => box.classList.remove('active'));
    // Highlight selected button
    event.target.classList.add('active');
    
    const targetBox = document.getElementById(`guide-${category}`);
    if (targetBox) {
        targetBox.classList.add('active');
    }
}
function downloadMapSector(btn) {
    btn.disabled = true;
    btn.textContent = state.lang === 'en' ? "Downloading..." : "يجري الحفظ...";
    
    setTimeout(() => {
        btn.textContent = state.lang === 'en' ? "✓ Saved" : "✓ تم الحفظ";
        btn.className = "btn btn-primary btn-sm";
        showToast(
            state.lang === 'en' ? "Topographic maps successfully cached for offline rescue navigation." 
                               : "تم حفظ الخرائط الجغرافية محلياً لاستخدامها في المناطق النائية بدون تغطية.",
            "success"
        );
    }, 2000);
}
// ==========================================================================
// 13. RESCUE OPERATIONS DASHBOARD CODE (DARK COMMAND CENTER)
// ==========================================================================
function filterIncidents(level) {
    state.opsFilter = level;
    
    // Toggle active filter button style
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    
    if (level === 'ALL') document.getElementById('filter-all').classList.add('active');
    else if (level === 'CRITICAL') document.getElementById('filter-critical').classList.add('active');
    else if (level === 'HIGH') document.getElementById('filter-high').classList.add('active');
    else if (level === 'MEDIUM') document.getElementById('filter-medium').classList.add('active');
    renderIncidentsList();
}
function renderIncidentsList() {
    const listContainer = document.getElementById('incident-list-container');
    listContainer.innerHTML = '';
    // Filter logic
    const filtered = state.incidents.filter(inc => {
        if (state.opsFilter === 'ALL') return true;
        if (state.opsFilter === 'CRITICAL') return inc.priorityScore >= 75;
        if (state.opsFilter === 'HIGH') return inc.priorityScore >= 50 && inc.priorityScore < 75;
        if (state.opsFilter === 'MEDIUM') return inc.priorityScore >= 30 && inc.priorityScore < 50;
        return true;
    });
    // Update active stats totals dynamically
    document.getElementById('stat-active-cases').textContent = state.incidents.filter(i => i.status !== 'CLOSED' && i.status !== 'RESCUED').length;
    document.getElementById('stat-dispatched-teams').textContent = state.incidents.filter(i => i.status === 'DISPATCHED').length;
    document.getElementById('stat-rescued-today').textContent = state.incidents.filter(i => i.status === 'RESCUED').length + 8; // base mock + 8
    if (filtered.length === 0) {
        listContainer.innerHTML = `<p class="text-center font-size-11 padding-top color-muted" style="padding: 20px;">No incidents matching filter</p>`;
        return;
    }
    filtered.forEach(inc => {
        const card = document.createElement('div');
        
        let priorityClass = 'p-low';
        let priorityText = state.lang === 'en' ? 'Low' : 'منخفضة';
        
        if (inc.priorityScore >= 75) {
            priorityClass = 'p-critical';
            priorityText = state.lang === 'en' ? 'Critical' : 'حرجة جداً';
        } else if (inc.priorityScore >= 50) {
            priorityClass = 'p-high';
            priorityText = state.lang === 'en' ? 'High' : 'عالية';
        } else if (inc.priorityScore >= 30) {
            priorityClass = 'p-medium';
            priorityText = state.lang === 'en' ? 'Medium' : 'متوسطة';
        }
        const activeClass = state.selectedIncidentId === inc.id ? 'active' : '';
        card.className = `incident-card ${priorityClass} ${activeClass}`;
        card.onclick = () => selectIncident(inc.id);
        // Simple relative hours elapsed computation
        const elapsedHrs = (Date.now() - new Date(inc.lastUpdate).getTime()) / (60 * 60 * 1000);
        let timeStr = '';
        if (elapsedHrs < 1) {
            const mins = Math.max(1, Math.round(elapsedHrs * 60));
            timeStr = state.lang === 'en' ? `${mins}m ago` : `قبل ${mins} د`;
        } else {
            timeStr = state.lang === 'en' ? `${Math.round(elapsedHrs)}h ago` : `قبل ${Math.round(elapsedHrs)} س`;
        }
        // Translate status tag
        let statusText = inc.status;
        if (state.lang === 'ar') {
            if (inc.status === 'REPORTED') statusText = 'بلاغ جديد';
            else if (inc.status === 'DISPATCHED') statusText = 'تم الانطلاق';
            else if (inc.status === 'ON-SITE') statusText = 'في الموقع';
            else if (inc.status === 'RESCUED') statusText = 'تم الإنقاذ';
            else if (inc.status === 'CLOSED') statusText = 'مغلق';
        }
        card.innerHTML = `
            <div class="card-top">
                <span class="case-id">CASE #${inc.id}</span>
                <span class="case-priority ${priorityClass.replace('p-', '')}">${priorityText} (${inc.priorityScore}%)</span>
            </div>
            <div class="card-title">${inc.name}</div>
            <div class="card-meta-row">
                <span>${inc.emergencyType}</span>
                <strong>${statusText}</strong>
            </div>
            <div class="card-meta-row" style="font-size: 9.5px; opacity:0.8;">
                <span>${state.lang === 'en' ? 'Region' : 'المنطقة'}: ${inc.region}</span>
                <span>${timeStr}</span>
            </div>
        `;
        listContainer.appendChild(card);
    });
    // Update map markers when incidents list renders
    updateMapMarkers();
}
function selectIncident(id) {
    state.selectedIncidentId = id;
    
    // Refresh sidebar classes
    document.querySelectorAll('.incident-card').forEach(card => {
        card.classList.remove('active');
    });
    
    renderIncidentsList();
    renderIncidentDetails();
    focusMapOnIncident(id);
}
function renderIncidentDetails() {
    const detailPanel = document.getElementById('ops-incident-detail-panel');
    
    if (!state.selectedIncidentId) {
        detailPanel.innerHTML = `
            <div class="panel-empty-state dark-version">
                <div class="command-shield">🛡️</div>
                <h4 data-en="No Case Selected" data-ar="لا توجد حالة محددة">No Case Selected</h4>
                <p data-en="Select an incident from the queue to manage rescue dispatches and view telemetry estimates." data-ar="اختر بلاغاً من القائمة لمتابعة تقدم أعمال الإنقاذ واستعراض التقديرات التنبؤية.">Select an incident to view details.</p>
            </div>
        `;
        applyTranslations();
        return;
    }
    const inc = state.incidents.find(i => i.id === state.selectedIncidentId);
    if (!inc) return;
    // AI score badge color class helper
    let scoreColorClass = 'h-low';
    if (inc.priorityScore >= 75) scoreColorClass = ''; // critical red default
    else if (inc.priorityScore >= 50) scoreColorClass = 'h-high';
    else if (inc.priorityScore >= 30) scoreColorClass = 'h-medium';
    else scoreColorClass = 'h-low';
    // Calculate dynamic offline elapsed hours
    const elapsedHrs = (Date.now() - new Date(inc.lastUpdate).getTime()) / (60 * 60 * 1000);
    const hrsVal = elapsedHrs.toFixed(1);
    // Compute estimated predictive search coordinates values
    // Search Radius calculations: (Terrain Coefficient * speed * time)
    const estRadiusKms = (inc.speed > 0) ? (inc.terrainCoefficient * inc.speed * elapsedHrs).toFixed(1) : (inc.terrainCoefficient * 5 * elapsedHrs).toFixed(1); // fallback 5km/h walking uncertainty
    
    // Estimate heading direction text representation
    let headingText = "Static (Stranded)";
    if (inc.speed > 0) {
        if (inc.heading >= 337 || inc.heading < 22) headingText = state.lang === 'en' ? "North (N)" : "الشمال";
        else if (inc.heading >= 22 && inc.heading < 67) headingText = state.lang === 'en' ? "North-East (NE)" : "الشمال الشرقي";
        else if (inc.heading >= 67 && inc.heading < 112) headingText = state.lang === 'en' ? "East (E)" : "الشرق";
        else if (inc.heading >= 112 && inc.heading < 157) headingText = state.lang === 'en' ? "South-East (SE)" : "الجنوب الشرقي";
        else if (inc.heading >= 157 && inc.heading < 202) headingText = state.lang === 'en' ? "South (S)" : "الجنوب";
        else if (inc.heading >= 202 && inc.heading < 247) headingText = state.lang === 'en' ? "South-West (SW)" : "الجنوب الغربي";
        else if (inc.heading >= 247 && inc.heading < 292) headingText = state.lang === 'en' ? "West (W)" : "الغرب";
        else if (inc.heading >= 292 && inc.heading < 337) headingText = state.lang === 'en' ? "North-West (NW)" : "الشمال الغربي";
    }
    // Build timeline items list HTML
    let timelineHTML = '';
    inc.timeline.forEach(t => {
        const desc = state.lang === 'en' ? t.event_en : t.event_ar;
        timelineHTML += `
            <div class="timeline-item">
                <div class="t-bullet active"></div>
                <div class="t-content">
                    <div class="t-time">${t.time}</div>
                    <div style="font-weight:600;">${desc}</div>
                </div>
            </div>
        `;
    });
    // Nearest team dynamic selection logic
    const matchedTeams = state.teams.filter(t => t.region === inc.region);
    const recommendedTeam = matchedTeams.length > 0 ? matchedTeams[0].name : "Riyadh Central Operations Team";
    // Setup Officers select dropdown
    let officerOptions = `<option value="" disabled selected>${state.lang === 'en' ? 'Select Commander' : 'اختر القائد الميداني'}</option>`;
    state.officers.forEach(off => {
        officerOptions += `<option value="${off}" ${inc.assignedOfficer === off ? 'selected' : ''}>${off}</option>`;
    });
    // Translate UI variables inside detail panel
    const l_case = state.lang === 'en' ? 'CASE PROFILE' : 'ملف الحالة الطارئة';
    const l_citizen = state.lang === 'en' ? 'Citizen Details' : 'بيانات المواطن';
    const l_name = state.lang === 'en' ? 'Name:' : 'الاسم:';
    const l_nid = state.lang === 'en' ? 'National ID:' : 'رقم الهوية:';
    const l_phone = state.lang === 'en' ? 'Phone:' : 'الجوال:';
    const l_medical = state.lang === 'en' ? 'Medical / Blood:' : 'الملف الطبي / الفصيلة:';
    const l_vehicle = state.lang === 'en' ? 'Vehicle Info:' : 'معلومات المركبة:';
    const l_notes = state.lang === 'en' ? 'Emergency Notes' : 'تفاصيل البلاغ';
    
    const l_ai_score = state.lang === 'en' ? 'AI Priority Scorecard' : 'تقييم الأولوية بالذكاء الاصطناعي';
    const l_telemetry = state.lang === 'en' ? 'Latest Telemetry (Offline Mode)' : 'بيانات الاتصال الأخيرة (الوضع غير المتصل)';
    const l_last_confirmed = state.lang === 'en' ? 'Last Confirmed GPS:' : 'آخر إحداثيات مسجلة:';
    const l_offline_time = state.lang === 'en' ? 'Elapsed Offline Time:' : 'زمن انقطاع التغطية:';
    const l_last_speed = state.lang === 'en' ? 'Last Known Speed:' : 'السرعة الأخيرة:';
    const l_direction = state.lang === 'en' ? 'Direction Vector:' : 'شعاع الحركة والاتجاه:';
    const l_est_radius = state.lang === 'en' ? 'Est. Search Radius:' : 'نطاق البحث التقديري:';
    const l_dispatch = state.lang === 'en' ? 'Operations Dispatch Control' : 'غرفة التوجيه وتوزيع فرق الإنقاذ';
    const l_nearest = state.lang === 'en' ? 'Nearest Rescue Base:' : 'أقرب مركز إنقاذ:';
    const l_dispatch_btn = state.lang === 'en' ? 'DISPATCH TEAM HELI' : 'توجيه فرقة الإنقاذ الجوي';
    detailPanel.innerHTML = `
        <div class="ops-profile-header">
            <div class="top-meta">
                <span class="case-id">CASE #${inc.id}</span>
                <span class="badge-gold">${inc.region} Region</span>
            </div>
            <h3>${l_case}</h3>
        </div>
        <div class="ops-grid">
            <!-- 1. Patient Profile -->
            <div class="ops-block">
                <div class="ops-block-title">${l_citizen}</div>
                <div class="ops-info-list">
                    <div><span>${l_name}</span> <strong>${inc.name}</strong></div>
                    <div><span>${l_nid}</span> <strong>${inc.nationalId}</strong></div>
                    <div><span>${l_phone}</span> <strong>${inc.phone}</strong></div>
                    <div><span>${l_medical}</span> <strong>${inc.medicalInfo} (${inc.allergies !== 'None' ? 'Allergies' : 'No Allergies'})</strong></div>
                    <div><span>${l_vehicle}</span> <strong>${inc.vehicleInfo}</strong></div>
                </div>
            </div>
            <!-- 2. AI Priority Widget -->
            <div class="ops-block">
                <div class="ops-block-title">${l_ai_score}</div>
                <div class="ai-score-hud">
                    <div class="score-circle ${scoreColorClass}">${inc.priorityScore}%</div>
                    <div class="score-breakdown-details">
                        <div>• Battery level: ${inc.battery}%</div>
                        <div>• Elapsed hours: ${hrsVal} hrs</div>
                        <div>• Terrain index: coeff ${inc.terrainCoefficient}</div>
                        <div>• Risk code: Heavy ${inc.emergencyType.split(' ')[0]} risk</div>
                    </div>
                </div>
            </div>
            <!-- 3. Telemetry Predictions Search area -->
            <div class="ops-block">
                <div class="ops-block-title">${l_telemetry}</div>
                <div class="ops-info-list">
                    <div><span>${l_last_confirmed}</span> <strong>${inc.lastLocation.lat.toFixed(5)}, ${inc.lastLocation.lng.toFixed(5)}</strong></div>
                    <div><span>${l_offline_time}</span> <strong>${hrsVal} Hours</strong></div>
                    <div><span>${l_last_speed}</span> <strong>${inc.speed} km/h</strong></div>
                    <div><span>${l_direction}</span> <strong>N ${inc.heading}° (${headingText})</strong></div>
                    <div style="border-top:1px dashed var(--ops-border); padding-top:4px; margin-top:4px;">
                        <span>${l_est_radius}</span> 
                        <strong style="color:var(--saudi-mint); font-size:13px;">~ ${estRadiusKms} Kilometers</strong>
                    </div>
                </div>
            </div>
            <!-- 4. Dispatch Operations -->
            <div class="ops-block">
                <div class="ops-block-title">${l_dispatch}</div>
                <div class="ops-info-list">
                    <div><span>${l_nearest}</span> <strong style="color:var(--saudi-gold);">${recommendedTeam}</strong></div>
                </div>
                
                ${inc.status === 'REPORTED' ? `
                    <div class="dispatch-controls">
                        <div class="form-group">
                            <label style="color:var(--ops-text-muted);">${state.lang === 'en' ? 'Assign Commander' : 'تعيين القائد الميداني'}</label>
                            <select id="dispatch-officer">${officerOptions}</select>
                        </div>
                        <button onclick="dispatchTeam('${inc.id}', '${recommendedTeam}')" class="btn btn-secondary btn-block btn-sm">
                            🚁 ${l_dispatch_btn}
                        </button>
                    </div>
                ` : `
                    <div style="margin-top:12px; font-size:12px;">
                        <div><strong>${state.lang === 'en' ? 'Assigned Team' : 'الفرقة المكلفة'}:</strong> ${inc.assignedTeam}</div>
                        <div><strong>${state.lang === 'en' ? 'Assigned Officer' : 'القائد الميداني'}:</strong> ${inc.assignedOfficer}</div>
                        <div><strong>${state.lang === 'en' ? 'Estimated Arrival' : 'الوقت المتوقع للوصول'}:</strong> ${inc.eta}</div>
                        
                        <div class="dispatch-controls" style="border-top:1px dashed var(--ops-border); margin-top:10px; padding-top:10px;">
                            <div class="form-group">
                                <label style="color:var(--ops-text-muted);">${state.lang === 'en' ? 'Update Case Status' : 'تحديث حالة البلاغ'}</label>
                                <select id="update-status-select" onchange="updateCaseStatus('${inc.id}', this.value)">
                                    <option value="DISPATCHED" ${inc.status === 'DISPATCHED' ? 'selected' : ''}>Dispatched (انطلاق)</option>
                                    <option value="ON-SITE" ${inc.status === 'ON-SITE' ? 'selected' : ''}>On-Site (في الموقع)</option>
                                    <option value="RESCUED" ${inc.status === 'RESCUED' ? 'selected' : ''}>Rescued (تم الإنقاذ)</option>
                                    <option value="CLOSED" ${inc.status === 'CLOSED' ? 'selected' : ''}>Close Case (إغلاق البلاغ)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `}
            </div>
            <!-- 5. Case Notes -->
            <div class="ops-block">
                <div class="ops-block-title">${l_notes}</div>
                <p style="font-size:12px; line-height:1.4; color:var(--ops-text-secondary);">${inc.notes}</p>
            </div>
            <!-- 6. Operational Log Timeline -->
            <div class="ops-block">
                <div class="ops-block-title">${state.lang === 'en' ? 'Operational Incident Timeline' : 'سجل حركة البلاغ والإنقاذ'}</div>
                <div class="timeline-list">
                    ${timelineHTML}
                </div>
            </div>
        </div>
    `;
}
function dispatchTeam(caseId, teamName) {
    const officerSelect = document.getElementById('dispatch-officer');
    const officerName = officerSelect.value;
    if (!officerName) {
        showToast(
            state.lang === 'en' ? "Please assign a field commander before dispatching" 
                               : "يرجى اختيار القائد الميداني قبل توجيه فرقة الإنقاذ",
            "warning"
        );
        return;
    }
    const inc = state.incidents.find(i => i.id === caseId);
    if (inc) {
        inc.status = "DISPATCHED";
        inc.assignedTeam = teamName;
        inc.assignedOfficer = officerName;
        inc.eta = "22 Min";
        
        const timestamp = new Date().toLocaleTimeString().substring(0, 5);
        inc.timeline.push({
            time: timestamp,
            event_en: `Rescue squad ${teamName} dispatched under Capt. ${officerName.replace(/^(Capt\.|Lt\.|Maj\.)\s*/, '')}.`,
            event_ar: `انطلاق فرقة إنقاذ ${teamName} تحت قيادة القائد الميداني ${officerName}.`
        });
        showToast(
            state.lang === 'en' ? `Rescue team dispatched. ETA ${inc.eta}` 
                               : `تم إطلاق فرقة الإنقاذ الميدانية. الوصول التقديري خلال ${inc.eta}`,
            "success"
        );
        renderIncidentsList();
        renderIncidentDetails();
        updateMapMarkers(); // draw route / targets
    }
}
function updateCaseStatus(caseId, newStatus) {
    const inc = state.incidents.find(i => i.id === caseId);
    if (inc) {
        inc.status = newStatus;
        const timestamp = new Date().toLocaleTimeString().substring(0, 5);
        
        let logEn = `Incident status updated to ${newStatus}.`;
        let logAr = `تم تعديل حالة البلاغ الميداني إلى ${newStatus}.`;
        
        if (newStatus === 'ON-SITE') {
            logEn = "Rescue forces reached calculated coordinates zone. Commencing ground sweeps.";
            logAr = "وصلت قوات الإنقاذ للموقع الجغرافي المحدد. بدء المسح الميداني البري.";
            inc.eta = "On-site";
        } else if (newStatus === 'RESCUED') {
            logEn = "Citizen located. Vital signs stable. Medical evacuations completed.";
            logAr = "تم العثور على المواطن بنجاح. المؤشرات الحيوية مستقرة وجارٍ النقل الطبي.";
            inc.eta = "Rescued";
            
            // If the logged in user is the target, resolve their status
            if (state.currentUser && state.currentUser.nationalId === inc.nationalId) {
                if (state.activeTrip) endTripSimulation();
                
                const userSosHUD = document.getElementById('sos-status-hud');
                if (userSosHUD && !userSosHUD.classList.contains('hidden')) {
                    document.getElementById('step-rescued').className = "step completed rescued-state";
                    document.getElementById('sos-feedback-msg-text').innerHTML = `
                        <span data-en="✓ Citizen found! Rescue operation completed successfully."
                              data-ar="✓ تم العثور على المواطن! تم إنجاز عملية الإنقاذ بنجاح.">
                            ✓ Citizen found! Rescue operation completed successfully.
                        </span>
                    `;
                    applyTranslations();
                }
            }
        } else if (newStatus === 'CLOSED') {
            logEn = "Case closed by Command Center control.";
            logAr = "تم إغلاق ملف البلاغ بالكامل بقرار من غرفة العمليات.";
        }
        inc.timeline.push({ time: timestamp, event_en: logEn, event_ar: logAr });
        
        showToast(
            state.lang === 'en' ? `Incident status updated to: ${newStatus}` 
                               : `تم تحديث حالة المعالجة إلى: ${newStatus}`,
            "success"
        );
        
        renderIncidentsList();
        renderIncidentDetails();
    }
}
// ==========================================================================
// 14. INTERACTIVE MAP ENGINE (LEAFLET.JS CDNs)
// ==========================================================================
function initRescueMap() {
    if (mapInstance) return; // Map already loaded
    // Initialize Leaflet Map centering Riyadh, Saudi Arabia
    mapInstance = L.map('rescue-map', {
        zoomControl: true,
        attributionControl: false
    }).setView([24.7136, 46.6753], 6);
    // Apply CartoDB Dark Matter tile layers to look premium/futuristic command center
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(mapInstance);
    // Setup map groups to overlay layers clean
    mapMarkersGroup = L.layerGroup().addTo(mapInstance);
    predictiveCirclesGroup = L.layerGroup().addTo(mapInstance);
}
function updateMapMarkers() {
    if (!mapInstance || !mapMarkersGroup) return;
    // Clear previous markers
    mapMarkersGroup.clearLayers();
    state.incidents.forEach(inc => {
        // Decide color based on priority
        let color = '#10b981'; // low green
        if (inc.priorityScore >= 75) color = '#ef4444'; // critical red
        else if (inc.priorityScore >= 50) color = '#f97316'; // orange high
        else if (inc.priorityScore >= 30) color = '#eab308'; // yellow medium
        // Custom circle div icon representation
        const customIcon = L.divIcon({
            html: `<div style="background-color:${color}; width: 14px; height: 14px; border-radius:50%; border: 2.5px solid #fff; box-shadow: 0 0 10px ${color};"></div>`,
            className: 'custom-map-pin',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
        const marker = L.marker([inc.lastLocation.lat, inc.lastLocation.lng], { icon: customIcon })
            .bindTooltip(`<b>CASE #${inc.id}</b><br>${inc.name}<br>${inc.emergencyType}`, { direction: 'top' })
            .on('click', () => {
                selectIncident(inc.id);
            });
        
        mapMarkersGroup.addLayer(marker);
    });
}
function focusMapOnIncident(id) {
    if (!mapInstance) return;
    
    const inc = state.incidents.find(i => i.id === id);
    if (!inc) return;
    // Pan map to incident coordinates center
    mapInstance.setView([inc.lastLocation.lat, inc.lastLocation.lng], 9);
    // Remove previous predicted search shape layers
    predictiveCirclesGroup.clearLayers();
    if (searchVectorLine) {
        mapInstance.removeLayer(searchVectorLine);
        searchVectorLine = null;
    }
    // 1. Math calculation for Search Prediction vectors
    // elapsed time (hours)
    const elapsedHrs = (Date.now() - new Date(inc.lastUpdate).getTime()) / (60 * 60 * 1000);
    
    // Draw heading vector line only if there was motion (speed > 0)
    if (inc.speed > 0 && elapsedHrs > 0) {
        // Calculate offset displacement along the direction vector
        // 1 deg latitude = 111 km. 1 deg longitude = 111 * cos(lat)
        const estDistKms = inc.speed * elapsedHrs;
        const latOffset = (estDistKms * Math.cos(inc.heading * Math.PI / 180)) / 111;
        const lngOffset = (estDistKms * Math.sin(inc.heading * Math.PI / 180)) / (111 * Math.cos(inc.lastLocation.lat * Math.PI / 180));
        const predictedCenterLat = inc.lastLocation.lat + latOffset;
        const predictedCenterLng = inc.lastLocation.lng + lngOffset;
        // Draw predicted search area rings relative to elapsed offline time
        // Radius in meters: coeff * speed * hours * 1000
        const baseRadiusMeters = inc.terrainCoefficient * inc.speed * elapsedHrs * 1000;
        
        // Define radii for confidence zones
        const r92 = baseRadiusMeters * 0.7; // core
        const r75 = baseRadiusMeters * 1.3; // expanded
        const r50 = baseRadiusMeters * 2.2; // outer limit
        // Draw circles centered on the PREDICTED OFFSET coordinate
        // 92% Core Area (Red)
        const circle92 = L.circle([predictedCenterLat, predictedCenterLng], {
            radius: r92,
            color: '#ef4444',
            weight: 2,
            dashArray: '4, 4',
            fillColor: '#ef4444',
            fillOpacity: 0.12
        });
        
        // 75% Expanded (Orange)
        const circle75 = L.circle([predictedCenterLat, predictedCenterLng], {
            radius: r75,
            color: '#f97316',
            weight: 1.5,
            dashArray: '5, 5',
            fillColor: '#f97316',
            fillOpacity: 0.08
        });
        // 50% Outer Search Limit (Yellow)
        const circle50 = L.circle([predictedCenterLat, predictedCenterLng], {
            radius: r50,
            color: '#eab308',
            weight: 1.5,
            dashArray: '6, 6',
            fillColor: '#eab308',
            fillOpacity: 0.04
        });
        // Draw search direction vector line connecting last coordinates to predicted center
        searchVectorLine = L.polyline([
            [inc.lastLocation.lat, inc.lastLocation.lng],
            [predictedCenterLat, predictedCenterLng]
        ], {
            color: '#00e676',
            weight: 2.5,
            dashArray: '8, 8',
            opacity: 0.85
        }).addTo(mapInstance);
        predictiveCirclesGroup.addLayer(circle92);
        predictiveCirclesGroup.addLayer(circle75);
        predictiveCirclesGroup.addLayer(circle50);
        
        // Fit map bounds to contain the outer search circle
        mapInstance.fitBounds(circle50.getBounds());
    } else {
        // Stranded / Static incident search zones (drawn around last known coordinate)
        const radiusM = (inc.terrainCoefficient * 5 * Math.max(0.5, elapsedHrs)) * 1000; // default 5km/h walking drift
        
        const circle92 = L.circle([inc.lastLocation.lat, inc.lastLocation.lng], {
            radius: radiusM * 0.5,
            color: '#ef4444',
            weight: 2,
            dashArray: '4, 4',
            fillColor: '#ef4444',
            fillOpacity: 0.12
        });
        
        const circle50 = L.circle([inc.lastLocation.lat, inc.lastLocation.lng], {
            radius: radiusM * 1.5,
            color: '#eab308',
            weight: 1.5,
            dashArray: '6, 6',
            fillColor: '#eab308',
            fillOpacity: 0.04
        });
        predictiveCirclesGroup.addLayer(circle92);
        predictiveCirclesGroup.addLayer(circle50);
        
        mapInstance.fitBounds(circle50.getBounds());
    }
}
// ==========================================================================
// 15. WINDOW INITIALIZATION LOADING BINDING
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    // 1. Load persisted users list if exists
    const persistedUsers = localStorage.getItem('madad_users');
    if (persistedUsers) {
        state.users = JSON.parse(persistedUsers);
    }
    
    // 2. Load language settings
    const savedLang = localStorage.getItem('madad_lang') || 'en';
    state.lang = savedLang;
    
    const htmlNode = document.documentElement;
    const btnLang = document.getElementById('btn-lang');
    if (state.lang === 'ar') {
        htmlNode.setAttribute('dir', 'rtl');
        htmlNode.setAttribute('lang', 'ar');
        if (btnLang) btnLang.textContent = 'English';
    } else {
        htmlNode.setAttribute('dir', 'ltr');
        htmlNode.setAttribute('lang', 'en');
        if (btnLang) btnLang.textContent = 'العربية';
    }
    applyTranslations();
    // 3. Check for active login session
    const sessionUser = localStorage.getItem('madad_user');
    if (sessionUser) {
        state.currentUser = JSON.parse(sessionUser);
        if (state.currentUser.role === 'officer') {
            switchView('ops-dash');
        } else {
            switchView('user-dash');
        }
    } else {
        switchView('landing');
    }
});
function toggleTripPlateRequirement() {
    const transport = document.getElementById('trip-transport');
    const plateGroup = document.getElementById('trip-plate-group');
    const plateInput = document.getElementById('trip-plate');

    if (!transport || !plateGroup || !plateInput) return;

    const needsPlate = transport.value === '4x4 SUV' || transport.value === 'Quad / ATV';

    plateGroup.style.display = needsPlate ? 'block' : 'none';
    plateInput.required = needsPlate;

    if (!needsPlate) {
        plateInput.value = '';
    }
}
