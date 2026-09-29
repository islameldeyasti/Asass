import JSZip from 'jszip';
import {readdir, readFile, stat} from 'fs/promises';
import path from 'path';

async function addDir(zip, dir, prefix) {
  let entries = [];
  try {
    entries = await readdir(dir, {withFileTypes: true});
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const name = `${prefix}${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      await addDir(zip, full, `${name}/`);
    } else {
      const info = await stat(full);
      if (info.size > 40 * 1024 * 1024) continue;
      zip.file(name, await readFile(full));
    }
  }
}

export async function buildDeliveryBackup() {
  const zip = new JSZip();
  const root = process.cwd();
  await addDir(zip, path.join(root, '.data'), 'data/');
  await addDir(zip, path.join(root, 'content'), 'content/');
  const blob = await zip.generateAsync({type: 'nodebuffer', compression: 'DEFLATE'});
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return {bytes: blob, filename: `asas-backup-${stamp}.zip`};
}
