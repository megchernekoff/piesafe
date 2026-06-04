-- Run once against your Turso DB:
--   turso db shell <db-name> < schema.sql
-- Or POST /api/setup after first deploy.

CREATE TABLE IF NOT EXISTS profiles (
  user_id              TEXT    PRIMARY KEY,
  display_name         TEXT,
  household_size       INTEGER NOT NULL DEFAULT 2,
  toddler_mode         INTEGER NOT NULL DEFAULT 0,  -- 0|1 boolean
  toddler_age          INTEGER,                      -- age in months
  dislikes             TEXT    NOT NULL DEFAULT '[]', -- JSON string[]
  dietary_restrictions TEXT    NOT NULL DEFAULT '[]', -- JSON string[]
  created_at           TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recipes (
  id            TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id       TEXT    NOT NULL,
  title         TEXT    NOT NULL,
  description   TEXT,
  ingredients   TEXT    NOT NULL DEFAULT '[]', -- JSON {amount,unit,item}[]
  instructions  TEXT    NOT NULL DEFAULT '',
  source_url    TEXT,
  image_url     TEXT,
  tags          TEXT    NOT NULL DEFAULT '[]', -- JSON string[]
  prep_time     INTEGER,                        -- minutes
  cook_time     INTEGER,                        -- minutes
  servings      INTEGER,
  toddler_notes TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id);

CREATE TABLE IF NOT EXISTS meal_plans (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id         TEXT NOT NULL,
  week_start_date TEXT NOT NULL, -- YYYY-MM-DD (Monday)
  meals           TEXT NOT NULL DEFAULT '{}', -- JSON {monday:{dinner:{...}}, ...}
  grocery_list    TEXT NOT NULL DEFAULT '[]', -- JSON {item,amount,category}[]
  prep_notes      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_week ON meal_plans(user_id, week_start_date);
