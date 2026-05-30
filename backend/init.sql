CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS animals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  image TEXT,
  age TEXT,
  sex TEXT,
  description TEXT,
  traits TEXT
);

CREATE TABLE IF NOT EXISTS adoptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  animal_id INTEGER NOT NULL REFERENCES animals(id),
  status TEXT DEFAULT 'W oczekiwaniu',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  time_from TEXT,
  time_to TEXT
);

CREATE TABLE IF NOT EXISTS signups (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  volunteer_id INTEGER NOT NULL REFERENCES users(id),
  note TEXT,
  UNIQUE (task_id, volunteer_id)
);
