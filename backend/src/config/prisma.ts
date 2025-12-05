import { PrismaClient } from '@prisma/client';

// We keep a single PrismaClient instance for the entire backend.
// This avoids exhausting database connections and keeps the code simple.
export const prisma = new PrismaClient();
