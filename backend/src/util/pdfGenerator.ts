import PDFDocument from 'pdfkit'
import { Buffer } from 'buffer'

export const generatePDF = (data: {
    orderId: string
    userEmail: string
    totalAmount: number
    status: string
    items: { variant: string; quantity: number; price: number }[]
    shippingAddress: string
    billingAddress: string
}): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 })
            const buffers: Buffer[] = []

            // Capture data stream
            doc.on('data', buffers.push.bind(buffers))
            doc.on('end', () => resolve(Buffer.concat(buffers)))
            doc.on('error', reject)

            // Document metadata
            doc.info.Title = `Invoice - ${data.orderId}`
            doc.info.Author = 'Your Company Name'
            doc.info.Subject = 'Order Invoice'

            // Header
            doc
                .fontSize(22)
                .font('Helvetica-Bold')
                .text('Invoice', { align: 'center' })
                .moveDown(1)

            // Order Info
            doc
                .fontSize(12)
                .font('Helvetica')
                .text(`Order ID: ${data.orderId}`)
                .text(`Customer Email: ${data.userEmail}`)
                .text(`Order Status: ${data.status}`)
                .text(`Total Amount: $${data.totalAmount.toFixed(2)}`)
                .moveDown(1.5)

            // Addresses
            doc.fontSize(14).font('Helvetica-Bold').text('Shipping Address:')
            doc.fontSize(12).font('Helvetica').text(data.shippingAddress).moveDown(1)

            doc.fontSize(14).font('Helvetica-Bold').text('Billing Address:')
            doc.fontSize(12).font('Helvetica').text(data.billingAddress).moveDown(1.5)

            // Divider
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1)

            // Items Section
            doc.fontSize(14).font('Helvetica-Bold').text('Order Items').moveDown(0.5)

            // Table Header
            doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .text('Variant', 50, doc.y, { width: 200 })
                .text('Quantity', 260, doc.y, { width: 100, align: 'right' })
                .text('Price', 400, doc.y, { width: 100, align: 'right' })
                .moveDown(0.5)

            doc.font('Helvetica').fontSize(11)

            // Table Rows
            data.items.forEach(item => {
                doc
                    .text(item.variant, 50, doc.y, { width: 200 })
                    .text(item.quantity.toString(), 260, doc.y, { width: 100, align: 'right' })
                    .text(`$${item.price.toFixed(2)}`, 400, doc.y, { width: 100, align: 'right' })
                    .moveDown(0.5)
            })

            // Divider
            doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).stroke().moveDown(2)

            // Footer
            doc
                .fontSize(10)
                .font('Helvetica-Oblique')
                .text('Thank you for your purchase!', { align: 'center' })

            doc.end()
        } catch (error) {
            reject(new Error(`PDF generation failed: ${error}`))
        }
    })
}