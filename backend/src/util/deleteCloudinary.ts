import cloudinary from '../config/cloudinaryConfig'

interface CloudinaryDeleteResponse {
    result: string
}

/**
 * Delete an image from Cloudinary given its public_id
 * @param publicId - The public ID of the image to delete
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        const response = (await cloudinary.uploader.destroy(publicId)) as CloudinaryDeleteResponse

        if (response.result === 'ok') {
            // Replace with a proper logger if available
            // logger.info('Image successfully deleted from Cloudinary');
        } else {
            throw new Error('Failed to delete image from Cloudinary')
        }
    } catch (error) {
        // Replace with a proper logger if available
        // logger.error('Error deleting image from Cloudinary', error);
        throw new Error(`Error deleting image from Cloudinary: ${(error as Error).message}`)
    }
}

/**
 * Extract the public_id from a Cloudinary URL
 * @param url - The Cloudinary image URL
 * @returns public_id - The Cloudinary public ID
 */
export const extractPublicIdFromCloudinaryUrl = (url: string): string => {
    const regex = /\/v\d+\/(.*?)(?:\.\w{3,4}$)/
    const match = url.match(regex)
    if (!match || match.length < 2) {
        throw new Error('Invalid Cloudinary URL')
    }
    return match[1]
}
