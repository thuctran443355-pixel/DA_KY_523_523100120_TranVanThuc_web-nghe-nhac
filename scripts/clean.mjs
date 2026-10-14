import fs from 'node:fs';
for (const dir of ['client/dist', 'dist']) fs.rmSync(new URL('../' + dir, import.meta.url), { recursive: true, force: true });
