/**
 * Handles authentication logic for ReelRoom
 */
import { Logger } from '../shared/logger.js'
import { MESSAGE_TYPES } from '../shared/constants.js'
import { Utils } from '../shared/utils.js'

export class AuthManager {
  constructor(supabase) {
    this.supabase = supabase
    this.logger = new Logger('AuthManager')
    this.setupAuthListener()
  }

  /**
   * Setup Supabase auth state listener
   */
  setupAuthListener() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.logger.log('Auth state changed:', event)
      this.sendAuthStateToPopups(session)
      
      // Notify other components of auth state changes
      this.onAuthStateChange?.(event, session)
    })
  }

  /**
   * Handle login flow using Google OAuth
   */
  async handleLogin() {
    try {
      const manifest = chrome.runtime.getManifest()

      if (!this.validateOAuthConfig(manifest)) {
        return
      }

      const authUrl = this.buildAuthUrl(manifest)
      
      await this.launchAuthFlow(authUrl)
    } catch (err) {
      this.logger.error('Login process setup error:', err.message)
      this.sendErrorToPopups(`Login setup failed: ${err.message}`)
    }
  }

  /**
   * Handle logout flow
   */
  async handleLogout() {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        this.logger.error('Supabase sign-out error:', error)
        this.sendErrorToPopups(`Logout failed: ${error.message}`)
      }
    } catch (err) {
      this.logger.error('Logout error:', err)
      this.sendErrorToPopups(`Logout failed: ${err.message}`)
    }
  }

  /**
   * Get current auth state
   */
  async getAuthState() {
    try {
      const { data } = await this.supabase.auth.getSession()
      this.sendAuthStateToPopups(data.session)
    } catch (error) {
      this.logger.error('Error getting auth state:', error)
    }
  }

  /**
   * Validate OAuth configuration
   */
  validateOAuthConfig(manifest) {
    if (
      !manifest.oauth2 ||
      !manifest.oauth2.client_id ||
      manifest.oauth2.client_id === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
    ) {
      const errorMsg = 'Error: Missing or invalid "oauth2.client_id" in manifest.json.'
      this.sendErrorToPopups(errorMsg)
      this.logger.error(errorMsg)
      return false
    }
    return true
  }

  /**
   * Build Google OAuth URL
   */
  buildAuthUrl(manifest) {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/auth')
    const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org`

    authUrl.searchParams.set('client_id', manifest.oauth2.client_id)
    authUrl.searchParams.set('response_type', 'id_token')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', manifest.oauth2.scopes.join(' '))

    return authUrl
  }

  /**
   * Launch web auth flow
   */
  async launchAuthFlow(authUrl) {
    return new Promise((resolve, reject) => {
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
            this.logger.error('Login failed:', errorMsg)
            this.sendErrorToPopups(errorMsg)
            reject(new Error(errorMsg))
            return
          }

          try {
            await this.processAuthRedirect(redirectedTo)
            resolve()
          } catch (error) {
            this.logger.error('Error processing redirect URL:', error)
            this.sendErrorToPopups(`Login error: ${error.message}`)
            reject(error)
          }
        }
      )
    })
  }

  /**
   * Process authentication redirect
   */
  async processAuthRedirect(redirectedTo) {
    const url = new URL(redirectedTo)
    const params = new URLSearchParams(url.hash.substring(1))
    const id_token = params.get('id_token')

    if (!id_token) {
      throw new Error('ID token not found in redirect URL.')
    }

    const { data, error } = await this.supabase.auth.signInWithIdToken({
      provider: 'google',
      token: id_token,
    })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    this.logger.log('Successfully signed in:', data.session?.user?.email)
  }

  /**
   * Send auth state to popup instances
   */
  async sendAuthStateToPopups(session) {
    await Utils.safeSendMessage({
      type: MESSAGE_TYPES.AUTH.AUTH_STATE_CHANGED,
      session: session,
    })
  }

  /**
   * Send error to popup instances
   */
  async sendErrorToPopups(error) {
    await Utils.safeSendMessage({ 
      type: MESSAGE_TYPES.ERROR, 
      error: error 
    })
  }

  /**
   * Set auth state change callback
   */
  setAuthStateChangeCallback(callback) {
    this.onAuthStateChange = callback
  }
}
