import nodemailer, { SendMailOptions } from 'nodemailer'
import logger from './logger'

type SendEmailOptions = {
    to: string
    subject: string
    html: string
    pdfBuffer?: Buffer
    attachmentName?: string
}

const sendEmail = async ({ to, subject, html, pdfBuffer, attachmentName }: SendEmailOptions) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        // Define mailOptions with the correct type
        const mailOptions: SendMailOptions = {
            from: `"Backey Management" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        }

        if (pdfBuffer) {
            mailOptions.attachments = [
                {
                    filename: attachmentName || 'attachment.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        }

        const info = await transporter.sendMail(mailOptions)
        logger.info(`Email sent to ${to}: ${info.messageId}`)
        return info
    } catch (error) {
        logger.error('Error sending email:', error)
        throw new Error('Failed to send email')
    }
}

export default sendEmail
