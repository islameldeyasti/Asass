import {compare, hash} from 'bcryptjs';

const ROUNDS = 10;

export async function hashPassword(plain) {
  return hash(String(plain || ''), ROUNDS);
}

export async function comparePassword(plain, passwordHash) {
  if (!plain || !passwordHash) return false;
  try {
    return await compare(String(plain), String(passwordHash));
  } catch {
    return false;
  }
}
