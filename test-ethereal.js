// test-ethereal.js
// Script de test pour vérifier la connexion SMTP vers Ethereal

import nodemailer from 'nodemailer'

async function testEtherealConnection() {
  console.log('🧪 Test de connexion SMTP vers Ethereal...')
  
  // Configuration pour port 465 (SMTPS)
  const transporter465 = nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 465,
    secure: true, // true pour 465, false pour les autres ports
    auth: {
      user: 'burdette.bayer@ethereal.email',
      pass: 'cE5qzB6ZyF6v9vAFg'
    }
  })
  
  // Configuration pour port 587 (STARTTLS)
  const transporter587 = nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // false pour STARTTLS
    auth: {
      user: 'burdette.bayer@ethereal.email',
      pass: 'cE5qzB6ZyF6v9vAFg'
    }
  })
  
  try {
    console.log('📧 Test port 465 (SMTPS)...')
    await transporter465.verify()
    console.log('✅ Port 465 fonctionne !')
    
    // Test d'envoi
    const info465 = await transporter465.sendMail({
      from: 'HatCast Dev <burdette.bayer@ethereal.email>',
      to: 'test@example.com',
      subject: 'Test Ethereal Port 465',
      text: 'Test de connexion SMTP vers Ethereal sur le port 465'
    })
    
    console.log('📤 Email envoyé via port 465:', info465.messageId)
    
  } catch (error) {
    console.log('❌ Port 465 échoue:', error.message)
  }
  
  try {
    console.log('📧 Test port 587 (STARTTLS)...')
    await transporter587.verify()
    console.log('✅ Port 587 fonctionne !')
    
    // Test d'envoi
    const info587 = await transporter587.sendMail({
      from: 'HatCast Dev <burdette.bayer@ethereal.email>',
      to: 'test@example.com',
      subject: 'Test Ethereal Port 587',
      text: 'Test de connexion SMTP vers Ethereal sur le port 587'
    })
    
    console.log('📤 Email envoyé via port 587:', info587.messageId)
    
  } catch (error) {
    console.log('❌ Port 587 échoue:', error.message)
  }
}

testEtherealConnection().catch(console.error)
