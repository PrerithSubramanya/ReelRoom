#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
const OAUTH2_CLIENT_ID = process.env.OAUTH2_CLIENT_ID || '{{OAUTH2_CLIENT_ID}}';
const SUPABASE_CLIENT_ID = process.env.SUPABASE_CLIENT_ID || '{{SUPABASE_CLIENT_ID}}';

console.log('🔧 Building ReelRoom with environment secrets...');

// Read manifest template
const manifestPath = path.join(__dirname, '../public/manifest.json');
let manifestContent = fs.readFileSync(manifestPath, 'utf8');

// Replace placeholders with actual values
manifestContent = manifestContent.replace(/\{\{OAUTH2_CLIENT_ID\}\}/g, OAUTH2_CLIENT_ID);
manifestContent = manifestContent.replace(/\{\{SUPABASE_CLIENT_ID\}\}/g, SUPABASE_CLIENT_ID);

// Write the updated manifest
fs.writeFileSync(manifestPath, manifestContent);

console.log('✅ Manifest updated with secrets');

// Also update supabase.js if it contains placeholders
const supabasePath = path.join(__dirname, '../src/supabase.js');
if (fs.existsSync(supabasePath)) {
  let supabaseContent = fs.readFileSync(supabasePath, 'utf8');
  
  // Replace any placeholders in supabase.js
  if (process.env.SUPABASE_URL) {
    supabaseContent = supabaseContent.replace(/\{\{SUPABASE_URL\}\}/g, process.env.SUPABASE_URL);
  }
  if (process.env.SUPABASE_ANON_KEY) {
    supabaseContent = supabaseContent.replace(/\{\{SUPABASE_ANON_KEY\}\}/g, process.env.SUPABASE_ANON_KEY);
  }
  
  fs.writeFileSync(supabasePath, supabaseContent);
  console.log('✅ Supabase config updated with secrets');
}

console.log('🚀 Ready for build!');
