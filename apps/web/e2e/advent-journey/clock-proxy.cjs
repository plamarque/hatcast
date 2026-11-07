// Dedicated socketpair protocol; data are only day numbers and acknowledgements.
const fs = require('node:fs')
const fd = Number(process.env.ADVENT_GUARDIAN_FD)
if (!Number.isInteger(fd) || fd < 3) throw new Error('Missing guardian channel')
function advance(day) {
  fs.writeSync(fd, JSON.stringify({op:'day',day})+'\n')
  const chunks = []
  const byte = Buffer.alloc(1)
  while (true) {
    if (fs.readSync(fd,byte,0,1,null)!==1) throw new Error('Guardian disconnected')
    if (byte[0]===10) break
    if (chunks.length >= 4096) throw new Error('Guardian reply too long')
    chunks.push(byte[0])
  }
  const reply=JSON.parse(Buffer.from(chunks).toString('utf8'))
  if (reply.status !== 'day' || reply.day !== day) throw new Error('Guardian refused clock request')
}
module.exports={advance}
if (require.main===module) for(let day=1;day<=26;day++) advance(day)
