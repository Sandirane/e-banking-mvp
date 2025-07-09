const axios = require('axios');
const qs = require('qs');

async function getAdminToken() {
  const response = await axios.post(
    `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_ADMIN_REALM}/protocol/openid-connect/token`,
    qs.stringify({
      grant_type: 'password',
      client_id: process.env.KEYCLOAK_ADMIN_CLIENT,
      username: process.env.KEYCLOAK_ADMIN_USERNAME,
      password: process.env.KEYCLOAK_ADMIN_PASSWORD
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
  return response.data.access_token;
}

async function listUsers() {
  const token = await getAdminToken();
 
  const response = await axios.get(
    `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
  }));
}

module.exports = { listUsers };
