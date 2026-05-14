// gsc-auth.js — One-time OAuth2 authentication for Google Search Console
// Run once to generate and store your refresh token:
//   node gsc-auth.js
//
// After running this once, Hermes uses the stored token automatically.
// You should NOT need to run this again unless the token is revoked.

import 'dotenv/config'
import { google } from 'googleapis'
import { readFileSync, writeFileSync } from 'fs'
import * as readline from 'readline'

const CREDENTIALS_PATH = './oauth-credentials.json'
const TOKEN_PATH = './.gsc-token.json'
const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']

async function main() {
  // Load OAuth credentials
  let credentials
  try {
    credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'))
  } catch {
    console.error('❌ Could not read oauth-credentials.json')
    console.error('   Make sure the file is in the hermes directory')
    process.exit(1)
  }

  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force to get refresh token every time
  })

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Hermes GSC — One-Time Authentication')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('1. Open this URL in your browser:\n')
  console.log(authUrl)
  console.log('\n2. Sign in as gabriel@ibertisdesign.com')
  console.log('3. Grant access to Search Console')
  console.log('4. Copy the authorization code and paste it below\n')

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  rl.question('Paste the authorization code here: ', async (code) => {
    rl.close()

    try {
      const { tokens } = await oauth2Client.getToken(code.trim())
      oauth2Client.setCredentials(tokens)

      // Save tokens to file
      writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2))

      console.log('\n✅ Authentication successful!')
      console.log(`   Token saved to ${TOKEN_PATH}`)
      console.log('   Hermes will use this token automatically going forward.\n')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    } catch (err) {
      console.error('\n❌ Authentication failed:', err.message)
      console.error('   Try running gsc-auth.js again with a fresh code.')
      process.exit(1)
    }
  })
}

main()
