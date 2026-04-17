const API_BASE_URL = 'http://localhost:5000/api';

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const studentForm = document.getElementById('studentForm');
const studentsTableBody = document.getElementById('studentsTableBody');
const usersTableBody = document.getElementById('usersTableBody');
const searchInput = document.getElementById('searchInput');
const totalStudentsEl = document.getElementById('totalStudents');
const levelStatsEl = document.getElementById('levelStats');
const currentUserEl = document.getElementById('currentUser');
const resetBtn = document.getElementById('resetBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userForm = document.getElementById('userForm');
const adminUsersNav = document.getElementById('adminUsersNav');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const pageSections = Array.from(document.querySelectorAll('.page-section'));

const tokenKey = 'school_token';
const userKey = 'school_user';
const themeKey = 'school_theme';

const getToken = () => localStorage.getItem(tokenKey);

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);

  if (themeToggleBtn) {
    const icon = theme === 'dark' ? '☀️' : '🌙';
    const label = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    themeToggleBtn.innerHTML = `<span class="theme-icon" aria-hidden="true">${icon}</span><span class="theme-text">${label}</span>`;
    themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }
};

const initializeTheme = () => {
  const savedTheme = localStorage.getItem(themeKey);
  if (savedTheme === 'dark' || savedTheme === 'light') {
    applyTheme(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
};

const api = async (path, options = {}) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || 'Unexpected API error.';
    throw new Error(message);
  }

  return data;
};

const showLoggedIn = () => {
  loginSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');

  const user = JSON.parse(localStorage.getItem(userKey) || '{}');
  currentUserEl.textContent = `Signed in as ${user.username || 'Unknown'} (${user.role || 'N/A'})`;

  if (user.role === 'Admin') {
    adminUsersNav.classList.remove('hidden');
  } else {
    adminUsersNav.classList.add('hidden');
  }
};

const showLoggedOut = () => {
  dashboardSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
  loginForm.reset();
};

const switchSection = (targetId) => {
  pageSections.forEach((section) => {
    if (section.id === targetId) {
      section.classList.remove('hidden');
      section.classList.add('active-section');
    } else {
      section.classList.add('hidden');
      section.classList.remove('active-section');
    }
  });

  navLinks.forEach((button) => {
    if (button.dataset.sectionTarget === targetId) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
};

const resetStudentForm = () => {
  studentForm.reset();
  document.getElementById('studentId').value = '';
  document.getElementById('submitBtn').textContent = 'Save Student';
};

const formatDate = (rawDate) => {
  if (!rawDate) return '-';
  return new Date(rawDate).toISOString().split('T')[0];
};

const renderStudents = (students) => {
  studentsTableBody.innerHTML = '';

  if (!students.length) {
    studentsTableBody.innerHTML = '<tr><td colspan="7">No students found.</td></tr>';
    return;
  }

  students.forEach((student) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${student.first_name} ${student.last_name}</td>
      <td>${formatDate(student.date_birthday)}</td>
      <td>${student.sexe}</td>
      <td>${student.class_info.class_name}</td>
      <td>${student.class_info.level}</td>
      <td>${formatDate(student.registration_date)}</td>
      <td class="actions">
        <button data-action="edit" data-id="${student._id}">Edit</button>
        <button class="danger" data-action="delete" data-id="${student._id}">Delete</button>
      </td>
    `;

    tr.querySelector('[data-action="edit"]').addEventListener('click', () => fillFormForEdit(student));
    tr.querySelector('[data-action="delete"]').addEventListener('click', () => deleteStudent(student._id));

    studentsTableBody.appendChild(tr);
  });
};

const renderUsers = (users) => {
  if (!usersTableBody) {
    return;
  }

  usersTableBody.innerHTML = '';

  if (!users.length) {
    usersTableBody.innerHTML = '<tr><td colspan="3">No users found.</td></tr>';
    return;
  }

  users.forEach((user) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.username}</td>
      <td>${user.role}</td>
      <td>${formatDate(user.createdAt)}</td>
    `;
    usersTableBody.appendChild(tr);
  });
};

const loadStudents = async () => {
  const search = searchInput.value.trim();
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const students = await api(`/students${query}`);
  renderStudents(students);
};

const loadStats = async () => {
  const stats = await api('/dashboard/stats');
  totalStudentsEl.textContent = stats.totalStudents;

  levelStatsEl.innerHTML = '';
  if (!stats.byLevel.length) {
    levelStatsEl.innerHTML = '<li>No data yet.</li>';
    return;
  }

  stats.byLevel.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.level}: ${item.count}`;
    levelStatsEl.appendChild(li);
  });
};

const loadUsers = async () => {
  const currentUser = JSON.parse(localStorage.getItem(userKey) || '{}');
  if (currentUser.role !== 'Admin') {
    return;
  }

  const users = await api('/users');
  renderUsers(users);
};

const fillFormForEdit = (student) => {
  document.getElementById('studentId').value = student._id;
  document.getElementById('first_name').value = student.first_name;
  document.getElementById('last_name').value = student.last_name;
  document.getElementById('date_birthday').value = formatDate(student.date_birthday);
  document.getElementById('sexe').value = student.sexe;
  document.getElementById('class_name').value = student.class_info.class_name;
  document.getElementById('level').value = student.class_info.level;
  document.getElementById('submitBtn').textContent = 'Update Student';
};

const deleteStudent = async (id) => {
  if (!confirm('Are you sure you want to delete this student?')) {
    return;
  }

  try {
    await api(`/students/${id}`, { method: 'DELETE' });
    await Promise.all([loadStudents(), loadStats()]);
  } catch (error) {
    alert(error.message);
  }
};

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const result = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    localStorage.setItem(tokenKey, result.token);
    localStorage.setItem(userKey, JSON.stringify(result.user));

    showLoggedIn();
    await Promise.all([loadStudents(), loadStats()]);
  } catch (error) {
    alert(error.message);
  }
});

studentForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('studentId').value;
  const payload = {
    first_name: document.getElementById('first_name').value.trim(),
    last_name: document.getElementById('last_name').value.trim(),
    date_birthday: document.getElementById('date_birthday').value,
    sexe: document.getElementById('sexe').value,
    class_info: {
      class_name: document.getElementById('class_name').value.trim(),
      level: document.getElementById('level').value,
    },
  };

  try {
    await api(id ? `/students/${id}` : '/students', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });

    resetStudentForm();
    await Promise.all([loadStudents(), loadStats()]);
  } catch (error) {
    alert(error.message);
  }
});

if (userForm) {
  userForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      username: document.getElementById('new_username').value.trim(),
      password: document.getElementById('new_password').value,
      role: document.getElementById('new_role').value,
    };

    try {
      await api('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      userForm.reset();
      await loadUsers();
      alert('User created successfully.');
    } catch (error) {
      alert(error.message);
    }
  });
}

searchInput.addEventListener('input', async () => {
  try {
    await loadStudents();
  } catch (error) {
    alert(error.message);
  }
});

resetBtn.addEventListener('click', resetStudentForm);

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  showLoggedOut();
});

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    applyTheme(nextTheme);
    localStorage.setItem(themeKey, nextTheme);
  });
}

navLinks.forEach((button) => {
  button.addEventListener('click', async () => {
    const target = button.dataset.sectionTarget;
    switchSection(target);

    if (target === 'overviewSection') {
      await loadStats();
    }

    if (target === 'studentsSection') {
      await loadStudents();
    }

    if (target === 'usersSection') {
      await loadUsers();
    }
  });
});

const initialize = async () => {
  initializeTheme();

  if (!getToken()) {
    showLoggedOut();
    return;
  }

  try {
    showLoggedIn();
    switchSection('overviewSection');
    const currentUser = JSON.parse(localStorage.getItem(userKey) || '{}');
    const jobs = [loadStudents(), loadStats()];

    if (currentUser.role === 'Admin') {
      jobs.push(loadUsers());
    }

    await Promise.all(jobs);
  } catch (error) {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    showLoggedOut();
    alert('Session expired. Please login again.');
  }
};

initialize();
