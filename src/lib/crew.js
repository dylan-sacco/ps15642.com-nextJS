import fs from 'fs';
import { CREW_FILE } from '@/lib/paths';

const DEFAULT = { sectionVisible: true, members: [] };

export function readCrew() {
  try {
    const data = JSON.parse(fs.readFileSync(CREW_FILE, 'utf8'));
    return {
      sectionVisible: data.sectionVisible ?? true,
      title:          data.title    ?? 'Meet the Team',
      subtitle:       data.subtitle ?? 'The people who make it happen',
      members:        Array.isArray(data.members) ? data.members : [],
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function writeCrew(data) {
  fs.writeFileSync(CREW_FILE, JSON.stringify(data, null, 2));
}
