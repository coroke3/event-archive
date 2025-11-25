import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'cache', 'build-data.json');

export function loadBuildData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return null;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (error) {
    console.warn('[build-data] Failed to load cached data:', error.message);
    return null;
  }
}

