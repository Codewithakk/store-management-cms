import crypto from 'crypto'
import dotenv from 'dotenv'
import logger from './logger'

dotenv.config()

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY ?? '', 'utf-8')
const IV_LENGTH = 16

// Optional: Use a proper logger if needed, or remove this in production
if (process.env.NODE_ENV === 'development') {
  logger.debug('Encryption key length:', (process.env.ENCRYPTION_KEY ?? '').length) // Should be 32
}

export interface EncryptedPayload {
  iv: string
  encryptedData: string
}

export class CryptoHelper {
  static encrypt<T>(data: T): EncryptedPayload {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)

    const stringified = typeof data === 'string' ? data : JSON.stringify(data)

    let encrypted = cipher.update(stringified, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted
    }
  }

  static decrypt<T>(payload: EncryptedPayload): T {
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(payload.iv, 'hex'))

    let decrypted = decipher.update(payload.encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return JSON.parse(decrypted) as T
  }
}
