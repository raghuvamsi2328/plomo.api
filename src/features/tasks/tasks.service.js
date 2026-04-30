const { pool } = require("../../config/db");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function generateTaskId() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TASK-${Date.now()}-${random}`;
}

async function createTask({
  parentId,
  parentName,
  mobileNumber,
  kidName,
  taskType,
  taskTitle,
  taskDescription,
  taskPoints,
  taskStatus
}) {
  const parentRes = await pool.query(
    `
    SELECT id
    FROM parents
    WHERE id = $1 AND parent_name = $2 AND mobile_number = $3
    LIMIT 1
    `,
    [parentId, parentName, mobileNumber]
  );

  if (parentRes.rowCount === 0) {
    throw createHttpError(403, "Parent details do not match authenticated user");
  }

  const kidRes = await pool.query(
    `
    SELECT id
    FROM kids
    WHERE parent_id = $1 AND LOWER(kid_name) = LOWER($2)
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [parentId, kidName]
  );

  if (kidRes.rowCount === 0) {
    throw createHttpError(404, "Kid not found for this parent");
  }

  const taskId = generateTaskId();

  const insertRes = await pool.query(
    `
    INSERT INTO tasks (
      task_id,
      parent_id,
      kid_id,
      task_type,
      task_title,
      task_description,
      task_points,
      task_status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING
      task_id,
      task_type,
      task_title,
      task_description,
      task_points,
      task_status,
      created_at
    `,
    [
      taskId,
      parentId,
      kidRes.rows[0].id,
      taskType,
      taskTitle,
      taskDescription,
      taskPoints,
      taskStatus
    ]
  );

  return insertRes.rows[0];
}

async function listTasks({ parentId, parentName, mobileNumber, kidName }) {
  const parentRes = await pool.query(
    `
    SELECT id
    FROM parents
    WHERE id = $1 AND parent_name = $2 AND mobile_number = $3
    LIMIT 1
    `,
    [parentId, parentName, mobileNumber]
  );

  if (parentRes.rowCount === 0) {
    throw createHttpError(403, "Parent details do not match authenticated user");
  }

  const tasksRes = await pool.query(
    `
    SELECT
      t.task_id,
      t.task_type,
      t.task_title,
      t.task_description,
      t.task_points,
      t.task_status,
      t.created_at,
      k.kid_name
    FROM tasks t
    JOIN kids k ON k.id = t.kid_id
    WHERE t.parent_id = $1 AND LOWER(k.kid_name) = LOWER($2)
    ORDER BY t.created_at DESC
    `,
    [parentId, kidName]
  );

  return tasksRes.rows;
}

module.exports = {
  createTask,
  listTasks
};
