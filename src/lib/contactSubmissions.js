import fs from 'fs';
import { CONTACT_SUBMISSIONS_FILE } from './paths.js';

function readSubmissions() {
  try {
    return JSON.parse(fs.readFileSync(CONTACT_SUBMISSIONS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeSubmissions(submissions) {
  fs.writeFileSync(CONTACT_SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf8');
}

function purgeExpired(submissions) {
  const days = parseInt(process.env.CONTACT_RETENTION_DAYS ?? '90', 10);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return submissions.filter(s => new Date(s.submittedAt).getTime() > cutoff);
}

export function getSubmissions() {
  const all = readSubmissions();
  const purged = purgeExpired(all);
  if (purged.length !== all.length) writeSubmissions(purged);
  return purged;
}

export function addSubmission(data) {
  const submissions = readSubmissions();
  const entry = {
    id: String(Date.now()),
    submittedAt: new Date().toISOString(),
    read: false,
    name: data.name ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    address: data.address ?? '',
    city: data.city ?? '',
    state: data.state ?? '',
    zip: data.zip ?? '',
    message: data.message ?? '',
  };
  submissions.unshift(entry);
  const purged = purgeExpired(submissions);
  writeSubmissions(purged);
  return entry;
}

export function markRead(id) {
  const submissions = readSubmissions();
  const idx = submissions.findIndex(s => s.id === id);
  if (idx === -1) return false;
  submissions[idx].read = true;
  writeSubmissions(submissions);
  return true;
}

export function deleteSubmission(id) {
  const submissions = readSubmissions();
  const filtered = submissions.filter(s => s.id !== id);
  if (filtered.length === submissions.length) return false;
  writeSubmissions(filtered);
  return true;
}
