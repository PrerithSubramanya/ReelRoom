#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
const OAUTH2_CLIENT_ID = process.env.OAUTH2_CLIENT_ID || '{{OAUTH2_CLIENT_ID}}';
const SUPABASE_URL = process.env.SUPABASE_URL || '{{SUPABASE_URL}}';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '{{SUPABASE_ANON_KEY}}';

console.log('🔧 Injecting secrets into built extension...');

// Update manifest in dist directory
const manifestPath = path.join(__dirname, '../dist/manifest.json');
if (fs.existsSync(manifestPath)) {
  let manifestContent = fs.readFileSync(manifestPath, 'utf8');

  // Replace placeholders with actual values
  manifestContent = manifestContent.replace(/\{\{OAUTH2_CLIENT_ID\}\}/g, OAUTH2_CLIENT_ID);

  // Write the updated manifest
  fs.writeFileSync(manifestPath, manifestContent);
  console.log('✅ Manifest updated with secrets');
} else {
  console.error('❌ dist/manifest.json not found. Run build first.');
  process.exit(1);
}

// Update any built JS files that contain placeholders
const distAssetsPath = path.join(__dirname, '../dist/assets');
if (fs.existsSync(distAssetsPath)) {
  const files = fs.readdirSync(distAssetsPath);
  
  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(distAssetsPath, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      let updated = false;
      if (SUPABASE_URL !== '{{SUPABASE_URL}}' && content.includes('{{SUPABASE_URL}}')) {
        content = content.replace(/\{\{SUPABASE_URL\}\}/g, SUPABASE_URL);
        updated = true;
      }
      if (SUPABASE_ANON_KEY !== '{{SUPABASE_ANON_KEY}}' && content.includes('{{SUPABASE_ANON_KEY}}')) {
        content = content.replace(/\{\{SUPABASE_ANON_KEY\}\}/g, SUPABASE_ANON_KEY);
        updated = true;
      }
      
      if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated secrets in ${file}`);
      }
    }
  }
}

console.log('🚀 Ready for build!');
