// Frames are encoded in arrival order at a fixed rate; system-clock timestamps are never used.
const { spawn } = require('node:child_process')
const { once } = require('node:events')
function openEncoder(output) {
  const proc = spawn('ffmpeg', ['-y','-hide_banner','-loglevel','error','-f','image2pipe','-framerate','2','-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libvpx','-deadline','realtime','-cpu-used','8','-pix_fmt','yuv420p',output], {stdio:['pipe','ignore','ignore']})
  let failure = null
  proc.on('error', () => { failure = new Error('Video encoder could not start') })
  proc.stdin.on('error', () => { failure = new Error('Video encoder input failed') })
  const ended = new Promise(resolve => proc.on('close', code => resolve(code)))
  return {
    async frame(bytes) {
      if (failure || proc.exitCode !== null) throw failure || new Error('Video encoder exited')
      if (!proc.stdin.write(bytes)) await Promise.race([once(proc.stdin,'drain'), ended.then(() => { throw new Error('Video encoder exited') })])
      if (failure) throw failure
    },
    async close() {
      proc.stdin.end()
      let timeout
      const status = await Promise.race([ended, new Promise((_,reject) => {timeout=setTimeout(()=>reject(new Error('Video finalization timed out')),30000)})]).finally(()=>clearTimeout(timeout))
      if (failure || status !== 0) throw failure || new Error('Video encoding failed')
    }
  }
}
function recordPage(page, output) {
  const encoder=openEncoder(output)
  let chain=Promise.resolve(), busy=false, stopped=false, failure=null
  const capture=(optional=false) => {
    if (stopped) return Promise.reject(new Error('Video recording stopped'))
    chain=chain.then(async () => {
      let frame
      try { frame=await page.screenshot({type:'jpeg',quality:72}) } catch (error) { if (optional) return; throw error }
      await encoder.frame(frame)
    })
    chain.catch(error => { failure=error })
    return chain
  }
  const timer=setInterval(() => {
    if (busy || stopped || failure) return
    busy=true
    capture(true).catch(()=>{}).finally(()=>{busy=false})
  },500)
  return {
    capture,
    async stop() {
      stopped=true; clearInterval(timer)
      try { await chain } finally { await encoder.close() }
      if (failure) throw failure
    }
  }
}
module.exports={openEncoder,recordPage}
