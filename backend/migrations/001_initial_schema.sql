-- ============================================================
-- BinWise AI — Supabase PostgreSQL Schema
-- Migration: 001_initial_schema.sql
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email        TEXT UNIQUE NOT NULL,
    karma_points INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WASTE SUBMISSIONS ENUM & TABLE
DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM (
        'pending_text_input',
        'verified',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS waste_submissions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url           TEXT NOT NULL,
    perceptual_hash     TEXT NOT NULL,
    waste_type          TEXT,
    hazard_level        SMALLINT CHECK (hazard_level BETWEEN 1 AND 5),
    current_burden      JSONB,
    future_risk         JSONB,
    gemini_confidence   NUMERIC(4,3),
    status              submission_status NOT NULL DEFAULT 'pending_text_input',
    user_text_input     TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waste_submissions_user_id ON waste_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_submissions_phash   ON waste_submissions(perceptual_hash);
CREATE INDEX IF NOT EXISTS idx_waste_submissions_status  ON waste_submissions(status);

-- 3. DIY PROJECTS ENUM & TABLE
DO $$ BEGIN
    CREATE TYPE diy_status AS ENUM (
        'pending',
        'verified',
        'skipped'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS diy_projects (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id    UUID NOT NULL REFERENCES waste_submissions(id) ON DELETE CASCADE,
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    steps_json       JSONB,
    proof_image_url  TEXT,
    proof_hash       TEXT,
    status           diy_status NOT NULL DEFAULT 'pending',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diy_projects_submission_id ON diy_projects(submission_id);
CREATE INDEX IF NOT EXISTS idx_diy_projects_user_id       ON diy_projects(user_id);

-- 4. WASTE JOURNEYS ENUMS & TABLE
DO $$ BEGIN
    CREATE TYPE journey_final_status AS ENUM ('Recycled', 'Disposed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE journey_diy_status AS ENUM ('completed', 'skipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS waste_journeys (
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id             UUID NOT NULL UNIQUE REFERENCES waste_submissions(id) ON DELETE CASCADE,
    transit_start_time        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estimated_completion_time TIMESTAMPTZ,
    final_status              journey_final_status,
    diy_status                journey_diy_status,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waste_journeys_submission_id ON waste_journeys(submission_id);

-- 5. KARMA LEDGER
CREATE TABLE IF NOT EXISTS karma_ledger (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_id   UUID REFERENCES waste_submissions(id) ON DELETE SET NULL,
    points_awarded  INTEGER NOT NULL,
    reason          TEXT NOT NULL,
    proof_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_karma_ledger_user_id ON karma_ledger(user_id);

-- 6. TRIGGERS & FUNCTIONS
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_waste_submissions_updated_at ON waste_submissions;
CREATE TRIGGER trg_waste_submissions_updated_at
    BEFORE UPDATE ON waste_submissions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_diy_projects_updated_at ON diy_projects;
CREATE TRIGGER trg_diy_projects_updated_at
    BEFORE UPDATE ON diy_projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_waste_journeys_updated_at ON waste_journeys;
CREATE TRIGGER trg_waste_journeys_updated_at
    BEFORE UPDATE ON waste_journeys
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. ATOMIC KARMA INCREMENT (Supabase RPC)
CREATE OR REPLACE FUNCTION increment_karma(p_user_id UUID, p_points INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET karma_points = karma_points + p_points
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User % not found', p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
