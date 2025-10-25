import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Resolve monorepo root by going up until package.json is found
let rootPath = __dirname;
while (!fs.existsSync(path.join(rootPath, 'package.json'))) {
  rootPath = path.resolve(rootPath, '..');
}

// Load .env from monorepo root
const envPath = path.join(rootPath, '.env');
dotenv.config({ path: envPath });

console.log('Loaded .env from:', envPath);
