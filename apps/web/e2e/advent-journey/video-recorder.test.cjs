const { test }=require('node:test')
const assert=require('node:assert/strict')
const {spawnSync}=require('node:child_process')
const fs=require('node:fs')
const os=require('node:os')
const path=require('node:path')
const {openEncoder}=require('./video-recorder.cjs')
test('large timestamp discontinuities cannot create hours of duplicate frames',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'advent-video-test-'))
 try {
  const source=spawnSync('ffmpeg',['-v','error','-f','lavfi','-i','color=c=red:s=32x32','-frames:v','1','-f','image2pipe','-vcodec','mjpeg','pipe:1'])
  assert.equal(source.status,0)
  const file=path.join(dir,'video.webm'), enc=openEncoder(file)
  // Represent 26 civil-day jumps without passing timestamps to the encoder.
  for(let day=1;day<=26;day++) await enc.frame(source.stdout)
  await enc.close()
  const probe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',file],{encoding:'utf8'})
  assert.equal(probe.status,0)
  assert.ok(Number(probe.stdout)>=12 && Number(probe.stdout)<=14)
 } finally { fs.rmSync(dir,{recursive:true,force:true}) }
})
