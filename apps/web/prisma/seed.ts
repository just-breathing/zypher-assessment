import { execSync } from 'child_process';

async function main() {
  try {
    console.log('Running Prisma migrations...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    console.log('Prisma migrations completed successfully.');
  } catch (error) {
    console.error('Error running Prisma migrations:', error);
    process.exit(1);
  }
}

main();
