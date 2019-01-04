require('dotenv').config({silent: true})
const express = require('express')

const simpleOauthModule = require('simple-oauth2')
const randomstring = require('randomstring')
const oauth_provider = process.env.OAUTH_PROVIDER || 'github'
const login_auth_target = process.env.AUTH_TARGET || '_self'

const app = express()
const oauth2 = simpleOauthModule.create({
  client: {
    id: process.env.OAUTH_CLIENT_ID,
    secret: process.env.OAUTH_CLIENT_SECRET
  },
  auth: {
    // Supply GIT_HOSTNAME for enterprise github installs.
    tokenHost: process.env.GIT_HOSTNAME || 'https://github.com',
    tokenPath: process.env.OAUTH_TOKEN_PATH || '/login/oauth/access_token',
    authorizePath: process.env.OAUTH_AUTHORIZE_PATH || '/login/oauth/authorize'
  }
})

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: process.env.REDIRECT_URL,
  scope: process.env.SCOPES || 'repo,user',
  state: randomstring.generate(32)
})

// Initial page redirecting to Github
app.get('/auth', (req, res) => {
  console.log('called /auth - URL: ', authorizationUri)
  res.redirect(authorizationUri)
})

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', (req, res) => {
  console.log('called /callback', req.query.code)
  const code = req.query.code
  var options = {
    code: code
  }

  if (oauth_provider === 'gitlab') {
    options.client_id = process.env.OAUTH_CLIENT_ID
    options.client_secret = process.env.OAUTH_CLIENT_SECRET
    options.grant_type = 'authorization_code'
    options.redirect_uri = process.env.REDIRECT_URL
  }

  console.log('pre oauth2.authCode.getToken')
  oauth2.authorizationCode.getToken(options, (error, result) => {
    console.log('oauth2.authCode.getToken')
    let mess, content

    if (error) {
      console.error('Access Token Error', error.message)
      mess = 'error'
      content = JSON.stringify(error)
    } else {
      const token = oauth2.accessToken.create(result)
      mess = 'success'
      content = {
        token: token.token.access_token,
        provider: oauth_provider
      }
    }

    console.log('Oauth Message: ', mess, ' Content: ', content)
    const script = `
      <script>
        (function() {
          window.addEventListener("message", authorize, false)

          // Start handshare with parent
          console.log("Sending message: %o", "${oauth_provider}")
          window.opener.postMessage("authorizing:${oauth_provider}", "*")

          function authorize(e) {
            console.log("authorize %o", e)
            // send message to main window with da app
            window.opener.postMessage(
              'authorization:${oauth_provider}:${mess}:${JSON.stringify(content)}',
              e.origin
            )
          }
        })()
      </script>`

    return res.send(script)
  })
})

app.get('/success', (req, res) => {
  console.log('called /success')
  res.send('')
})

app.get('/', (req, res) => {
  res.send(`<script>
    console.log('hello there')
  </script>`)
})

module.exports = app
