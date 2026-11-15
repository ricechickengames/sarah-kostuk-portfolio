import test from 'node:test';
import assert from 'node:assert/strict';
import {settings,cookies,validState,finish} from '../functions/_oauth.mjs';
test('OAuth fails closed without complete configuration',()=>{assert.throws(()=>settings({}));assert.throws(()=>settings({SITE_URL:'http://localhost'}));assert.throws(()=>settings({SITE_URL:'https://portfolio.pages.dev'}))});
test('OAuth state rejects missing, short and mismatched values',()=>{assert.equal(validState(undefined,undefined),false);assert.equal(validState('tiny','tiny'),false);assert.equal(validState('a'.repeat(64),'b'.repeat(64)),false);assert.equal(validState('a'.repeat(64),'a'.repeat(64)),true)});
test('Cookie parser isolates state cookie',()=>{assert.equal(cookies(new Request('https://example.com',{headers:{Cookie:'other=value; cms_oauth_state=abc=123'}})).cms_oauth_state,'abc=123')});
test('Callback pins origin and escapes script injection',async()=>{const result=finish('https://portfolio.pages.dev',{error:'</script><script>alert(1)</script>'});const body=await result.text();assert.ok(!body.includes('</script><script>'));assert.ok(body.includes('event.origin!==target'));assert.ok(body.includes('event.source!==window.opener'));assert.match(result.headers.get('Content-Security-Policy'),/default-src 'none'/);assert.match(result.headers.get('Set-Cookie'),/Max-Age=0/)});
