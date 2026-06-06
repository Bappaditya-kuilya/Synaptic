import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
};

function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const now = new Date().toISOString();
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);

  db.prepare(
    `
      INSERT INTO users (id, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `
  ).run(id, normalizedEmail, passwordHash, now, now);

  return {
    user: toAuthUser({
      id,
      email: normalizedEmail,
      password_hash: passwordHash,
      created_at: now,
      updated_at: now
    }),
    sessionId: await createSession(id)
  };
}

export async function verifyUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const row = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(normalizedEmail) as UserRow | undefined;

  if (!row) {
    throw new Error("Invalid email or password.");
  }

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    throw new Error("Invalid email or password.");
  }

  return {
    user: toAuthUser(row),
    sessionId: await createSession(row.id)
  };
}

async function createSession(userId: string) {
  const sessionId = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS).toISOString();

  db.prepare(
    `
      INSERT INTO sessions (id, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `
  ).run(sessionId, userId, now.toISOString(), expiresAt);

  return sessionId;
}

export async function getUserForSession(sessionId: string) {
  const session = db
    .prepare("SELECT * FROM sessions WHERE id = ?")
    .get(sessionId) as SessionRow | undefined;

  if (!session) {
    return null;
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
    return null;
  }

  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(session.user_id) as UserRow | undefined;

  return user ? toAuthUser(user) : null;
}

export async function deleteSession(sessionId: string) {
  db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}
