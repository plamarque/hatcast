const {test}=require('node:test')
const assert=require('node:assert/strict')
const {chromium}=require('@playwright/test')
const {spawnSync}=require('node:child_process')
const fs=require('node:fs'),os=require('node:os'),path=require('node:path')
const {recordPage}=require('./video-recorder.cjs')
test('real browser renders 26 distinct screens into a bounded video',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'advent-video-browser-'))
 const browser=await chromium.launch({headless:true})
 try {
  const page=await browser.newPage({viewport:{width:320,height:400}})
  const file=path.join(dir,'video.webm'), rec=recordPage(page,file)
  for(let day=1;day<=26;day++) {
   await page.setContent(`<main style="font-size:90px">${day}</main>`)
   await rec.capture()
  }
  await rec.stop()
  const probe=spawnSync('ffprobe',['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=nb_read_frames:format=duration','-of','json',file],{encoding:'utf8'})
  assert.equal(probe.status,0)
  const data=JSON.parse(probe.stdout), frames=Number(data.streams[0].nb_read_frames)
  assert.ok(frames>=26 && frames<45,`frames ${frames}`)
  assert.ok(Number(data.format.duration)<23)
  const hashes=spawnSync('ffmpeg',['-v','error','-i',file,'-f','framemd5','-'],{encoding:'utf8'})
  assert.equal(hashes.status,0)
  const distinct=new Set(hashes.stdout.split('\n').filter(line=>line && !line.startsWith('#')).map(line=>line.split(',').at(-1).trim()))
  assert.ok(distinct.size>=26,`distinct ${distinct.size}`)
 } finally {await browser.close();fs.rmSync(dir,{recursive:true,force:true})}
})
