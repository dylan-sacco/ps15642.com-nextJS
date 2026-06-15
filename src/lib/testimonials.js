import fs from 'fs';
import { TESTIMONIALS_FILE } from './paths.js';

function readTestimonials() {
  try {
    return JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeTestimonials(testimonials) {
  fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), 'utf8');
}

export function getTestimonials() {
  return readTestimonials();
}

export function getFeaturedTestimonials() {
  return readTestimonials().filter(t => t.featured);
}

export function addTestimonial(data) {
  const testimonials = readTestimonials();
  const entry = {
    id: String(Date.now()),
    name: data.name ?? '',
    location: data.location ?? '',
    rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
    text: data.text ?? '',
    date: data.date ?? new Date().toISOString().slice(0, 10),
    featured: !!data.featured,
    source: data.source ?? 'manual',
  };
  testimonials.unshift(entry);
  writeTestimonials(testimonials);
  return entry;
}

export function updateTestimonial(id, data) {
  const testimonials = readTestimonials();
  const idx = testimonials.findIndex(t => t.id === id);
  if (idx === -1) return false;
  testimonials[idx] = {
    ...testimonials[idx],
    name: data.name ?? testimonials[idx].name,
    location: data.location ?? testimonials[idx].location,
    rating: data.rating !== undefined ? Math.min(5, Math.max(1, Number(data.rating))) : testimonials[idx].rating,
    text: data.text ?? testimonials[idx].text,
    date: data.date ?? testimonials[idx].date,
    featured: data.featured !== undefined ? !!data.featured : testimonials[idx].featured,
    source: data.source ?? testimonials[idx].source,
  };
  writeTestimonials(testimonials);
  return true;
}

export function deleteTestimonial(id) {
  const testimonials = readTestimonials();
  const filtered = testimonials.filter(t => t.id !== id);
  if (filtered.length === testimonials.length) return false;
  writeTestimonials(filtered);
  return true;
}
