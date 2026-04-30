CREATE TABLE IF NOT EXISTS parents (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  parent_name VARCHAR(120) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  signup_child_type VARCHAR(10) NOT NULL CHECK (signup_child_type IN ('boy', 'girl')),
  signup_kid_dob DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kids (
  id BIGSERIAL PRIMARY KEY,
  parent_id BIGINT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  kid_name VARCHAR(120) NOT NULL,
  child_type VARCHAR(10) NOT NULL CHECK (child_type IN ('boy', 'girl')),
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_kid_per_parent UNIQUE (parent_id, kid_name, date_of_birth)
);

CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  task_id VARCHAR(40) NOT NULL UNIQUE,
  parent_id BIGINT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  kid_id BIGINT NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  task_type VARCHAR(50) NOT NULL,
  task_title VARCHAR(200) NOT NULL,
  task_description TEXT NOT NULL,
  task_points INT NOT NULL CHECK (task_points >= 0),
  task_status VARCHAR(20) NOT NULL CHECK (task_status IN ('new', 'review', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kids_name_dob ON kids ((LOWER(kid_name)), date_of_birth);
CREATE INDEX IF NOT EXISTS idx_tasks_kid_created ON tasks (kid_id, created_at DESC);
