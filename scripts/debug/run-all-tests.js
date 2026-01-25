#!/usr/bin/env node

/**
 * 🔍 Script pour exécuter tous les tests de debugging
 * Usage: node scripts/debug/run-all-tests.js (depuis la racine du repo)
 */

const path = require('path')
const { spawn } = require('child_process')

const DEBUG_DIR = __dirname
const ROOT_DIR = path.resolve(__dirname, '..', '..')

const tests = [
  'test-production-token.js',
  'test-firebase-imports.js',
  'test-cors-config.js',
  'test-cloud-functions.js',
  'test-email-system.js',
  'test-authentication.js',
  'test-general-config.js',
  'monitor-password-reset-errors.js'
]

function runTest(testFile) {
  return new Promise((resolve, reject) => {
    const testPath = path.join(DEBUG_DIR, testFile)
    console.log(`\n🚀 Running ${testFile}...`)
    console.log('='.repeat(60))
    
    const child = spawn('node', [testPath], {
      stdio: 'inherit',
      shell: true,
      cwd: ROOT_DIR
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testFile} completed successfully`)
        resolve()
      } else {
        console.log(`❌ ${testFile} failed with code ${code}`)
        reject(new Error(`Test failed: ${testFile}`))
      }
    })
    
    child.on('error', (err) => {
      console.log(`❌ Error running ${testFile}:`, err.message)
      reject(err)
    })
  })
}

async function runAllTests() {
  console.log('🔍 Running comprehensive password reset debugging tests...')
  console.log('🔍 Environment: production')
  console.log('🔍 Project: impro-selector')
  console.log('🔍 Timestamp:', new Date().toISOString())
  
  for (const test of tests) {
    try {
      await runTest(test)
    } catch (error) {
      console.log(`⚠️ ${test} failed, continuing with other tests...`)
    }
  }
  
  console.log('\n✅ All tests completed!')
}

// Main execution
runAllTests().catch(error => {
  console.error('❌ CRITICAL ERROR:', error)
  process.exit(1)
})
