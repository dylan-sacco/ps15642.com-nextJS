import fs from 'fs';
import { QUOTE_REQUESTS_FILE } from './paths.js';

function readQuotes() {
  try {
    return JSON.parse(fs.readFileSync(QUOTE_REQUESTS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeQuotes(quotes) {
  fs.writeFileSync(QUOTE_REQUESTS_FILE, JSON.stringify(quotes, null, 2), 'utf8');
}

function purgeExpired(quotes) {
  const days = parseInt(process.env.CONTACT_RETENTION_DAYS ?? '90', 10);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return quotes.filter(q => new Date(q.submittedAt).getTime() > cutoff);
}

export function getQuotes() {
  const all = readQuotes();
  const purged = purgeExpired(all);
  if (purged.length !== all.length) writeQuotes(purged);
  return purged;
}

export function addQuote(data) {
  const quotes = readQuotes();
  const entry = {
    id: String(Date.now()),
    submittedAt: new Date().toISOString(),
    read: false,
    serviceType: data.serviceType ?? '',
    name: data.name ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    address: data.address ?? '',
    city: data.city ?? '',
    state: data.state ?? '',
    zip: data.zip ?? '',
    startDate: data.startDate ?? '',
    message: data.message ?? '',
  };
  quotes.unshift(entry);
  const purged = purgeExpired(quotes);
  writeQuotes(purged);
  return entry;
}

export function markQuoteRead(id) {
  const quotes = readQuotes();
  const idx = quotes.findIndex(q => q.id === id);
  if (idx === -1) return false;
  quotes[idx].read = true;
  writeQuotes(quotes);
  return true;
}

export function deleteQuote(id) {
  const quotes = readQuotes();
  const filtered = quotes.filter(q => q.id !== id);
  if (filtered.length === quotes.length) return false;
  writeQuotes(filtered);
  return true;
}
