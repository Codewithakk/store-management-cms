import { Parser } from 'json2csv'
import logger from './logger'

export const exportToCSV = <T extends Record<string, unknown>>(data: T[]): string => {
    if (data.length === 0) {
        return ''
    }

    const fields = Object.keys(data[0])
    const opts = { fields }

    try {
        const parser = new Parser<T>(opts)
        return parser.parse(data)
    } catch (error) {
        logger.error('Error exporting to CSV', { error })
        throw new Error(`Failed to export to CSV: ${(error as Error).message}`)
    }
}
