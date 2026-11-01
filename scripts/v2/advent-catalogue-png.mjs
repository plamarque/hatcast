import {inflateSync} from 'node:zlib';
const signature=Buffer.from([137,80,78,71,13,10,26,10]);
const channels={0:1,2:3,3:1,4:2,6:4};
const depths={0:[1,2,4,8,16],2:[8,16],3:[1,2,4,8],4:[8,16],6:[8,16]};
function crc32(bytes) { let crc=0xffffffff; for(const b of bytes) {crc^=b;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0; }
// Conservative: reject interlaced or animated images instead of accepting an image
// that has not been completely checked. No image bytes appear in errors.
export function validatePng(data) {
  const bad=()=>{throw Error('Invalid private portrait')};
  if (!Buffer.isBuffer(data)||data.length<57||data.length>5_000_000||!data.subarray(0,8).equals(signature)) bad();
  let off=8, width,height,depth,color,header=false,ended=false,palette=false,seenData=false,afterData=false;
  const chunks=[];
  while(off<data.length) {
    if(off+12>data.length) bad();
    const length=data.readUInt32BE(off); if(length>5_000_000||off+12+length>data.length) bad();
    const type=data.toString('ascii',off+4,off+8), body=data.subarray(off+8,off+8+length);
    if(!/^[A-Za-z]{4}$/.test(type)||crc32(data.subarray(off+4,off+8+length))!==data.readUInt32BE(off+8+length)) bad();
    if(!header && type!=='IHDR') bad();
    if(type==='IHDR') {
      if(header||length!==13) bad(); header=true;width=body.readUInt32BE(0);height=body.readUInt32BE(4);depth=body[8];color=body[9];
      if(!width||!height||width>8192||height>8192||!depths[color]?.includes(depth)||body[10]!==0||body[11]!==0||body[12]!==0) bad();
    } else if(type==='PLTE') {
      if(seenData||palette||!length||length%3||length>768||[0,4].includes(color)||(color===3&&length/3>2**depth)) bad();palette=true;
    } else if(type==='IDAT') {
      if(afterData||(color===3&&!palette)) bad();seenData=true;chunks.push(body);
    } else if(type==='IEND') {
      if(length!==0||!seenData||off+12!==data.length) bad();ended=true;
    } else {
      if(type==='acTL'||type==='fcTL'||type==='fdAT'||type[0]===type[0].toUpperCase()) bad();
      if(seenData) afterData=true;
    }
    off+=12+length;if(ended)break;
  }
  if(!ended) bad();
  const rowBytes=Math.ceil(width*channels[color]*depth/8), expected=(rowBytes+1)*height;
  if(expected>80_000_000) bad();
  let pixels;try{pixels=inflateSync(Buffer.concat(chunks),{maxOutputLength:expected});}catch{bad();}
  if(pixels.length!==expected) bad();for(let y=0;y<height;y++)if(pixels[y*(rowBytes+1)]>4)bad();
}
