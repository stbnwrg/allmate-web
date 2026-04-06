const { Client } = require("pg");

async function run() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Falta DATABASE_URL en las variables de entorno.");
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log("Conectado a PostgreSQL.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(120) NOT NULL,
        phone VARCHAR(40),
        subject VARCHAR(160),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabla contact_messages verificada/creada.");

    await client.query(`
      UPDATE site_settings
      SET setting_value = 'contacto@allmate.cl',
          updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = 'site_email';
    `);
    console.log("site_email actualizado si ya existía.");

    await client.query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_group, is_public)
      SELECT 'site_email', 'contacto@allmate.cl', 'contacto', TRUE
      WHERE NOT EXISTS (
        SELECT 1
        FROM site_settings
        WHERE setting_key = 'site_email'
      );
    `);
    console.log("site_email insertado si no existía.");

    const oldEmails = await client.query(`
      SELECT setting_key, setting_value
      FROM site_settings
      WHERE setting_value ILIKE '%esterospa.cl%';
    `);

    if (oldEmails.rows.length > 0) {
      console.log("Aún quedan valores antiguos con esterospa.cl:");
      console.table(oldEmails.rows);
    } else {
      console.log("No quedan valores con esterospa.cl en site_settings.");
    }

    const currentEmail = await client.query(`
      SELECT setting_key, setting_value
      FROM site_settings
      WHERE setting_key = 'site_email';
    `);

    console.log("Valor actual de site_email:");
    console.table(currentEmail.rows);

    console.log("Fix de BD completado.");
  } catch (err) {
    console.error("Error ejecutando fix:", err);
    process.exitCode = 1;
  } finally {
    await client.end();
    console.log("Conexión cerrada.");
  }
}

run();