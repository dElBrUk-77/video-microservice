const API = 'http://localhost:4000';

const usersTableBody = document.querySelector('#users-table tbody');
const usersError = document.getElementById('users-error');
const tokenInput = document.getElementById('token-input');
const useTokenBtn = document.getElementById('use-token');

function getToken(){
  return localStorage.getItem('token') || tokenInput.value;
}

function escapeHtml(str){
  return String(str||'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

useTokenBtn.addEventListener('click', ()=>{
  localStorage.setItem('token', tokenInput.value);
  loadUsers();
});

async function loadUsers(){
  usersError.textContent = '';
  usersTableBody.innerHTML = '';
  try{
    const res = await fetch(API + '/admin/users', { headers: { Authorization: 'Bearer ' + getToken() } });
    if (!res.ok) {
      const err = await res.json().catch(()=>({}));
      usersError.textContent = err.error || 'No autorizado';
      return;
    }
    const users = await res.json();
    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(u.id)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.company_id || '')}</td>
        <td><input type="checkbox" data-id="${escapeHtml(u.id)}" class="membership" ${u.membership_active? 'checked': ''}></td>
        <td><input data-id="${escapeHtml(u.id)}" class="role" value="${escapeHtml(u.role)}"></td>
        <td>
          <button data-id="${escapeHtml(u.id)}" class="save">Guardar</button>
          <button data-id="${escapeHtml(u.id)}" class="del">Borrar</button>
        </td>
      `;
      usersTableBody.appendChild(tr);
    });

    // attach events
    document.querySelectorAll('.save').forEach(b=>b.addEventListener('click', onSave));
    document.querySelectorAll('.del').forEach(b=>b.addEventListener('click', onDelete));
  }catch(e){
    console.error(e);
    usersError.textContent = 'Error cargando usuarios';
  }
}

async function onSave(e){
  const id = e.target.dataset.id;
  const membership = document.querySelector(`.membership[data-id="${id}"]`).checked;
  const role = document.querySelector(`.role[data-id="${id}"]`).value;

  try{
    const res = await fetch(API + '/admin/users/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
      body: JSON.stringify({ membership_active: membership, role })
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({}));
      usersError.textContent = err.error || 'No se pudo guardar';
      return;
    }
    await loadUsers();
  }catch(e){
    console.error(e);
    usersError.textContent = 'Error salvando usuario';
  }
}

async function onDelete(e){
  if (!confirm('¿Borrar usuario?')) return;
  const id = e.target.dataset.id;
  try{
    const res = await fetch(API + '/admin/users/' + id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + getToken() }
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({}));
      usersError.textContent = err.error || 'No se pudo borrar';
      return;
    }
    await loadUsers();
  }catch(e){
    console.error(e);
    usersError.textContent = 'Error borrando usuario';
  }
}

// init: try token from storage
tokenInput.value = localStorage.getItem('token') || '';
loadUsers();
