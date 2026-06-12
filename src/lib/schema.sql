-- =====================================================
-- ChapaQuiz Database Schema for Supabase (PostgreSQL)
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =====================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  wallet_balance NUMERIC DEFAULT 150.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'waiting',
  entry_fee NUMERIC NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  question_ids JSONB NOT NULL,       -- array of question IDs from questions bank
  timer_start TIMESTAMPTZ,           -- set when match goes live
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match players
CREATE TABLE IF NOT EXISTS match_players (
  match_id TEXT REFERENCES matches(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  time_taken NUMERIC DEFAULT 0,
  is_finished BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (match_id, user_id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  mpesa_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matchmaking queue (one row per queued player)
CREATE TABLE IF NOT EXISTS match_queue (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  tier NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Private rooms
CREATE TABLE IF NOT EXISTS private_rooms (
  id TEXT PRIMARY KEY,
  host_user_id TEXT REFERENCES users(id),
  entry_fee NUMERIC NOT NULL,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Private room members
CREATE TABLE IF NOT EXISTS private_room_players (
  room_id TEXT REFERENCES private_rooms(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, user_id)
);

-- =====================================================
-- Disable Row Level Security for simplicity (demo/dev)
-- In production, set up proper RLS policies instead.
-- =====================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_players DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE private_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE private_room_players DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- Seed data (optional starter players for leaderboard)
-- =====================================================
INSERT INTO users (id, name, phone, wallet_balance) VALUES
  ('seed_1', 'Alpha', '0711111111', 250),
  ('seed_2', 'Sniper', '0722222222', 180),
  ('seed_3', 'Ghost', '0733333333', 150),
  ('seed_4', 'Rookie', '0744444444', 100)
ON CONFLICT DO NOTHING;
