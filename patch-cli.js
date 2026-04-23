import fs from 'node:fs';

const cliPath = './cli.js';
const backupPath = './cli.js.backup';
let cli = fs.readFileSync(cliPath, 'utf8');
const original = cli;

function replaceExact(oldString, newString, label) {
  if (!cli.includes(oldString)) {
    throw new Error(`Pattern not found for ${label}`);
  }
  cli = cli.split(oldString).join(newString);
}

const openRouterModelMap = new Map([
  ['claude-3-7-sonnet-20250219', 'anthropic/claude-3.7-sonnet'],
  ['claude-3-5-sonnet-20241022', 'anthropic/claude-3.5-sonnet'],
  ['claude-3-5-haiku-20241022', 'anthropic/claude-3.5-haiku'],
  ['claude-haiku-4-5-20251001', 'anthropic/claude-haiku-4.5'],
  ['claude-sonnet-4-20250514', 'anthropic/claude-sonnet-4'],
  ['claude-sonnet-4-5-20250929', 'anthropic/claude-sonnet-4.5'],
  ['claude-sonnet-4-6', 'anthropic/claude-sonnet-4.6'],
  ['claude-opus-4-20250514', 'anthropic/claude-opus-4'],
  ['claude-opus-4-1-20250805', 'anthropic/claude-opus-4.1'],
  ['claude-opus-4-5-20251101', 'anthropic/claude-opus-4.5'],
  ['claude-opus-4-6', 'anthropic/claude-opus-4.6'],
]);

cli = cli.replace(
  /firstParty:"([^"]+)",bedrock:"([^"]+)",vertex:"([^"]+)",foundry:"([^"]+)"}/g,
  (match, firstParty, bedrock, vertex, foundry) => {
    const openrouter = openRouterModelMap.get(firstParty);
    if (!openrouter || match.includes('openrouter:')) return match;
    return `firstParty:"${firstParty}",bedrock:"${bedrock}",vertex:"${vertex}",foundry:"${foundry}",openrouter:"${openrouter}"}`;
  },
);

replaceExact(
  'function E7(){return i6(process.env.CLAUDE_CODE_USE_BEDROCK)?"bedrock":i6(process.env.CLAUDE_CODE_USE_VERTEX)?"vertex":i6(process.env.CLAUDE_CODE_USE_FOUNDRY)?"foundry":"firstParty"}',
  'function E7(){return i6(process.env.CLAUDE_CODE_USE_BEDROCK)?"bedrock":i6(process.env.CLAUDE_CODE_USE_VERTEX)?"vertex":i6(process.env.CLAUDE_CODE_USE_FOUNDRY)?"foundry":i6(process.env.CLAUDE_CODE_USE_OPENROUTER)?"openrouter":"firstParty"}',
  'API provider selector',
);

replaceExact(
  'let q=i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY),_=(Z7()||{}).apiKeyHelper,z=process.env.ANTHROPIC_AUTH_TOKEN||_||process.env.CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR,{source:Y}=Ow({skipRetrievingKeyFromApiKeyHelper:!0}),$=Y==="ANTHROPIC_API_KEY"||Y==="apiKeyHelper";return!(q||z&&!yD8()||$&&!yD8())}',
  'let q=i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY)||i6(process.env.CLAUDE_CODE_USE_OPENROUTER),_=(Z7()||{}).apiKeyHelper,z=process.env.ANTHROPIC_AUTH_TOKEN||_||process.env.CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR,{source:Y}=Ow({skipRetrievingKeyFromApiKeyHelper:!0}),$=Y==="ANTHROPIC_API_KEY"||Y==="apiKeyHelper";return!(q||z&&!yD8()||$&&!yD8())}',
  'isAnthropicAuthEnabled',
);

replaceExact(
  'if(N("[API:auth] OAuth token check starting"),await k$(),N("[API:auth] OAuth token check complete"),!d7())await Gt9(j,i7());let J=vt9(z,Y),M={defaultHeaders:j,maxRetries:K,timeout:parseInt(process.env.API_TIMEOUT_MS||String(600000),10),dangerouslyAllowBrowser:!0,fetchOptions:fz6({forAnthropicAPI:!0}),...J&&{fetch:J}};',
  'if(N("[API:auth] OAuth token check starting"),await k$(),N("[API:auth] OAuth token check complete"),!d7()&&!i6(process.env.CLAUDE_CODE_USE_OPENROUTER))await Gt9(j,i7());let J=vt9(z,Y),M={defaultHeaders:j,maxRetries:K,timeout:parseInt(process.env.API_TIMEOUT_MS||String(600000),10),dangerouslyAllowBrowser:!0,fetchOptions:fz6({forAnthropicAPI:!0}),...J&&{fetch:J}};',
  'skip Anthropic auth header injection for OpenRouter',
);

replaceExact(
  'function P$6(){if(i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY))return!1;if(d7())return!1;return!0}',
  'function P$6(){if(i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY)||i6(process.env.CLAUDE_CODE_USE_OPENROUTER))return!1;if(d7())return!1;return!0}',
  'is1PApiCustomer',
);

replaceExact(
  'function A16(){return!!(i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY))}',
  'function A16(){return!!(i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY)||i6(process.env.CLAUDE_CODE_USE_OPENROUTER))}',
  'isUsing3PServices',
);

replaceExact(
  'let{source:K,hasToken:_}=qS(),{source:z}=Ow(),Y=!!process.env.ANTHROPIC_API_KEY&&!LT(),$=B_(),A=yK(),O=A16(),w=_||z!=="none"||Y||O,j="none";',
  'let{source:K,hasToken:_}=qS(),{source:z}=Ow(),Y=!!process.env.ANTHROPIC_API_KEY&&!LT(),$=B_(),A=yK(),O=A16(),H=i6(process.env.CLAUDE_CODE_USE_OPENROUTER),J=!!process.env.OPENROUTER_API_KEY,M=H&&J,w=H?M:_||z!=="none"||Y||O,j="none";',
  'auth status openrouter readiness',
);

replaceExact(
  'if(q.text){let H=[...FS8(),...US8()],J=!1;for(let M of H){let X=typeof M.value==="string"?M.value:Array.isArray(M.value)?M.value.join(", "):null;if(X===null||X==="none")continue;if(J=!0,M.label)process.stdout.write(`${M.label}: ${X}\n`);else process.stdout.write(`${X}\n`)}if(!J&&Y)process.stdout.write(`API key: ANTHROPIC_API_KEY\n`);if(!w)process.stdout.write(`Not logged in. Run claude auth login to authenticate.\n`)}else{let H=E7(),J=z!=="none"?z:Y?"ANTHROPIC_API_KEY":null,M={loggedIn:w,authMethod:j,apiProvider:H};if(J)M.apiKeySource=J;if(j==="claude.ai")M.email=$?.emailAddress??null,M.orgId=$?.organizationUuid??null,M.orgName=$?.organizationName??null,M.subscriptionType=A??null;process.stdout.write(g6(M,null,2)+`\n`)}process.exit(w?0:1)}',
  'if(q.text){let H0=[...FS8(),...US8()],J0=!1;for(let M of H0){let X=typeof M.value==="string"?M.value:Array.isArray(M.value)?M.value.join(", "):null;if(X===null||X==="none")continue;if(J0=!0,M.label)process.stdout.write(`${M.label}: ${X}\n`);else process.stdout.write(`${X}\n`)}if(!J0&&Y)process.stdout.write(`API key: ANTHROPIC_API_KEY\n`);if(!w)process.stdout.write(`Not logged in. Run claude auth login to authenticate.\n`)}else{let N0=E7(),J=H?null:z!=="none"?z:Y?"ANTHROPIC_API_KEY":null,M={loggedIn:w,authMethod:j,apiProvider:N0};if(J)M.apiKeySource=J;if(j==="claude.ai")M.email=$?.emailAddress??null,M.orgId=$?.organizationUuid??null,M.orgName=$?.organizationName??null,M.subscriptionType=A??null;process.stdout.write(g6(M,null,2)+`\n`)}process.exit(w?0:1)}',
  'auth status apiKeySource suppression for OpenRouter',
);

replaceExact(
  'function j16(){return i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY)||_41()}',
  'function j16(){return i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY)||i6(process.env.CLAUDE_CODE_USE_OPENROUTER)||_41()}',
  'provider/custom-base-url guard',
);

replaceExact(
  'return new P(D)}if(i6(process.env.CLAUDE_CODE_USE_VERTEX)){',
  'return new P(D)}if(i6(process.env.CLAUDE_CODE_USE_OPENROUTER)){let P=process.env.OPENROUTER_API_KEY;if(!P)throw new Error("OPENROUTER_API_KEY environment variable is required when using OpenRouter. Get your API key at https://openrouter.ai/keys");let W={...M,baseURL:process.env.OPENROUTER_BASE_URL||"https://openrouter.ai/api",apiKey:"",authToken:P,defaultHeaders:{...j,...process.env.OPENROUTER_REFERER?{"HTTP-Referer":process.env.OPENROUTER_REFERER}:{},...process.env.OPENROUTER_TITLE?{"X-Title":process.env.OPENROUTER_TITLE}:{}},...$B()&&{logger:YD8()}};return new Rx(W)}if(i6(process.env.CLAUDE_CODE_USE_VERTEX)){',
  'OpenRouter client branch',
);

replaceExact(
  'let Y={bedrock:"AWS Bedrock",vertex:"Google Vertex AI",foundry:"Microsoft Foundry"}[q];K.push({label:"API provider",value:Y})',
  'let Y={bedrock:"AWS Bedrock",vertex:"Google Vertex AI",foundry:"Microsoft Foundry",openrouter:"OpenRouter"}[q];K.push({label:"API provider",value:Y})',
  'status provider label',
);

replaceExact(
  'else if(q==="foundry"){let Y=process.env.ANTHROPIC_FOUNDRY_BASE_URL;if(Y)K.push({label:"Microsoft Foundry base URL",value:Y});let $=process.env.ANTHROPIC_FOUNDRY_RESOURCE;if($)K.push({label:"Microsoft Foundry resource",value:$});if(i6(process.env.CLAUDE_CODE_SKIP_FOUNDRY_AUTH))K.push({value:"Microsoft Foundry auth skipped"})}let _=dh();',
  'else if(q==="foundry"){let Y=process.env.ANTHROPIC_FOUNDRY_BASE_URL;if(Y)K.push({label:"Microsoft Foundry base URL",value:Y});let $=process.env.ANTHROPIC_FOUNDRY_RESOURCE;if($)K.push({label:"Microsoft Foundry resource",value:$});if(i6(process.env.CLAUDE_CODE_SKIP_FOUNDRY_AUTH))K.push({value:"Microsoft Foundry auth skipped"})}else if(q==="openrouter"){K.push({label:"OpenRouter base URL",value:process.env.OPENROUTER_BASE_URL||"https://openrouter.ai/api"});if(process.env.OPENROUTER_TITLE)K.push({label:"OpenRouter title",value:process.env.OPENROUTER_TITLE});if(process.env.OPENROUTER_REFERER)K.push({label:"OpenRouter referer",value:process.env.OPENROUTER_REFERER})}let _=dh();',
  'status OpenRouter details',
);

replaceExact(
  '["CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST","CLAUDE_CODE_USE_BEDROCK","CLAUDE_CODE_USE_VERTEX","CLAUDE_CODE_USE_FOUNDRY","ANTHROPIC_BASE_URL"',
  '["CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST","CLAUDE_CODE_USE_BEDROCK","CLAUDE_CODE_USE_VERTEX","CLAUDE_CODE_USE_FOUNDRY","CLAUDE_CODE_USE_OPENROUTER","ANTHROPIC_BASE_URL"',
  'managed env provider list',
);

replaceExact(
  '"ANTHROPIC_API_KEY","ANTHROPIC_AUTH_TOKEN","CLAUDE_CODE_OAUTH_TOKEN","AWS_BEARER_TOKEN_BEDROCK"',
  '"ANTHROPIC_API_KEY","ANTHROPIC_AUTH_TOKEN","CLAUDE_CODE_OAUTH_TOKEN","OPENROUTER_API_KEY","OPENROUTER_REFERER","OPENROUTER_TITLE","AWS_BEARER_TOKEN_BEDROCK"',
  'managed env auth list',
);

replaceExact(
  '"CLAUDE_CODE_SKIP_FOUNDRY_AUTH","CLAUDE_CODE_SKIP_VERTEX_AUTH","CLAUDE_CODE_SUBAGENT_MODEL","CLAUDE_CODE_USE_BEDROCK","CLAUDE_CODE_USE_FOUNDRY","CLAUDE_CODE_USE_VERTEX"',
  '"CLAUDE_CODE_SKIP_FOUNDRY_AUTH","CLAUDE_CODE_SKIP_VERTEX_AUTH","CLAUDE_CODE_SUBAGENT_MODEL","CLAUDE_CODE_USE_BEDROCK","CLAUDE_CODE_USE_FOUNDRY","CLAUDE_CODE_USE_OPENROUTER","CLAUDE_CODE_USE_VERTEX"',
  'safe env provider list',
);


replaceExact(
  'isEnabled:()=>!(i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY)||i6(process.env.DISABLE_FEEDBACK_COMMAND)',
  'isEnabled:()=>!(i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY)||i6(process.env.CLAUDE_CODE_USE_OPENROUTER)||i6(process.env.DISABLE_FEEDBACK_COMMAND)',
  'feedback disable on OpenRouter',
);

replaceExact(
  'if(YUK=!0,i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY))return;',
  'if(YUK=!0,i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY)||i6(process.env.CLAUDE_CODE_USE_OPENROUTER))return;',
  'preconnect skip on OpenRouter',
);

replaceExact(
  'if(i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY)||process.env.DISABLE_ERROR_REPORTING||iA())return;',
  'if(i6(process.env.CLAUDE_CODE_USE_BEDROCK)||i6(process.env.CLAUDE_CODE_USE_VERTEX)||i6(process.env.CLAUDE_CODE_USE_FOUNDRY)||i6(process.env.CLAUDE_CODE_USE_OPENROUTER)||process.env.DISABLE_ERROR_REPORTING||iA())return;',
  'error reporting skip on OpenRouter',
);

if (cli === original) {
  console.log('⚠ No changes made - runtime already patched or patterns changed');
  process.exit(1);
}

if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, original);
}
fs.writeFileSync(cliPath, cli);
console.log('✓ Patched cli.js with OpenRouter runtime support');
