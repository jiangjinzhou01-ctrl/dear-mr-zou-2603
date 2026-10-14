import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
globalThis.matchMedia=()=>({matches:false});
const {tearPose}=await import('../src/motion/tokens.js');
const {copy}=await import('../src/content.js');
test('A complete pull clears every paper slice outside its original width',()=>{
 for(let i=0;i<6;i++){const start=tearPose(i,0,390,844),end=tearPose(i,1,390,844);assert.ok(start.x===0);assert.equal(start.opacity,1);assert.ok(Math.abs(end.x)>310);assert.ok(end.opacity<.000001);}
});
test('Touch progress is bounded, including unexpected range values',()=>{
 assert.deepEqual(tearPose(0,-1,320,568),tearPose(0,0,320,568));
 assert.deepEqual(tearPose(5,9,320,568),tearPose(5,1,320,568));
});
test('Every body and action has an English and Chinese counterpart',()=>{
 assert.deepEqual(Object.keys(copy.zh).sort(),Object.keys(copy.en).sort());
 for(const lang of Object.values(copy))for(const value of Object.values(lang))assert.ok(typeof value==='function'||(typeof value==='string'&&value.length>0));
});
test('The story has no remote runtime resources, and all anchors resolve',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.doesNotMatch(html,/(?:src|href)=["']https?:/);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(ids).size,ids.length);
 for(const match of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(match[1]),`Broken anchor: ${match[1]}`);
 assert.doesNotMatch(html,/[—–]/);
});
