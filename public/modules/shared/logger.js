/**
 * Centralized logging utility for ReelRoom
 */
export class Logger {
  constructor(component) {
    this.component = component
    this.prefix = `🎬 ReelRoom[${component}]:`
  }

  log(message, ...args) {
    console.log(this.prefix, message, ...args)
  }

  error(message, ...args) {
    console.error(this.prefix, message, ...args)
  }

  warn(message, ...args) {
    console.warn(this.prefix, message, ...args)
  }

  debug(message, ...args) {
    console.debug(this.prefix, message, ...args)
  }

  info(message, ...args) {
    console.info(this.prefix, message, ...args)
  }
}
