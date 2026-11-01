import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validatePng} from './advent-catalogue-png.mjs';
const valid=()=>Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==','base64');
test('validates a fictional PNG and rejects truncated, corrupt and non-PNG data',()=>{
 assert.doesNotThrow(()=>validatePng(valid()));
 const corrupt=valid();corrupt[corrupt.length-1]^=1;
 for(const bad of [valid().subarray(0,40),corrupt,Buffer.alloc(100),Buffer.concat([valid(),Buffer.from([1])])]) assert.throws(()=>validatePng(bad));
});

test('rejects an indexed palette exceeding its bit depth', async()=>{
 const {deflateSync}=await import('node:zlib');
 const crc32=(data)=>{let crc=0xffffffff;for(const b of data){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0};
 const chunk=(name,body)=>{const type=Buffer.from(name), out=Buffer.alloc(12+body.length);out.writeUInt32BE(body.length);type.copy(out,4);body.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([type,body])),8+body.length);return out};
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(1,0);ihdr.writeUInt32BE(1,4);ihdr[8]=1;ihdr[9]=3;
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('PLTE',Buffer.alloc(9)),chunk('IDAT',deflateSync(Buffer.from([0,0]))),chunk('IEND',Buffer.alloc(0))]);
 assert.throws(()=>validatePng(png));
});
