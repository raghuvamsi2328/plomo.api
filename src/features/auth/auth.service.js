const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../../config/db");
const { getEnv } = require("../../config/env");

const env = getEnv();

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function signInParent({
  username,
  parentName,
  mobileNumber,
  password,
  childType,
  signupKidDob
}) {
  const duplicateRes = await pool.query(
    `SELECT id FROM parents WHERE username = $1 OR mobile_number = $2 LIMIT 1`,
    [username, mobileNumber]
  );

  if (duplicateRes.rowCount > 0) {
    throw createHttpError(409, "Username or mobile number already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const insertRes = await pool.query(
    `
    INSERT INTO parents (
      username,
      parent_name,
      mobile_number,
      password_hash,
      signup_child_type,
      signup_kid_dob
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, username, parent_name, mobile_number, created_at
    `,
    [
      username,
      parentName,
      mobileNumber,
      passwordHash,
      childType,
      signupKidDob
    ]
  );

  return insertRes.rows[0];
}

async function loginParent({ identifier, password }) {
  const parentRes = await pool.query(
    `
    SELECT id, username, parent_name, mobile_number, password_hash
    FROM parents
    WHERE username = $1 OR mobile_number = $1
    LIMIT 1
    `,
    [identifier]
  );

  if (parentRes.rowCount === 0) {
    throw createHttpError(401, "Invalid credentials");
  }

  const parent = parentRes.rows[0];
  const passwordOk = await bcrypt.compare(password, parent.password_hash);

  if (!passwordOk) {
    throw createHttpError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    {
      parentId: parent.id,
      username: parent.username,
      parentName: parent.parent_name,
      mobileNumber: parent.mobile_number
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    token,
    parent: {
      id: parent.id,
      username: parent.username,
      parentName: parent.parent_name,
      mobileNumber: parent.mobile_number
    }
  };
}

async function kidLogin({ kidName, dateOfBirth }) {
  const kidRes = await pool.query(
    `
    SELECT
      k.id,
      k.kid_name,
      k.child_type,
      k.date_of_birth,
      p.id AS parent_id,
      p.parent_name,
      p.mobile_number
    FROM kids k
    JOIN parents p ON p.id = k.parent_id
    WHERE LOWER(k.kid_name) = LOWER($1) AND k.date_of_birth = $2
    LIMIT 2
    `,
    [kidName, dateOfBirth]
  );

  if (kidRes.rowCount === 0) {
    throw createHttpError(404, "Kid not found");
  }

  if (kidRes.rowCount > 1) {
    throw createHttpError(
      409,
      "Multiple kids found with same name and date of birth"
    );
  }

  return kidRes.rows[0];
}

module.exports = {
  signInParent,
  loginParent,
  kidLogin
};
