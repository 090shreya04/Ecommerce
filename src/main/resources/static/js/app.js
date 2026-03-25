/* =========================================
   INFINITY ADMIN — app.js
   Full SPA: Auth (Login/Register), Dashboard,
   CRUD, Search/Filter, Dark/Light Theme
   ========================================= */

const API = '/api/v1';

// ---- State ----
let token = localStorage.getItem('jwt_token');
let userRole = localStorage.getItem('user_role');
let username = localStorage.getItem('user_name');
let allEmployees = [];
let filteredEmployees = [];
let deleteTargetId = null;
let selectedRole = 'USER';
let currentPage = 'employees'; // 'dashboard' | 'employees'

// ---- DOM Refs ----
const html = document.documentElement;
const toast = document.getElementById('toast');

// ==========================================
//  THEME
// ==========================================
function getTheme() {
    return localStorage.getItem('theme') || 'dark';
}
function applyTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
}
function toggleTheme() {
    applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
}
applyTheme(getTheme()); // Apply on load

document.getElementById('auth-theme-toggle').addEventListener('click', toggleTheme);
document.getElementById('dash-theme-toggle').addEventListener('click', toggleTheme);

// ==========================================
//  TOAST NOTIFICATIONS
// ==========================================
let toastTimer;
function showToast(msg, type = 'success') {
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.className = 'toast', 3200);
}

// ==========================================
//  AUTH TAB SWITCHING
// ==========================================
function switchTab(tab) {
    const loginSection = document.getElementById('login-form-section');
    const registerSection = document.getElementById('register-form-section');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const indicator = document.getElementById('tab-indicator');

    if (tab === 'login') {
        loginSection.classList.add('active');
        registerSection.classList.remove('active');
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        indicator.classList.remove('right');
    } else {
        registerSection.classList.add('active');
        loginSection.classList.remove('active');
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        indicator.classList.add('right');
    }
}

// ==========================================
//  PASSWORD VISIBILITY TOGGLE
// ==========================================
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

// ==========================================
//  PASSWORD STRENGTH METER
// ==========================================
document.getElementById('reg-password').addEventListener('input', function () {
    const val = this.value;
    const fill = document.getElementById('strength-fill');
    const label = document.getElementById('strength-label');
    let strength = 0;
    if (val.length >= 6) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;
    if (val.length >= 12) strength++;

    const levels = [
        { w: '0%', c: 'transparent', l: '' },
        { w: '25%', c: '#ef4444', l: 'Weak' },
        { w: '50%', c: '#f59e0b', l: 'Fair' },
        { w: '75%', c: '#3b82f6', l: 'Good' },
        { w: '90%', c: '#10b981', l: 'Strong' },
        { w: '100%', c: '#10b981', l: 'Very Strong' },
    ];
    const lvl = levels[Math.min(strength, 5)];
    fill.style.width = lvl.w;
    fill.style.background = lvl.c;
    label.textContent = lvl.l;
    label.style.color = lvl.c;
});

// ==========================================
//  ROLE SELECTOR (Register)
// ==========================================
function selectRole(btn) {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedRole = btn.dataset.role;
    document.getElementById('reg-role').value = selectedRole;
}

// ==========================================
//  BUTTON LOADING STATE
// ==========================================
function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    btn.disabled = loading;
    if (text) text.style.opacity = loading ? '0' : '1';
    if (loader) loader.classList.toggle('hidden', !loading);
}

// ==========================================
//  FIELD VALIDATION HELPERS
// ==========================================
function setFieldError(inputId, errId, msg) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (input) input.classList.toggle('error', !!msg);
    if (err) err.textContent = msg || '';
}

// ==========================================
//  PAGE INIT — CHECK SESSION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (token && userRole) {
        showDashboard();
    }
});

// ==========================================
//  LOGIN
// ==========================================
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;

    setFieldError('login-username', 'login-username-err', '');
    setFieldError('login-password', 'login-password-err', '');

    let valid = true;
    if (!u) { setFieldError('login-username', 'login-username-err', 'Username is required'); valid = false; }
    if (!p) { setFieldError('login-password', 'login-password-err', 'Password is required'); valid = false; }
    if (!valid) return;

    setLoading('login-btn', true);
    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        token = data.token;
        userRole = data.role;
        username = u;
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_role', userRole);
        localStorage.setItem('user_name', username);

        showToast(`Welcome back, ${username}! 👋`);
        showDashboard();
    } catch (err) {
        setFieldError('login-password', 'login-password-err', err.message);
        showToast(err.message, 'error');
    } finally {
        setLoading('login-btn', false);
    }
});

// ==========================================
//  REGISTER
// ==========================================
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('reg-username').value.trim();
    const p = document.getElementById('reg-password').value;
    const c = document.getElementById('reg-confirm').value;

    ['reg-username-err', 'reg-password-err', 'reg-confirm-err'].forEach(id => {
        document.getElementById(id).textContent = '';
        document.getElementById(id.replace('-err', '')).classList.remove('error');
    });

    let valid = true;
    if (!u) { setFieldError('reg-username', 'reg-username-err', 'Username is required'); valid = false; }
    if (u.length < 3) { setFieldError('reg-username', 'reg-username-err', 'Min 3 characters'); valid = false; }
    if (!p) { setFieldError('reg-password', 'reg-password-err', 'Password is required'); valid = false; }
    if (p.length < 6) { setFieldError('reg-password', 'reg-password-err', 'Min 6 characters'); valid = false; }
    if (p !== c) { setFieldError('reg-confirm', 'reg-confirm-err', 'Passwords do not match'); valid = false; }
    if (!valid) return;

    setLoading('register-btn', true);
    try {
        const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p, role: selectedRole })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        token = data.token;
        userRole = data.role;
        username = u;
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_role', userRole);
        localStorage.setItem('user_name', username);

        showToast(`Account created! Welcome, ${username} 🎉`);
        showDashboard();
    } catch (err) {
        setFieldError('reg-username', 'reg-username-err', err.message);
        showToast(err.message, 'error');
    } finally {
        setLoading('register-btn', false);
    }
});

// ==========================================
//  SHOW / HIDE PAGES
// ==========================================
function showDashboard() {
    document.getElementById('auth-container').classList.add('hidden');
    const dash = document.getElementById('dashboard-container');
    dash.classList.remove('hidden');

    // Set user info
    document.getElementById('display-username').textContent = username || 'User';
    document.getElementById('display-role').textContent = userRole || 'USER';
    document.getElementById('user-avatar').textContent = (username || 'U').slice(0, 2).toUpperCase();

    // Show Add button for admin only
    const addBtn = document.getElementById('add-employee-btn');
    addBtn.style.display = userRole === 'ADMIN' ? 'inline-flex' : 'none';

    // Navigate to employees page by default
    navigateTo('employees');
}

function showAuth() {
    document.getElementById('dashboard-container').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
    switchTab('login');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

// ==========================================
//  NAVIGATION (Sidebar)
// ==========================================
function navigateTo(page) {
    currentPage = page;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const navEl = document.getElementById(`nav-${page}`);
    if (navEl) navEl.classList.add('active');

    // Update breadcrumb & page title
    const pageTitle = document.getElementById('page-title');
    const breadcrumb = document.querySelector('.breadcrumb');

    if (page === 'dashboard') {
        pageTitle.textContent = 'Dashboard';
        breadcrumb.innerHTML = '<span class="active-crumb">Dashboard</span>';
        // Stats-only view: hide table, show stats
        document.getElementById('stats-grid').style.display = '';
        document.querySelector('.content-card').style.display = 'none';
        document.getElementById('add-employee-btn').style.display = 'none';
        fetchStats();
    } else {
        pageTitle.textContent = 'Employees';
        breadcrumb.innerHTML = '<span>Dashboard</span> <span class="sep">›</span> <span class="active-crumb">Employees</span>';
        document.getElementById('stats-grid').style.display = '';
        document.querySelector('.content-card').style.display = '';
        // Show Add button for admin only
        document.getElementById('add-employee-btn').style.display = userRole === 'ADMIN' ? 'inline-flex' : 'none';
        fetchEmployees();
    }

    closeSidebar();
}

// ==========================================
//  LOGOUT
// ==========================================
document.getElementById('logout-btn').addEventListener('click', () => {
    token = null; userRole = null; username = null;
    allEmployees = []; filteredEmployees = [];
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    showToast('Logged out successfully', 'warn');
    showAuth();
});

// ==========================================
//  SIDEBAR (Mobile)
// ==========================================
function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('open');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
}

// ==========================================
//  FETCH STATS (all authenticated users)
// ==========================================
async function fetchStats() {
    try {
        const res = await fetch(`${API}/employees/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Stats unavailable');
        const stats = await res.json();
        renderStats(stats);
    } catch (err) {
        // Silently fallback
        ['stat-total', 'stat-depts', 'stat-avg', 'stat-newest'].forEach(id => {
            document.getElementById(id).textContent = '—';
        });
    }
}

function renderStats(stats) {
    animateCount('stat-total', stats.totalEmployees);
    animateCount('stat-depts', stats.totalDepartments);

    const avg = stats.avgSalary || 0;
    document.getElementById('stat-avg').textContent = avg > 0
        ? `₹${Math.round(avg).toLocaleString('en-IN')}`
        : '—';

    document.getElementById('stat-newest').textContent = stats.newestHireDate
        ? new Date(stats.newestHireDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';
}

// Smooth counter animation
function animateCount(elId, target) {
    const el = document.getElementById(elId);
    const duration = 800;
    const start = performance.now();
    const startVal = 0;
    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(startVal + (target - startVal) * eased);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ==========================================
//  FETCH EMPLOYEES
// ==========================================
async function fetchEmployees() {
    // Show skeleton while loading
    document.getElementById('employees-tbody').innerHTML = `
        <tr class="skeleton-row"><td colspan="6"><div class="skeleton"></div></td></tr>
        <tr class="skeleton-row"><td colspan="6"><div class="skeleton"></div></td></tr>
        <tr class="skeleton-row"><td colspan="6"><div class="skeleton"></div></td></tr>`;

    // Always fetch stats too (update the cards)
    fetchStats();

    try {
        const res = await fetch(`${API}/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
            token = null;
            localStorage.removeItem('jwt_token');
            showAuth();
            return;
        }
        if (res.status === 403) {
            renderAccessDenied();
            return;
        }
        if (!res.ok) throw new Error('Failed to fetch employees');

        allEmployees = await res.json();
        filteredEmployees = [...allEmployees];
        populateDeptFilter();
        renderEmployees(filteredEmployees);
    } catch (err) {
        showToast(err.message, 'error');
        renderTableError(err.message);
    }
}

function renderAccessDenied() {
    document.getElementById('employees-tbody').innerHTML = `
        <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--danger);">
            <div style="font-size:1.5rem;margin-bottom:8px;">🔒</div>
            Admin access required to view employee data
        </td></tr>`;
}

function renderTableError(msg) {
    document.getElementById('employees-tbody').innerHTML = `
        <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-3);">
            <div style="font-size:1.5rem;margin-bottom:8px;">⚠️</div>
            ${msg || 'Something went wrong'}
        </td></tr>`;
}

// ==========================================
//  DEPARTMENT FILTER
// ==========================================
function populateDeptFilter() {
    const select = document.getElementById('dept-filter');
    const depts = [...new Set(allEmployees.map(e => e.department).filter(Boolean))].sort();
    const current = select.value;
    select.innerHTML = '<option value="">All Departments</option>';
    depts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d; opt.textContent = d;
        if (d === current) opt.selected = true;
        select.appendChild(opt);
    });
}

function filterEmployees() {
    const dept = document.getElementById('dept-filter').value;
    const q = (document.getElementById('search-input').value || '').toLowerCase();
    filteredEmployees = allEmployees.filter(e => {
        const matchDept = !dept || e.department === dept;
        const matchQ = !q || `${e.firstName} ${e.lastName} ${e.email} ${e.position} ${e.department}`.toLowerCase().includes(q);
        return matchDept && matchQ;
    });
    renderEmployees(filteredEmployees);
}

// Live search
document.getElementById('search-input').addEventListener('input', filterEmployees);

// ==========================================
//  RENDER TABLE
// ==========================================
const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f97316','#ec4899','#06b6d4','#f59e0b','#6366f1'];
function avatarColor(name) {
    let h = 0;
    for (let c of (name || '')) h = c.charCodeAt(0) + ((h << 5) - h);
    return COLORS[Math.abs(h) % COLORS.length];
}

function renderEmployees(list) {
    const tbody = document.getElementById('employees-tbody');
    const noData = document.getElementById('no-data');

    if (!list || list.length === 0) {
        tbody.innerHTML = '';
        noData.classList.remove('hidden');
        return;
    }
    noData.classList.add('hidden');

    tbody.innerHTML = list.map(emp => {
        const initials = `${(emp.firstName || '?')[0]}${(emp.lastName || '?')[0]}`.toUpperCase();
        const color = avatarColor(emp.firstName + emp.lastName);
        const salary = emp.salary ? `₹${Number(emp.salary).toLocaleString('en-IN')}` : '—';
        const hireDate = emp.hireDate
            ? new Date(emp.hireDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—';

        const actionBtns = userRole === 'ADMIN' ? `
            <button class="action-btn" onclick="openEditModal(${emp.id})" title="Edit Employee" aria-label="Edit ${emp.firstName}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="action-btn del" onclick="confirmDelete(${emp.id})" title="Delete Employee" aria-label="Delete ${emp.firstName}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
        ` : `<span style="font-size:0.75rem;color:var(--text-3)">View only</span>`;

        return `
        <tr>
            <td>
                <div class="emp-cell">
                    <div class="emp-avatar" style="background:${color}">${initials}</div>
                    <div>
                        <div class="emp-name">${emp.firstName} ${emp.lastName}</div>
                        <div class="emp-email">${emp.email}</div>
                    </div>
                </div>
            </td>
            <td>${emp.position || '—'}</td>
            <td class="hide-sm"><span class="dept-badge">${emp.department || '—'}</span></td>
            <td class="hide-md">${salary}</td>
            <td class="hide-md">${hireDate}</td>
            <td><div class="row-actions">${actionBtns}</div></td>
        </tr>`;
    }).join('');
}

// ==========================================
//  MODAL OPEN/CLOSE
// ==========================================
function openAddModal() {
    document.getElementById('modal-title').textContent = 'Add Employee';
    document.getElementById('modal-subtitle').textContent = 'Fill in the new employee details below';
    document.getElementById('employee-form').reset();
    document.getElementById('emp-id').value = '';
    document.getElementById('employee-modal').classList.remove('hidden');
}

function openEditModal(id) {
    const emp = allEmployees.find(e => e.id === id);
    if (!emp) return;
    document.getElementById('modal-title').textContent = 'Edit Employee';
    document.getElementById('modal-subtitle').textContent = `Editing ${emp.firstName} ${emp.lastName}`;
    document.getElementById('emp-id').value = emp.id;
    document.getElementById('emp-firstname').value = emp.firstName || '';
    document.getElementById('emp-lastname').value = emp.lastName || '';
    document.getElementById('emp-email').value = emp.email || '';
    document.getElementById('emp-position').value = emp.position || '';
    document.getElementById('emp-department').value = emp.department || '';
    document.getElementById('emp-salary').value = emp.salary || '';
    document.getElementById('emp-hiredate').value = emp.hireDate || '';
    document.getElementById('employee-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('employee-modal').classList.add('hidden');
}

// Close on overlay click
document.getElementById('employee-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// ==========================================
//  SAVE EMPLOYEE (Create / Update)
// ==========================================
document.getElementById('employee-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (userRole !== 'ADMIN') { showToast('Admin access required', 'error'); return; }

    const id = document.getElementById('emp-id').value;
    const body = {
        firstName: document.getElementById('emp-firstname').value.trim(),
        lastName: document.getElementById('emp-lastname').value.trim(),
        email: document.getElementById('emp-email').value.trim(),
        position: document.getElementById('emp-position').value.trim(),
        department: document.getElementById('emp-department').value.trim(),
        salary: parseFloat(document.getElementById('emp-salary').value),
        hireDate: document.getElementById('emp-hiredate').value
    };

    const url = id ? `${API}/employees/${id}` : `${API}/employees`;
    const method = id ? 'PUT' : 'POST';

    setLoading('save-btn', true);
    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(id ? 'Update failed' : 'Create failed');
        showToast(id ? `✅ Employee updated successfully` : `✅ Employee added successfully`);
        closeModal();
        fetchEmployees();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        setLoading('save-btn', false);
    }
});

// ==========================================
//  DELETE EMPLOYEE
// ==========================================
function confirmDelete(id) {
    deleteTargetId = id;
    document.getElementById('delete-modal').classList.remove('hidden');
}

document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (!deleteTargetId) return;
    document.getElementById('delete-modal').classList.add('hidden');
    try {
        const res = await fetch(`${API}/employees/${deleteTargetId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Delete failed');
        showToast('🗑️ Employee deleted');
        deleteTargetId = null;
        fetchEmployees();
    } catch (err) {
        showToast(err.message, 'error');
    }
});

document.getElementById('delete-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
});

// ==========================================
//  EXPORT TO CSV
// ==========================================
function formatDateCSV(isoDate) {
    if (!isoDate) return '';
    const parts = isoDate.split('-'); // ["2026", "03", "12"]
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // "12-03-2026"
}

function exportCSV() {
    if (!filteredEmployees.length) { showToast('Nothing to export', 'warn'); return; }
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Position', 'Department', 'Salary', 'Hire Date'];
    const rows = filteredEmployees.map(e => [
        e.id, e.firstName, e.lastName, e.email,
        e.position, e.department, e.salary, formatDateCSV(e.hireDate)
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'employees.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 CSV exported successfully');
}

