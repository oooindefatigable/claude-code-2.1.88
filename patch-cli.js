import fs from 'fs';

const cli = fs.readFileSync('./cli.js', 'utf8');

// Patch 1: Replace all login method strings
const patchedCli = cli
  // Replace the intro message
  .replace(
    /Claude Code can be used with your Claude subscription or billed based on API usage through your Console account\./g,
    'Claude Code is configured to use OpenRouter for API access.'
  )
  // Replace "Select login method:"
  .replace(
    /Select login method:/g,
    'Proceed with OpenRouter setup:'
  )
  // Keep only OpenRouter in the login options
  .replace(
    /"Claude account with subscription[^}]*?"claudeai"\}/,
    '{"label":"OpenRouter","value":"openrouter"}'
  )
  .replace(
    /"Anthropic Console account[^}]*?"console"\}/,
    '{"label":"OpenRouter","value":"openrouter"}'
  )
  .replace(
    /"3rd-party platform[^}]*?"platform"\}/,
    '{"label":"OpenRouter","value":"openrouter"}'
  );

if (cli !== patchedCli) {
  fs.writeFileSync('./cli.js', patchedCli);
  console.log('✓ Patched cli.js successfully');
  console.log('Changes:');
  console.log('  - Updated login intro message');
  console.log('  - Replaced "Select login method" prompt');
  console.log('  - Kept only OpenRouter option');
  process.exit(0);
} else {
  console.log('⚠ No changes made - patterns not found in cli.js');
  console.log('This may indicate cli.js structure has changed');
  process.exit(1);
}
