import test from 'node:test';import assert from 'node:assert/strict';import {sampleLogo,validateLogoText} from '../lib/logo-utils.mjs';
test('sample accepted',()=>assert.equal(validateLogoText(sampleLogo),sampleLogo));
test('non SVG rejected',()=>assert.throws(()=>validateLogoText('<html/>')));
test('oversize rejected',()=>assert.throws(()=>validateLogoText('<svg>'+ ' '.repeat(500001))));
test('external references rejected',()=>assert.throws(()=>validateLogoText('<svg><use href="https://example.com/a.svg"/></svg>')));
test('scripts rejected',()=>assert.throws(()=>validateLogoText('<svg><script>alert(1)</script></svg>')));
test('DTD rejected',()=>assert.throws(()=>validateLogoText('<svg><!DOCTYPE x></svg>')));
