import { PrismaClient } from '../generated/client/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (typeof window === 'undefined') {
  prismaInstance = new PrismaClient();
} else {
  prismaInstance = {} as PrismaClient;
}

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
