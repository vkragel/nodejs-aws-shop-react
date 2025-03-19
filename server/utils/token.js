const parseToken = (token) => {
  if (!token) return null;

  const [type, encodedCredentials] = token.split(" ");

  if (!type || !encodedCredentials) {
    return null;
  }

  return { type, encodedCredentials };
};

const decodeToken = (credentials) => {
  if (!credentials) return null;

  const decode = (str) => Buffer.from(str, "base64").toString("utf-8");

  try {
    const decodedCredentials = decode(credentials);
    const [login, password] = decodedCredentials.split(":");
    return login && password ? { login, password } : null;
  } catch {
    return null;
  }
};

module.exports = {
  parseToken,
  decodeToken,
};
