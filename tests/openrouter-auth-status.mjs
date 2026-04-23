import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const cli = '/root/workspace/claude-code-2.1.88/cli.js';

function run(env) {
  const result = spawnSync('node', [cli, 'auth', 'status', '--json'], {
    env: {
      ...process.env,
      OPENROUTER_API_KEY: '',
      ANTHROPIC_API_KEY: '',
      ANTHROPIC_AUTH_TOKEN: '',
      ...env,
    },
    encoding: 'utf8',
  });

  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (error) {
    console.error('stdout was not valid JSON:', result.stdout);
    console.error('stderr:', result.stderr);
    throw error;
  }

  return { ...result, parsed };
}

const openrouter = run({
  CLAUDE_CODE_USE_OPENROUTER: '1',
  OPENROUTER_API_KEY: 'dummy-openrouter-key',
});
assert.equal(
  openrouter.parsed.apiProvider,
  'openrouter',
  `expected apiProvider=openrouter, got ${JSON.stringify(openrouter.parsed)}`,
);
assert.equal(
  openrouter.parsed.authMethod,
  'third_party',
  `expected authMethod=third_party, got ${JSON.stringify(openrouter.parsed)}`,
);
assert.equal(
  openrouter.parsed.loggedIn,
  true,
  `expected loggedIn=true, got ${JSON.stringify(openrouter.parsed)}`,
);
assert.equal(openrouter.status, 0, `expected exit status 0, got ${openrouter.status}`);

const openrouterMissingKey = run({
  CLAUDE_CODE_USE_OPENROUTER: '1',
});
assert.equal(openrouterMissingKey.parsed.apiProvider, 'openrouter');
assert.equal(openrouterMissingKey.parsed.authMethod, 'third_party');
assert.equal(openrouterMissingKey.parsed.loggedIn, false);
assert.equal(openrouterMissingKey.status, 1);

const openrouterWithAnthropicKeyOnly = run({
  CLAUDE_CODE_USE_OPENROUTER: '1',
  ANTHROPIC_API_KEY: 'dummy-anthropic-key',
});
assert.equal(openrouterWithAnthropicKeyOnly.parsed.apiProvider, 'openrouter');
assert.equal(openrouterWithAnthropicKeyOnly.parsed.authMethod, 'third_party');
assert.equal(openrouterWithAnthropicKeyOnly.parsed.loggedIn, false);
assert.equal(openrouterWithAnthropicKeyOnly.status, 1);
assert.equal(openrouterWithAnthropicKeyOnly.parsed.apiKeySource, undefined);

const bedrock = run({ CLAUDE_CODE_USE_BEDROCK: '1' });
assert.equal(bedrock.parsed.apiProvider, 'bedrock');
assert.equal(bedrock.parsed.authMethod, 'third_party');
assert.equal(bedrock.parsed.loggedIn, true);
assert.equal(bedrock.status, 0);

console.log('openrouter auth status smoke test passed');
