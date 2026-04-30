const { pool } = require("../../config/db");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createKidProfile({ parentId, kidName, childType, dateOfBirth }) {
  const existing = await pool.query(
    `
    SELECT id
    FROM kids
    WHERE parent_id = $1 AND LOWER(kid_name) = LOWER($2) AND date_of_birth = $3
    LIMIT 1
    `,
    [parentId, kidName, dateOfBirth]
  );

  if (existing.rowCount > 0) {
    throw createHttpError(409, "Kid profile already exists");
  }

  const insertRes = await pool.query(
    `
    INSERT INTO kids (parent_id, kid_name, child_type, date_of_birth)
    VALUES ($1, $2, $3, $4)
    RETURNING id, parent_id, kid_name, child_type, date_of_birth, created_at
    `,
    [parentId, kidName, childType, dateOfBirth]
  );

  return insertRes.rows[0];
}

module.exports = {
  createKidProfile
};
