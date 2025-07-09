const keycloakService = require('../../services/admin/keycloakService');

exports.getUsers = async (req, res) => {
  try {
    const users = await keycloakService.listUsers();
    res.json(users);
  } catch (err) {
    console.error('Error fetching Keycloak users:', err.response?.data || err);
    res.status(500).json({ error: 'Impossible de récupérer les utilisateurs.' });
  }
};
