const pool = require('../../config/db');

function mapPageRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    is_active: row.is_active,
    sort_order: row.sort_order,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    seo_canonical: row.seo_canonical,
    seo_robots: row.seo_robots,
    schema_type: row.schema_type,
    schema_json: row.schema_json || {},
  };
}

function mapSectionRow(row) {
  return {
    id: row.id,
    page_id: row.page_id,
    section_key: row.section_key,
    name: row.name,
    title: row.title,
    subtitle: row.subtitle,
    content: row.content,
    layout_type: row.layout_type,
    is_active: row.is_active,
    sort_order: row.sort_order,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    seo_canonical: row.seo_canonical,
    seo_robots: row.seo_robots,
    schema_type: row.schema_type,
    schema_json: row.schema_json || {},
  };
}

function mapItemRow(row) {
  return {
    id: row.id,
    section_id: row.section_id,
    item_key: row.item_key,
    title: row.title,
    subtitle: row.subtitle,
    content: row.content,
    button_label: row.button_label,
    button_url: row.button_url,
    tag: row.tag,
    price: row.price,
    old_price: row.old_price,
    badge: row.badge,
    image_url: row.image_url,
    image_alt: row.image_alt,
    icon: row.icon,
    extra_json: row.extra_json || {},
    is_active: row.is_active,
    sort_order: row.sort_order,
  };
}

async function getPublicSettings() {
  const { rows } = await pool.query(
    `SELECT setting_key, setting_value, setting_group
     FROM site_settings
     WHERE is_public = TRUE
     ORDER BY setting_group, setting_key`
  );

  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.setting_group]) grouped[row.setting_group] = {};
    grouped[row.setting_group][row.setting_key] = row.setting_value;
  }
  return grouped;
}

async function getAllSettings() {
  const { rows } = await pool.query(`SELECT * FROM site_settings ORDER BY setting_group, setting_key`);
  return rows;
}

async function getPages() {
  const { rows } = await pool.query(`SELECT * FROM cms_pages ORDER BY sort_order, id`);
  return rows.map(mapPageRow);
}

async function getPageBySlug(slug) {
  const { rows } = await pool.query(`SELECT * FROM cms_pages WHERE slug = $1 LIMIT 1`, [slug]);
  if (!rows[0]) return null;
  return mapPageRow(rows[0]);
}

async function getSectionsByPageSlug(pageSlug, includeInactive = false) {
  const { rows } = await pool.query(
    `SELECT s.*
     FROM cms_sections s
     JOIN cms_pages p ON p.id = s.page_id
     WHERE p.slug = $1
       ${includeInactive ? '' : 'AND s.is_active = TRUE'}
     ORDER BY s.sort_order, s.id`,
    [pageSlug]
  );
  return rows.map(mapSectionRow);
}

async function getSectionById(id) {
  const { rows } = await pool.query(`SELECT * FROM cms_sections WHERE id = $1 LIMIT 1`, [id]);
  return rows[0] ? mapSectionRow(rows[0]) : null;
}

async function getItemsBySectionId(sectionId, includeInactive = false) {
  const { rows } = await pool.query(
    `SELECT * FROM cms_items
     WHERE section_id = $1
       ${includeInactive ? '' : 'AND is_active = TRUE'}
     ORDER BY sort_order, id`,
    [sectionId]
  );
  return rows.map(mapItemRow);
}

async function getItemById(id) {
  const { rows } = await pool.query(`SELECT * FROM cms_items WHERE id = $1 LIMIT 1`, [id]);
  return rows[0] ? mapItemRow(rows[0]) : null;
}

async function getPagePayload(pageSlug) {
  const page = await getPageBySlug(pageSlug);
  if (!page) return null;
  const sections = await getSectionsByPageSlug(pageSlug, false);
  const sectionsWithItems = [];
  for (const section of sections) {
    const items = await getItemsBySectionId(section.id, false);
    sectionsWithItems.push({ ...section, items });
  }
  const settings = await getPublicSettings();
  return { page, sections: sectionsWithItems, settings };
}

async function upsertPage(payload) {
  const {
    id,
    slug,
    name,
    description,
    is_active = true,
    sort_order = 100,
    seo_title,
    seo_description,
    seo_canonical,
    seo_robots,
    schema_type,
  } = payload;

  if (id) {
    const { rows } = await pool.query(
      `UPDATE cms_pages
       SET slug = $2,
           name = $3,
           description = $4,
           is_active = $5,
           sort_order = $6,
           seo_title = $7,
           seo_description = $8,
           seo_canonical = $9,
           seo_robots = $10,
           schema_type = $11,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, slug, name, description, is_active, sort_order, seo_title, seo_description, seo_canonical, seo_robots, schema_type]
    );
    return mapPageRow(rows[0]);
  }

  const { rows } = await pool.query(
    `INSERT INTO cms_pages (slug, name, description, is_active, sort_order, seo_title, seo_description, seo_canonical, seo_robots, schema_type)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [slug, name, description, is_active, sort_order, seo_title, seo_description, seo_canonical, seo_robots, schema_type]
  );
  return mapPageRow(rows[0]);
}

async function upsertSection(payload) {
  const {
    id,
    page_id,
    section_key,
    name,
    title,
    subtitle,
    content,
    layout_type = 'default',
    is_active = true,
    sort_order = 100,
    seo_title,
    seo_description,
    seo_canonical,
    seo_robots,
    schema_type,
  } = payload;

  if (id) {
    const { rows } = await pool.query(
      `UPDATE cms_sections
       SET name = $2,
           title = $3,
           subtitle = $4,
           content = $5,
           layout_type = $6,
           is_active = $7,
           sort_order = $8,
           seo_title = $9,
           seo_description = $10,
           seo_canonical = $11,
           seo_robots = $12,
           schema_type = $13,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, name, title, subtitle, content, layout_type, is_active, sort_order, seo_title, seo_description, seo_canonical, seo_robots, schema_type]
    );
    return mapSectionRow(rows[0]);
  }

  const { rows } = await pool.query(
    `INSERT INTO cms_sections (page_id, section_key, name, title, subtitle, content, layout_type, is_active, sort_order, seo_title, seo_description, seo_canonical, seo_robots, schema_type)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [page_id, section_key, name, title, subtitle, content, layout_type, is_active, sort_order, seo_title, seo_description, seo_canonical, seo_robots, schema_type]
  );
  return mapSectionRow(rows[0]);
}

async function upsertItem(payload) {
  const {
    id,
    section_id,
    item_key,
    title,
    subtitle,
    content,
    button_label,
    button_url,
    tag,
    price,
    old_price,
    badge,
    image_url,
    image_alt,
    icon,
    extra_json = {},
    is_active = true,
    sort_order = 100,
  } = payload;

  if (id) {
    const { rows } = await pool.query(
      `UPDATE cms_items
       SET item_key = $2,
           title = $3,
           subtitle = $4,
           content = $5,
           button_label = $6,
           button_url = $7,
           tag = $8,
           price = $9,
           old_price = $10,
           badge = $11,
           image_url = $12,
           image_alt = $13,
           icon = $14,
           extra_json = $15,
           is_active = $16,
           sort_order = $17,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, item_key, title, subtitle, content, button_label, button_url, tag, price, old_price, badge, image_url, image_alt, icon, extra_json, is_active, sort_order]
    );
    return mapItemRow(rows[0]);
  }

  const { rows } = await pool.query(
    `INSERT INTO cms_items (section_id, item_key, title, subtitle, content, button_label, button_url, tag, price, old_price, badge, image_url, image_alt, icon, extra_json, is_active, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING *`,
    [section_id, item_key, title, subtitle, content, button_label, button_url, tag, price, old_price, badge, image_url, image_alt, icon, extra_json, is_active, sort_order]
  );
  return mapItemRow(rows[0]);
}

async function toggleItem(id) {
  const { rows } = await pool.query(
    `UPDATE cms_items
     SET is_active = NOT is_active,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return rows[0] ? mapItemRow(rows[0]) : null;
}

async function moveItem(id, direction = 'up') {
  const current = await getItemById(id);
  if (!current) return null;

  const operator = direction === 'down' ? '>' : '<';
  const orderDirection = direction === 'down' ? 'ASC' : 'DESC';
  const { rows } = await pool.query(
    `SELECT * FROM cms_items
     WHERE section_id = $1
       AND sort_order ${operator} $2
     ORDER BY sort_order ${orderDirection}, id ${orderDirection}
     LIMIT 1`,
    [current.section_id, current.sort_order]
  );

  if (!rows[0]) return current;
  const target = rows[0];

  await pool.query('BEGIN');
  try {
    await pool.query(`UPDATE cms_items SET sort_order = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [current.id, target.sort_order]);
    await pool.query(`UPDATE cms_items SET sort_order = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [target.id, current.sort_order]);
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }

  return getItemById(id);
}

async function deleteItem(id) {
  await pool.query(`DELETE FROM cms_items WHERE id = $1`, [id]);
  return true;
}

async function saveMedia({ fileName, fileUrl, fileType, altText, title, folder }) {
  const { rows } = await pool.query(
    `INSERT INTO cms_media (file_name, file_url, file_type, alt_text, title, folder)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [fileName, fileUrl, fileType, altText, title, folder]
  );
  return rows[0];
}

async function upsertSetting(settingKey, value, settingGroup = 'general', isPublic = true) {
  const { rows } = await pool.query(
    `INSERT INTO site_settings (setting_key, setting_value, setting_group, is_public)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (setting_key)
     DO UPDATE SET setting_value = EXCLUDED.setting_value,
                   setting_group = EXCLUDED.setting_group,
                   is_public = EXCLUDED.is_public,
                   updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [settingKey, value, settingGroup, isPublic]
  );
  return rows[0];
}

module.exports = {
  getPages,
  getPageBySlug,
  getSectionsByPageSlug,
  getSectionById,
  getItemsBySectionId,
  getItemById,
  getPagePayload,
  getPublicSettings,
  getAllSettings,
  upsertPage,
  upsertSection,
  upsertItem,
  toggleItem,
  moveItem,
  deleteItem,
  saveMedia,
  upsertSetting,
};
