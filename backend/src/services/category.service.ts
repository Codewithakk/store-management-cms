import { PrismaClient } from '@prisma/client'
import { generateSlug } from '../util/slugGenerator'

// Create a single Prisma client instance and reuse it
const prisma = new PrismaClient({
    log: ['error'] // Only log errors to reduce noise
})

// Cache for workspace existence checks
const workspaceCache = new Map<number, boolean>()

// Helper function to validate category name
const validateCategoryName = (name: any): name is string => {
    return typeof name === 'string' && name.trim().length > 0
}

// Helper function to generate slug

// Helper function to check workspace existence with caching
const checkWorkspaceExists = async (workspaceId: number): Promise<void> => {
    if (workspaceCache.has(workspaceId)) return

    const exists = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true } // Only select the ID to minimize data transfer
    })

    if (!exists) {
        throw new Error('Workspace not found')
    }

    workspaceCache.set(workspaceId, true)
}

// Category Service
export const categoryService = {
    // Create Category
    createCategory: async (workspaceId: number, data: { name: string;[key: string]: any }) => {
        try {
            // Validate category name
            if (!validateCategoryName(data.name)) {
                throw new Error('Invalid category name')
            }

            // Check if workspace exists
            await checkWorkspaceExists(workspaceId)

            // Check for existing category by name (not just slug)
            const existingCategory = await prisma.category.findFirst({
                where: {
                    name: data.name,
                    workspaceId
                }
            })

            if (existingCategory) {
                throw new Error('Category with this name already exists in the workspace')
            }

            // Generate slug
            const slugBase = generateSlug(data.name)
            let uniqueSlug = slugBase
            let attempt = 0

            while (attempt < 5) {
                const slugExists = await prisma.category.findFirst({
                    where: { slug: uniqueSlug, workspaceId }
                })

                if (!slugExists) break

                uniqueSlug = `${slugBase}-${Math.random().toString(36).substring(2, 8)}`
                attempt++
            }

            if (attempt === 5) {
                throw new Error('Failed to generate a unique slug after multiple attempts')
            }

            // Create new category
            return await prisma.category.create({
                data: {
                    ...data,
                    workspaceId,
                    slug: uniqueSlug
                }
            })
        } catch (error: any) {
            console.error('Error creating category:', error.message)
            throw error
        }
    },

    // Get Categories in a Workspace (optimized query)
    getCategoriesInWorkspace: async (workspaceId: number) => {
        try {
            await checkWorkspaceExists(workspaceId)

            // Use select to only get the fields we need
            return await prisma.category.findMany({
                where: { workspaceId },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    // parentId: true,
                    workspaceId: true,
                    // children: {
                    //   select: {
                    //     id: true,
                    //     name: true,
                    //     slug: true,
                    //   },
                    // },
                    products: {
                        select: {
                            id: true,
                            name: true,
                            images: true,
                            variants: {
                                select: {
                                    id: true,
                                    title: true,
                                    sku: true,
                                    price: true,
                                    stock: true,
                                    weight: true,
                                    dimensions: true,
                                    color: true,
                                    size: true,
                                    isAvailable: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    name: 'asc' // Consistent ordering
                }
            })
        } catch (error: any) {
            console.error('Error fetching categories:', error.message)
            throw error
        }
    },

    // Update Category (optimized)
    updateCategory: async (categoryId: string, workspaceId: number, data: Partial<{ name: string; description?: string }>) => {
        try {
            // Check for duplicate name (case-insensitive) in the same workspace, excluding the current category
            if (data.name) {
                const existingCategory = await prisma.category.findFirst({
                    where: {
                        name: { equals: data.name, mode: 'insensitive' },
                        workspaceId,
                        NOT: { id: categoryId }
                    }
                })

                if (existingCategory) {
                    throw new Error('Another category with this name already exists in the Store')
                }
            }

            // Regenerate slug if name is updated
            const updateData = data.name ? { ...data, slug: generateSlug(data.name) } : data

            // Attempt update
            const updated = await prisma.category.updateMany({
                where: {
                    id: categoryId,
                    workspaceId
                },
                data: updateData
            })

            if (updated.count === 0) {
                throw new Error(`Category with ID ${categoryId} not found in workspace ${workspaceId}`)
            }

            // Return updated category
            return await prisma.category.findUnique({
                where: { id: categoryId }
            })
        } catch (error: any) {
            console.error('Error updating category:', error.message)
            throw error
        }
    },
    deleteCategory: async (categoryId: string, workspaceId: number) => {
        try {
            // Check if any products are linked to this category
            const linkedProductsCount = await prisma.product.count({
                where: {
                    categoryId,
                    workspaceId
                }
            })

            if (linkedProductsCount > 0) {
                throw new Error(
                    `Cannot delete category. It is associated with ${linkedProductsCount} product(s). Please remove or reassign them first.`
                )
            }

            // Safe to delete if no products are linked
            const deleted = await prisma.category.deleteMany({
                where: {
                    id: categoryId,
                    workspaceId
                }
            })

            if (deleted.count === 0) {
                throw new Error(`Category with ID ${categoryId} not found in workspace ${workspaceId}`)
            }

            return {
                success: true,
                message: `Category with ID ${categoryId} deleted successfully.`
            }
        } catch (error: any) {
            console.error('Error deleting category:', error.message)
            throw error
        }
    }
}

// Optional: Add cleanup for the Prisma client on process exit
process.on('beforeExit', async () => {
    await prisma.$disconnect()
})
