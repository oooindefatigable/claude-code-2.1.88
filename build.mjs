import esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Read the old cli.js to extract metadata
const oldCli = readFileSync('./cli.js', 'utf8');
const headerMatch = oldCli.match(/^(#!\/usr\/bin\/env node[\s\S]*?\n\/\/ Version:.*?\n)/);
const header = headerMatch ? headerMatch[1] : '#!/usr/bin/env node\n';

console.log('Building Claude Code CLI with OpenRouter support...');

try {
  const result = await esbuild.build({
    entryPoints: ['source/src/cli.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'cli-new.js',
    sourcemap: 'inline', // Use inline sourcemap initially
    external: [
      '@anthropic-ai/sdk',
      '@anthropic-ai/bedrock-sdk',
      '@anthropic-ai/vertex-sdk',
      '@anthropic-ai/foundry-sdk',
      'react',
      'google-auth-library',
      '@azure/identity'
    ],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    logLevel: 'info'
  });

  // Add shebang and original header
  let newCli = readFileSync('cli-new.js', 'utf8');
  newCli = header + newCli.replace(/^#!.*?\n/, '');
  writeFileSync('cli.js', newCli);
  writeFileSync('cli.js.old', oldCli); // Backup original

  console.log('✓ Build complete. cli.js has been updated with OpenRouter support.');
  console.log('Changes:');
  console.log('  - Updated ConsoleOAuthFlow to show only OpenRouter option');
  console.log('  - Added openrouter provider support in client.ts');
  console.log('  - Updated model configs with OpenRouter model IDs');
  
  // Cleanup
  try {
    const { unlinkSync } = await import('fs');
    unlinkSync('cli-new.js');
  } catch (e) {
    // Ignore cleanup errors
  }
  
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
