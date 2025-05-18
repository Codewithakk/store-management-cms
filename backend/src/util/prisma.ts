// // lib/prisma.ts
// import { PrismaClient } from '@prisma/client';
// // import { PrismaClient } from '../generated/prisma-client-js';

// const prisma = new PrismaClient();

// export default prisma;

// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });

// Extend Prisma Client to apply custom logic for `isAvailable` field
prisma.$extends({
    query: {
        productVariant: {
            async create({ args, query }) {
                if (args.data.stock === 0) {
                    args.data.isAvailable = false; // Set `isAvailable` to false if stock is 0
                }
                return query(args); // Proceed with the original query
            },
            async update({ args, query }) {
                if (args.data.stock === 0) {
                    args.data.isAvailable = false; // Set `isAvailable` to false if stock is 0
                }
                return query(args); // Proceed with the original query
            },
        },
    },
});

// Make sure prisma instance is reused in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
