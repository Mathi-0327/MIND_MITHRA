/**
 * MIND MITHRA — Production SQLite Database Module
 * Handles: Users, Patient Profiles, Caregiver-Patient Relationships, Password Reset Tokens
 * Uses better-sqlite3 for synchronous, reliable local persistence.
 */

import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ─── DATABASE FILE LOCATION ────────────────────────────────────────────────────
// In production: use a persistent path. In dev: local file.
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'mind_mithra.db');

let db: Database.Database;

export function getDB(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

// ─── SCHEMA INITIALIZATION ─────────────────────────────────────────────────────
function initializeSchema() {
  const database = db;

  // Users table — primary auth record
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      email       TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'PATIENT',
      auth_provider TEXT NOT NULL DEFAULT 'email',
      google_id   TEXT,
      password_hash TEXT,
      preferred_language TEXT DEFAULT 'en',
      region      TEXT,
      avatar_url  TEXT,
      is_active   INTEGER DEFAULT 1,
      email_verified INTEGER DEFAULT 0,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    )
  `);

  // Patient profiles — extends user for patient-specific data
  database.exec(`
    CREATE TABLE IF NOT EXISTS patient_profiles (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES users(id),
      age           INTEGER,
      gender        TEXT DEFAULT 'MALE',
      region        TEXT,
      cultural_interests TEXT DEFAULT '[]',
      medical_data_provided INTEGER DEFAULT 0,
      caregiver_name TEXT DEFAULT '',
      caregiver_contact TEXT DEFAULT '',
      current_difficulty_level INTEGER DEFAULT 2,
      fatigue_score INTEGER DEFAULT 0,
      avatar_url    TEXT,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    )
  `);

  // Caregiver-patient relationships
  database.exec(`
    CREATE TABLE IF NOT EXISTS caregiver_patient_relationships (
      id            TEXT PRIMARY KEY,
      caregiver_id  TEXT NOT NULL REFERENCES users(id),
      patient_id    TEXT NOT NULL REFERENCES users(id),
      relationship  TEXT DEFAULT 'CAREGIVER',
      authorized_at TEXT NOT NULL,
      is_active     INTEGER DEFAULT 1
    )
  `);

  // Password reset tokens
  database.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id),
      token       TEXT UNIQUE NOT NULL,
      expires_at  TEXT NOT NULL,
      used        INTEGER DEFAULT 0
    )
  `);

  // Audit log for security events
  database.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id          TEXT PRIMARY KEY,
      user_id     TEXT,
      event_type  TEXT NOT NULL,
      event_data  TEXT DEFAULT '{}',
      ip_address  TEXT,
      created_at  TEXT NOT NULL
    )
  `);

  // Seed default demo caregiver account (for demo purposes)
  seedDefaultAccounts();
}

// ─── SEED DEFAULT DEMO ACCOUNTS ────────────────────────────────────────────────
function seedDefaultAccounts() {
  const database = db;
  const now = new Date().toISOString();

  const accounts = [
    {
      id: 'caregiver-priyanka-001',
      email: 'caregiver@mindmithra.org',
      name: 'Dr. Priyanka Kumar (Care Coordinator)',
      role: 'CAREGIVER',
      password: 'MithraCare2026!',
      region: 'Assam (Guwahati & Tezpur)',
    },
    {
      id: 'caregiver-demo-002',
      email: 'caregiver@mindmithra.demo',
      name: 'Dr. Priyanka Kumar',
      role: 'CAREGIVER',
      password: 'CareDemo@2026',
      region: 'Assam (Guwahati & Tezpur)',
    },
    {
      id: 'patient-ravi-001',
      email: 'ravi.kumar@mindmithra.org',
      name: 'Ravi Kumar',
      role: 'PATIENT',
      password: 'RaviCare2026!',
      region: 'Assam (Guwahati & Tezpur)',
      age: 72,
      gender: 'MALE',
      interests: '["Traditional Bihu & Flute Music","Assam Tea Gardening","Majuli Heritage"]',
    },
    {
      id: 'patient-ravi-alias',
      email: 'patient@mindmithra.org',
      name: 'Ravi Kumar',
      role: 'PATIENT',
      password: 'PatientCare2026!',
      region: 'Assam (Guwahati & Tezpur)',
      age: 72,
      gender: 'MALE',
      interests: '["Traditional Bihu & Flute Music","Assam Tea Gardening","Majuli Heritage"]',
    },
    {
      id: 'patient-maya-002',
      email: 'maya.devi@mindmithra.org',
      name: 'Maya Devi',
      role: 'PATIENT',
      password: 'MayaCare2026!',
      region: 'Meghalaya (Shillong)',
      age: 68,
      gender: 'FEMALE',
      interests: '["Pine Forest Walks & Gardening","Traditional Weaving Patterns","Folk Choirs & Singing"]',
    },
    {
      id: 'patient-biren-003',
      email: 'biren.barua@mindmithra.org',
      name: 'Biren Barua',
      role: 'PATIENT',
      password: 'BirenCare2026!',
      region: 'Assam (Jorhat Tea Estate)',
      age: 76,
      gender: 'MALE',
      interests: '["Tea Plucking & Estate Life","Kaziranga Nature & Birds","Dhol & Bihu Melodies"]',
    },
  ];

  for (const acc of accounts) {
    const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(acc.email);
    const hash = bcrypt.hashSync(acc.password, 12);
    if (!existing) {
      database.prepare(`
        INSERT INTO users (id, email, name, role, auth_provider, password_hash, preferred_language, region, email_verified, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'email', ?, 'en', ?, 1, 1, ?, ?)
      `).run(acc.id, acc.email, acc.name, acc.role, hash, acc.region, now, now);

      if (acc.role === 'PATIENT') {
        database.prepare(`
          INSERT INTO patient_profiles (id, user_id, age, gender, region, cultural_interests, current_difficulty_level, fatigue_score, avatar_url, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, 2, 0, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', ?, ?)
        `).run(`profile-${acc.id}`, acc.id, acc.age || 70, acc.gender || 'MALE', acc.region, acc.interests || '[]', now, now);

        // Link patient to primary caregiver
        const relId = `rel-${acc.id}-priyanka`;
        const relExisting = database.prepare('SELECT id FROM caregiver_patient_relationships WHERE id = ?').get(relId);
        if (!relExisting) {
          database.prepare(`
            INSERT INTO caregiver_patient_relationships (id, caregiver_id, patient_id, relationship, authorized_at, is_active)
            VALUES (?, 'caregiver-priyanka-001', ?, 'PRIMARY_CAREGIVER', ?, 1)
          `).run(relId, acc.id, now);
        }
      }
      console.log(`✅ Demo account seeded: ${acc.email} (${acc.role})`);
    } else {
      // Update password hash to guarantee demo credentials always work
      database.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, acc.email);
    }
  }
}

// ─── USER CRUD ─────────────────────────────────────────────────────────────────
export interface DBUser {
  id: string;
  email: string;
  name: string;
  role: string;
  auth_provider: string;
  google_id?: string;
  password_hash?: string;
  preferred_language: string;
  region?: string;
  avatar_url?: string;
  is_active: number;
  email_verified: number;
  created_at: string;
  updated_at: string;
}

export function createUser(data: {
  email: string;
  name: string;
  password: string;
  role?: string;
  preferred_language?: string;
  region?: string;
}): { success: boolean; user?: DBUser; error?: string } {
  const database = getDB();
  try {
    // Check email uniqueness
    const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(data.email.toLowerCase().trim());
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const id = `user-${crypto.randomUUID()}`;
    const hash = bcrypt.hashSync(data.password, 12);
    const now = new Date().toISOString();
    const role = data.role || 'PATIENT';

    database.prepare(`
      INSERT INTO users (id, email, name, role, auth_provider, password_hash, preferred_language, region, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'email', ?, ?, ?, 1, ?, ?)
    `).run(
      id,
      data.email.toLowerCase().trim(),
      data.name.trim(),
      role,
      hash,
      data.preferred_language || 'en',
      data.region || '',
      now,
      now
    );

    // Create patient profile if patient role
    if (role === 'PATIENT') {
      const profileId = `profile-${crypto.randomUUID()}`;
      database.prepare(`
        INSERT INTO patient_profiles (id, user_id, age, gender, region, cultural_interests, current_difficulty_level, fatigue_score, avatar_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(profileId, id, 0, 'MALE', data.region || '', '[]', 2, 0, '', now, now);
    }

    // Log signup
    logAuditEvent(null, 'USER_SIGNUP', { email: data.email, role });

    const user = database.prepare('SELECT * FROM users WHERE id = ?').get(id) as DBUser;
    return { success: true, user };
  } catch (err: any) {
    console.error('createUser error:', err);
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
}

export function findUserByEmail(email: string): DBUser | null {
  const database = getDB();
  return (database.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as DBUser) || null;
}

export function findUserById(id: string): DBUser | null {
  const database = getDB();
  return (database.prepare('SELECT * FROM users WHERE id = ?').get(id) as DBUser) || null;
}

export function verifyPassword(user: DBUser, password: string): boolean {
  if (!user.password_hash) return false;
  return bcrypt.compareSync(password, user.password_hash);
}

export function findOrCreateGoogleUser(googleProfile: {
  googleId: string;
  email: string;
  name: string;
  avatar_url?: string;
}): DBUser {
  const database = getDB();
  const now = new Date().toISOString();

  // Check if user exists by google_id
  let user = database.prepare('SELECT * FROM users WHERE google_id = ?').get(googleProfile.googleId) as DBUser;
  if (user) return user;

  // Check if email exists
  user = database.prepare('SELECT * FROM users WHERE email = ?').get(googleProfile.email.toLowerCase()) as DBUser;
  if (user) {
    // Link google ID to existing account
    database.prepare('UPDATE users SET google_id = ?, updated_at = ? WHERE id = ?')
      .run(googleProfile.googleId, now, user.id);
    return database.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as DBUser;
  }

  // Create new user
  const id = `user-${crypto.randomUUID()}`;
  database.prepare(`
    INSERT INTO users (id, email, name, role, auth_provider, google_id, avatar_url, preferred_language, email_verified, created_at, updated_at)
    VALUES (?, ?, ?, 'PATIENT', 'google', ?, ?, 'en', 1, ?, ?)
  `).run(id, googleProfile.email.toLowerCase(), googleProfile.name, googleProfile.googleId, googleProfile.avatar_url || '', now, now);

  // Create patient profile
  const profileId = `profile-${crypto.randomUUID()}`;
  database.prepare(`
    INSERT INTO patient_profiles (id, user_id, age, gender, region, cultural_interests, current_difficulty_level, fatigue_score, avatar_url, created_at, updated_at)
    VALUES (?, ?, 0, 'MALE', '', '[]', 2, 0, ?, ?, ?)
  `).run(profileId, id, googleProfile.avatar_url || '', now, now);

  logAuditEvent(id, 'GOOGLE_SIGNUP', { email: googleProfile.email });
  return database.prepare('SELECT * FROM users WHERE id = ?').get(id) as DBUser;
}

// ─── PASSWORD RESET ─────────────────────────────────────────────────────────────
export function createPasswordResetToken(userId: string): string {
  const database = getDB();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  const id = crypto.randomUUID();

  // Invalidate old tokens for this user
  database.prepare('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?').run(userId);

  database.prepare(`
    INSERT INTO password_reset_tokens (id, user_id, token, expires_at, used) VALUES (?, ?, ?, ?, 0)
  `).run(id, userId, token, expiresAt);

  return token;
}

export function validatePasswordResetToken(token: string): { valid: boolean; userId?: string } {
  const database = getDB();
  const record = database.prepare(`
    SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > ?
  `).get(token, new Date().toISOString()) as any;

  if (!record) return { valid: false };
  return { valid: true, userId: record.user_id };
}

export function consumePasswordResetToken(token: string, newPassword: string): boolean {
  const database = getDB();
  const { valid, userId } = validatePasswordResetToken(token);
  if (!valid || !userId) return false;

  const hash = bcrypt.hashSync(newPassword, 12);
  const now = new Date().toISOString();

  database.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(hash, now, userId);
  database.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').run(token);

  logAuditEvent(userId, 'PASSWORD_RESET', {});
  return true;
}

// ─── PATIENT PROFILE ────────────────────────────────────────────────────────────
export function getPatientProfile(userId: string) {
  const database = getDB();
  return database.prepare('SELECT * FROM patient_profiles WHERE user_id = ?').get(userId) as any;
}

export function updatePatientProfile(userId: string, data: Record<string, any>) {
  const database = getDB();
  const now = new Date().toISOString();
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), now, userId];
  database.prepare(`UPDATE patient_profiles SET ${fields}, updated_at = ? WHERE user_id = ?`).run(...values);
}

// ─── CAREGIVER AUTHORIZATION ────────────────────────────────────────────────────
export function getAuthorizedPatients(caregiverId: string): DBUser[] {
  const database = getDB();
  return database.prepare(`
    SELECT u.* FROM users u
    JOIN caregiver_patient_relationships r ON r.patient_id = u.id
    WHERE r.caregiver_id = ? AND r.is_active = 1
  `).all(caregiverId) as DBUser[];
}

export function isPatientAuthorizedForCaregiver(caregiverId: string, patientId: string): boolean {
  const database = getDB();
  const rel = database.prepare(`
    SELECT id FROM caregiver_patient_relationships WHERE caregiver_id = ? AND patient_id = ? AND is_active = 1
  `).get(caregiverId, patientId);
  return Boolean(rel);
}

// ─── AUDIT LOGGING ──────────────────────────────────────────────────────────────
export function logAuditEvent(userId: string | null, eventType: string, eventData: Record<string, any>, ipAddress?: string) {
  try {
    const database = getDB();
    const id = crypto.randomUUID();
    database.prepare(`
      INSERT INTO audit_logs (id, user_id, event_type, event_data, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId || null, eventType, JSON.stringify(eventData), ipAddress || null, new Date().toISOString());
  } catch {
    // Audit logging should never break main flow
  }
}

// Initialize DB on module load
getDB();
