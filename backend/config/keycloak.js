require('dotenv').config();
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require('jwks-rsa');

const API_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'banking-api';

// KEYCLOAK issuers for dev (local or docker)
const issuerLocal = process.env.KEYCLOAK_ISSUER_LOCAL || 'http://localhost:8080/realms/banking';
const issuerDocker = process.env.KEYCLOAK_ISSUER_DOCKER || 'http://keycloak:8080/realms/banking';

// JWKS URI for host docker
const jwksUri = process.env.KEYCLOAK_JWKS_URI
  || 'http://host.docker.internal:8080/realms/banking/protocol/openid-connect/certs';

const checkJwt = jwt({
  // for public key
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: jwksUri
  }),
  audience: API_CLIENT_ID,
  issuer: [issuerLocal, issuerDocker],
  algorithms: ['RS256']
  // express-jwt payload with req.auth
});

module.exports = { checkJwt };