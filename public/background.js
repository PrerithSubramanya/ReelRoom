import { supabase as sb } from '../src/supabase.js'

/**
 * Sends the current authentication state to all popup instances.
 * @param {object | null} session - The Supabase session object.
 */
async function sendAuthStateToPopups(session) {
  try {
    await chrome.runtime.sendMessage({
      type: 'AUTH_STATE_CHANGED',
      session: session,
    })
  } catch (error) {
    if (error.message.includes('Could not establish connection')) {
      // Popup not open, safe to ignore.
    } else {
      console.error('Error sending message:', error)
    }
  }
}

/**
 * Sends an error message to all popup instances.
 * @param {string} error - The error message to display.
 */
async function sendErrorToPopups(error) {
  try {
    await chrome.runtime.sendMessage({ type: 'ERROR', error: error })
  } catch {
    // Ignore if popup is not open
  }
}

/**
 * Handles the Google login flow using launchWebAuthFlow.
 */
async function handleLogin() {
  try {
    const manifest = chrome.runtime.getManifest()

    if (
      !manifest.oauth2 ||
      !manifest.oauth2.client_id ||
      manifest.oauth2.client_id === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
    ) {
      const errorMsg = 'Error: Missing or invalid "oauth2.client_id" in manifest.json.'
      sendErrorToPopups(errorMsg)
      console.error(errorMsg)
      return
    }

    // 1. Construct the Google Auth URL.
    const authUrl = new URL('https://accounts.google.com/o/oauth2/auth')
    const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org`

    authUrl.searchParams.set('client_id', manifest.oauth2.client_id)
    authUrl.searchParams.set('response_type', 'id_token')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', manifest.oauth2.scopes.join(' '))
    // Nonce has been removed to prevent mismatch errors in this flow.

    // 2. Launch the web auth flow.
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.href,
        interactive: true,
      },
      async (redirectedTo) => {
        if (chrome.runtime.lastError || !redirectedTo) {
          const errorMsg = chrome.runtime.lastError
            ? chrome.runtime.lastError.message
            : 'Login failed: The authentication process was cancelled.'
          console.error('Login failed:', errorMsg)
          sendErrorToPopups(errorMsg)
          return
        }

        try {
          // 3. Extract the ID token from the redirected URL.
          const url = new URL(redirectedTo)
          const params = new URLSearchParams(url.hash.substring(1))
          const id_token = params.get('id_token')

          if (!id_token) {
            const errorMsg = 'Login failed: ID token not found in redirect URL.'
            console.error(errorMsg)
            sendErrorToPopups(errorMsg)
            return
          }

          // 4. Sign in to Supabase with the ID token.
          // The nonce is not passed here, resolving the mismatch error.
          const { data, error } = await sb.auth.signInWithIdToken({
            provider: 'google',
            token: id_token,
          })

          if (error) {
            console.error('Supabase sign-in error:', error.message)
            sendErrorToPopups(`Supabase error: ${error.message}`)
            return
          }

          console.log('Successfully signed in:', data.session?.user?.email)
        } catch (e) {
          console.error('Error processing redirect URL:', e)
          sendErrorToPopups(`Login error: ${e.message}`)
        }
      },
    )
  } catch (err) {
    console.error('Login process setup error:', err.message)
    sendErrorToPopups(`Login setup failed: ${err.message}`)
  }
}

/**
 * Handles the logout flow.
 */
async function handleLogout() {
  const { error } = await sb.auth.signOut()
  if (error) {
    console.error('Supabase sign-out error:', error)
    sendErrorToPopups(`Logout failed: ${error.message}`)
  }
}

// --- Main Message Listener ---
chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'LOGIN':
      handleLogin()
      break
    case 'LOGOUT':
      handleLogout()
      break
    case 'GET_AUTH_STATE':
      sb.auth.getSession().then(({ data }) => {
        sendAuthStateToPopups(data.session)
      })
      break
  }
  // Don't return true since we're not sending a response
})

// --- Supabase Auth State Listener ---
sb.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event)
  sendAuthStateToPopups(session)
})
