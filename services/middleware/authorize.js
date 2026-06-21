const { pool } = require('../db');

// authorize: permite pasar un array de roles permitidos. Roles globales: 'platform_admin' y 'super_admin' se consideran superusuarios.
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    // super roles shortcut
    if (user.role === 'platform_admin' || user.role === 'super_admin') return next();

    if (allowedRoles.includes(user.role)) return next();

    return res.status(403).json({ error: 'No autorizado' });
  };
};

// authorizeUserModification: middleware que permite a superadmins modificar cualquier usuario,
// y a company_admin modificar usuarios solo dentro de su company.
const authorizeUserModification = () => {
  return async (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    // super admins
    if (user.role === 'platform_admin' || user.role === 'super_admin') return next();

    // company_admin can modify within their company
    if (user.role === 'company_admin') {
      // determine target user id from params or body
      const targetId = req.params.id || req.body.id || req.body.userId;
      if (!targetId) return res.status(400).json({ error: 'Missing target user id' });

      try {
        const r = await pool.query('SELECT company_id FROM users WHERE id = $1', [targetId]);
        if (r.rows.length === 0) return res.status(404).json({ error: 'Usuario objetivo no encontrado' });
        const targetCompanyId = r.rows[0].company_id;
        if (targetCompanyId === user.companyId) return next();
        return res.status(403).json({ error: 'No autorizado para modificar usuario de otra empresa' });
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Error en el servidor' });
      }
    }

    return res.status(403).json({ error: 'No autorizado' });
  };
};

module.exports = { authorize, authorizeUserModification };
