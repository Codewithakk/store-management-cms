import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import httpError from '../../../util/httpError'

const prisma = new PrismaClient()

export const validateBillItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { billId } = req.params
    const { productId, quantity } = req.body

    try {
        // Validate the bill exists
        const bill = await prisma.bill.findUnique({
            where: { id: billId }
        })

        if (!bill) {
            httpError(next, Error('Bill not found'), req)
            return
        }

        // Validate product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        })

        if (!product) {
            httpError(next, Error('Product not found'), req)
            return
        }

        // Validate quantity
        if (quantity <= 0) {
            return httpError(next, Error('Quantity must be greater than 0'), req)
        }

        next()
    } catch (error) {
        res.status(500).json({ error: 'Validation failed' })
    }
}
