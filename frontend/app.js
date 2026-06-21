const API = 'http://localhost:4000';

// sections
const authSection = document.getElementById('auth-section');
const userHeader = document.getElementById('user-header');
const consumerView = document.getElementById('consumer-view');
const companyAdminView = document.getElementById('company-admin-view');
const platformAdminView = document.getElementById('platform-admin-view');

// auth form
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

// profile header fields
const profileEmail = document.getElementById('profile-email');
const profileCompany = document.getElementById('profile-company');
const profileRole = document.getElementById('profile-role');
const profileMembership = document.getElementById('profile-membership');
const profileToken = document.getElementById('profile-token');
const profilePassword = document.getElementById('profile-password');
const saveProfileBtn = document.getElementById('save-profile');
const logoutBtn = document.getElementById('logout');
const profileMsg = document.getElementById('profile-msg');
const runTestDataBtn = document.getElementById('run-test-data');

// consumer
const videosList = document.getElementById('videos-list');
const videosError = document.getElementById('videos-error');

// company admin
const companyUsersTableBody = document.querySelector('#company-users-table tbody');
const companyUsersError = document.getElementById('company-users-error');

// platform admin
const companiesList = document.getElementById('companies-list');
const companiesError = document.getElementById('companies-error');

function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }

function setToken(token){ localStorage.setItem('token', token); }
function getToken(){ return localStorage.getItem('token'); }
function clearToken(){ localStorage.removeItem('token'); }

function escapeHtml(str){ return String(str||'')
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
  .replace(/'/g,'&#039;');
}

async function fetchProfile(){
  const token = getToken();
  if (!token) return showAuth();
  try{
    const res = await fetch(API + '/auth/profile', { headers: { Authorization: 'Bearer ' + token } });
    if (!res.ok) { clearToken(); return showAuth('Sesión inválida. Por favor autentícate.'); }
    const user = await res.json();
    profileEmail.value = user.email || '';
    profileCompany.value = user.company_id || '';
    profileRole.value = user.role || '';
    profileMembership.checked = !!user.membership_active;
    profileToken.value = token;

    // show run-test-data button only for super_admin
    if (user.role === 'super_admin') {
      runTestDataBtn.style.display = 'inline-block';
    } else {
      runTestDataBtn.style.display = 'none';
    }

    // show header and role-specific view
    hide(authSection);
    show(userHeader);
    profileMsg.textContent = '';
    renderRoleView(user.role);
  }catch(e){ console.error(e); showAuth('Error contactando al servidor'); }
}

function showAuth(msg){
  hide(userHeader); hide(consumerView); hide(companyAdminView); hide(platformAdminView);
  show(authSection);
  loginError.textContent = msg || '';
}

async function renderRoleView(role){
  hide(consumerView); hide(companyAdminView); hide(platformAdminView);
  if (role === 'consumer') {
    await loadVideos();
    show(consumerView);
  } else if (role === 'company_admin') {
    await loadCompanyUsers();
    show(companyAdminView);
  } else if (role === 'platform_admin' || role === 'super_admin') {
    await loadCompanies();
    show(platformAdminView);
  }
}

loginForm.addEventListener('submit', async (e)=>{
  e.preventDefault(); loginError.textContent='';
  try{
    const res = await fetch(API + '/auth/login', {
      method: 'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
    });
    if (!res.ok) { const err = await res.json().catch(()=>({})); loginError.textContent = err.error || 'Credenciales inválidas'; return; }
    const data = await res.json();
    setToken(data.token);
    await fetchProfile();
  }catch(e){ console.error(e); loginError.textContent = 'Error de red'; }
});

logoutBtn.addEventListener('click', ()=>{ clearToken(); showAuth(); });

saveProfileBtn.addEventListener('click', async ()=>{
  profileMsg.textContent = '';
  const token = getToken();
  if (!token) return showAuth();
  try{
    const body = { email: profileEmail.value };
    if (profilePassword.value) body.password = profilePassword.value;
    const res = await fetch(API + '/auth/profile', { method: 'PUT', headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(body) });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) { profileMsg.textContent = data.error || 'No se pudo guardar perfil'; profileMsg.classList.add('error'); return; }

    if (data.token) {
      // token rotated
      setToken(data.token);
      profileToken.value = data.token;
    }

    profileMsg.textContent = 'Perfil guardado';
    profilePassword.value = '';
    // refresh role view in case membership changed
    await fetchProfile();
  }catch(e){ console.error(e); profileMsg.textContent = 'Error guardando perfil'; }
});

// run test data button handler (super_admin only)
if (runTestDataBtn) {
  runTestDataBtn.addEventListener('click', async ()=>{
    if (!confirm('Esto borrará y recreará la base de datos. ¿Continuar?')) return;
    profileMsg.textContent = 'Ejecutando TEST_DATA_SET.sql...';
    try{
      const res = await fetch(API + '/auth/run-test-data', { method: 'POST', headers: { Authorization: 'Bearer ' + getToken() } });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) { profileMsg.textContent = data.error || 'Error ejecutando script'; profileMsg.classList.add('error'); return; }
      profileMsg.textContent = 'Script ejecutado correctamente. Reinicia sesión para ver los cambios.';
      // after data reset, force logout
      clearToken();
    }catch(e){ console.error(e); profileMsg.textContent = 'Error ejecutando script'; }
  });
}

// consumer: videos
async function loadVideos(){
  videosList.innerHTML = '';
  videosError.textContent = '';
  try{
    const res = await fetch(API + '/videos', { headers: { Authorization: 'Bearer ' + getToken() } });
    if (!res.ok) { videosError.textContent = 'No autorizado o membresía inactiva'; return; }
    const videos = await res.json();
    if (!videos.length) {
      const li = document.createElement('li');
      li.textContent = 'No hay videos';
      videosList.appendChild(li);
    } else {
      videos.forEach(v=>{ const li = document.createElement('li'); li.innerHTML = `<strong>${escapeHtml(v.title)}</strong> - ${escapeHtml(v.description||'')}`; videosList.appendChild(li); });
    }
  }catch(e){ console.error(e); videosError.textContent = 'Error cargando videos'; }
}

// company admin: list company users
async function loadCompanyUsers(){
  companyUsersError.textContent = '';
  companyUsersTableBody.innerHTML = '';
  try{
    const res = await fetch(API + '/admin/users', { headers: { Authorization: 'Bearer ' + getToken() } });
    if (!res.ok) { const err = await res.json().catch(()=>({})); companyUsersError.textContent = err.error || 'No autorizado'; return; }
    const users = await res.json();
    users.forEach(u=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.id}</td>
        <td><input data-id="email-${u.id}" value="${escapeHtml(u.email)}" /></td>
        <td><input type="checkbox" data-id="membership-${u.id}" ${u.membership_active? 'checked':''}></td>
        <td><input data-id="role-${u.id}" value="${escapeHtml(u.role)}" /></td>
        <td>
          <input placeholder="nuevo password" data-id="pass-${u.id}" />
          <button data-id="save-${u.id}">Guardar</button>
        </td>
      `;
      companyUsersTableBody.appendChild(tr);
    });

    // attach events
    companyUsersTableBody.querySelectorAll('[data-id^="save-"]').forEach(b=> b.addEventListener('click', async (e)=>{
      const id = e.target.dataset.id.replace('save-','');
      const email = document.querySelector(`[data-id="email-${id}"]`).value;
      const membership = document.querySelector(`[data-id="membership-${id}"]`).checked;
      const role = document.querySelector(`[data-id="role-${id}"]`).value;
      const password = document.querySelector(`[data-id="pass-${id}"]`).value;

      try{
        const res = await fetch(API + '/admin/users/' + id, { method: 'PUT', headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + getToken() }, body: JSON.stringify({ email, membership_active: membership, role, password }) });
        if (!res.ok) { const err = await res.json().catch(()=>({})); companyUsersError.textContent = err.error || 'No se pudo guardar'; return; }
        await loadCompanyUsers();
      }catch(e){ console.error(e); companyUsersError.textContent = 'Error guardando usuario'; }
    }));

  }catch(e){ console.error(e); companyUsersError.textContent = 'Error cargando usuarios'; }
}

// platform admin: load companies with nested users
async function loadCompanies(){
  companiesError.textContent = '';
  companiesList.innerHTML = '';
  try{
    const res = await fetch(API + '/admin/companies', { headers: { Authorization: 'Bearer ' + getToken() } });
    if (!res.ok) { const err = await res.json().catch(()=>({})); companiesError.textContent = err.error || 'No autorizado'; return; }
    const comps = await res.json();
    comps.forEach(c=>{
      const div = document.createElement('div');
      div.className = 'company';
      div.innerHTML = `<h3>${escapeHtml(c.name)} (${escapeHtml(c.code||'')})</h3>
        <div><strong>Admins:</strong><ul>${c.admins.map(a=>`<li>${escapeHtml(a.email)} (${escapeHtml(a.role)})</li>`).join('')}</ul></div>
        <div><strong>Consumers:</strong><ul>${c.consumers.map(a=>`<li>${escapeHtml(a.email)} ${a.membership_active? '(activo)':''}</li>`).join('')}</ul></div>`;
      companiesList.appendChild(div);
    });
  }catch(e){ console.error(e); companiesError.textContent = 'Error cargando empresas'; }
}

// init
if (getToken()) fetchProfile(); else showAuth();
