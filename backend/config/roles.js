function requireRole(role) {
  return (req, res, next) => {
    const rolesRealm = req.auth?.realm_access?.roles || [];
    const rolesResource = req.auth?.resource_access?.['banking-api']?.roles || [];
    if (rolesRealm.includes(role) || rolesResource.includes(role)) {
      return next();
    }
    return res.status(403).json({ error: 'Accès refusé: rôle manquant' });
  };
}
module.exports = { requireRole };
