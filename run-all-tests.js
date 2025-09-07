#!/usr/bin/env node

/**
 * 🔍 Script pour exécuter tous les tests de debugging
 * Usage: node run-all-tests.js
 */

const { spawn } = require('child_process')

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
    console.log(`\n🚀 Running ${testFile}...`)
    console.log('='='='='='='='='='='='='='='='='='='='='='='='='='='='='='='='='=')
    
    const child = spawn('node', [testFile], {
      stdio: 'inherit',
      shell: true
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
