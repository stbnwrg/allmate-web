require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function main() {
  const sqlFile = process.argv[2];

  if (!sqlFile) {
    console.error("Uso: node scripts/run-sql.js <ruta-del-archivo-sql>");
    process.exit(1);
  }

  const fullPath = path.resolve(sqlFile);
  const sql = fs.readFileSync(fullPath, "utf8");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Conectado a PostgreSQL");
    await client.query(sql);
    console.log(`SQL ejecutado correctamente: ${sqlFile}`);
  } catch (error) {
    console.error("Error ejecutando SQL:");
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();