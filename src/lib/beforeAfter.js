import fs from 'fs';
import { BEFORE_AFTER_FILE } from './paths.js';

function read() {
  try { return JSON.parse(fs.readFileSync(BEFORE_AFTER_FILE, 'utf8')); } catch { return []; }
}

function write(pairs) {
  fs.writeFileSync(BEFORE_AFTER_FILE, JSON.stringify(pairs, null, 2), 'utf8');
}

export function getPairs() { return read(); }

export function addPair(data) {
  const pairs = read();
  const entry = {
    id: String(Date.now()),
    title: data.title ?? '',
    description: data.description ?? '',
    beforeImage: data.beforeImage ?? '',
    afterImage: data.afterImage ?? '',
    category: data.category ?? '',
    date: data.date ?? new Date().toISOString().slice(0, 10),
  };
  pairs.unshift(entry);
  write(pairs);
  return entry;
}

export function updatePair(id, data) {
  const pairs = read();
  const idx = pairs.findIndex(p => p.id === id);
  if (idx === -1) return false;
  pairs[idx] = { ...pairs[idx], ...data, id };
  write(pairs);
  return true;
}

export function deletePair(id) {
  const pairs = read();
  const filtered = pairs.filter(p => p.id !== id);
  if (filtered.length === pairs.length) return false;
  write(filtered);
  return true;
}
