const { Pool } = require("pg");
const { getEnv } = require("./env");

const env = getEnv();

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000
});

module.exports = {
  pool
};
