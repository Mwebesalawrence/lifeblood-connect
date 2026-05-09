import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Load .env file
import { config } from 'dotenv';
config();

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: 'npx tsx ./prisma/seed.ts',
  },
  migrate: {
    async development() {
      return {
        url: process.env.DATABASE_URL!,
      };
    },
  },
});