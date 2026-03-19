const { Pool } = require("pg");
require("dotenv").config();

const isLocalHost =
  !process.env.DATABASE_URL &&
  (!process.env.DB_HOST || process.env.DB_HOST === "localhost" || process.env.DB_HOST === "127.0.0.1");

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: isLocalHost ? false : { rejectUnauthorized: false },
    });

pool.on("error", (err) => {
  console.error("Error inesperado en PostgreSQL:", err.message);
});

module.exports = pool;