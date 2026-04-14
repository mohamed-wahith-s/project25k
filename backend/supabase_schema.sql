-- ============================================================
--  PathFinder | College Counseling App — New Schema
--  Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum for Caste Categories
DO $$ BEGIN
    CREATE TYPE caste_category_type AS ENUM ('OC', 'BC', 'BCM', 'MBC', 'SC', 'SCA', 'ST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Colleges Table
CREATE TABLE IF NOT EXISTS colleges (
  college_code    VARCHAR PRIMARY KEY,
  college_name    TEXT NOT NULL,
  college_address TEXT
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  dept_id        INTEGER PRIMARY KEY,
  dept_name      TEXT NOT NULL,
  subject_code   VARCHAR
);

-- 3. Cutoff Data Table
CREATE TABLE IF NOT EXISTS cutoff_data (
  id                   SERIAL PRIMARY KEY,
  college_code         VARCHAR REFERENCES colleges(college_code) ON DELETE CASCADE,
  dept_id              INTEGER REFERENCES departments(dept_id) ON DELETE CASCADE,
  subject_code         VARCHAR,
  caste_category       caste_category_type,
  cutoff_mark          NUMERIC(6, 2),
  rank                 INTEGER,
  seats_filling        VARCHAR,
  total_seats_in_dept  VARCHAR,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cutoff_college_code ON cutoff_data(college_code);
CREATE INDEX IF NOT EXISTS idx_cutoff_dept_id ON cutoff_data(dept_id);
CREATE INDEX IF NOT EXISTS idx_cutoff_mark ON cutoff_data(cutoff_mark);
CREATE INDEX IF NOT EXISTS idx_cutoff_caste ON cutoff_data(caste_category);
