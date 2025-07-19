/**
 * Routes and handles all messages in the background script
 */
import { Logger } from '../shared/logger.js'

export class MessageRouter {
  constructor() {
    this.logger = new Logger('MessageRouter')
    this.handlers = new Map()
    this.setupMessageListener()
  }

  /**
   * Register a handler for a specific message type
   */
  registerHandler(type, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function')
    }
    
    this.handlers.set(type, handler)
    this.logger.log(`Handler registered for message type: ${type}`)
  }

  /**
   * Register multiple handlers at once
   */
  registerHandlers(handlerMap) {
    Object.entries(handlerMap).forEach(([type, handler]) => {
      this.registerHandler(type, handler)
    })
  }

  /**
   * Setup Chrome runtime message listener
   */
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender) => {
      this.handleMessage(message, sender)
      // Don't return true since we're not sending async responses
    })
  }

  /**
   * Handle incoming messages
   */
  async handleMessage(message, sender) {
    try {
      this.logger.log('Received message:', message.type || message.action, message)
      
      // Handle legacy message types (for backward compatibility)
      const messageType = message.type || message.action
      
      if (!messageType) {
        this.logger.warn('Message received without type or action:', message)
        return
      }

      const handler = this.handlers.get(messageType)
      
      if (!handler) {
        this.logger.warn(`No handler registered for message type: ${messageType}`)
        return
      }

      // Execute handler
      await handler(message, sender)
      
    } catch (error) {
      this.logger.error('Error handling message:', error)
    }
  }

  /**
   * Get registered handlers (for debugging)
   */
  getRegisteredHandlers() {
    return Array.from(this.handlers.keys())
  }

  /**
   * Remove a handler
   */
  removeHandler(type) {
    const removed = this.handlers.delete(type)
    if (removed) {
      this.logger.log(`Handler removed for message type: ${type}`)
    }
    return removed
  }

  /**
   * Clear all handlers
   */
  clearHandlers() {
    this.handlers.clear()
    this.logger.log('All handlers cleared')
  }
}
