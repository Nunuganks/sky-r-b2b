import { getPayload } from 'payload';
import configPromise from './src/payload.config.js';
import { fixCartSchema } from './fix-cart-schema.js';

async function runMigration() {
  try {
    console.log('Starting cart schema migration...');
    
    // First, try the direct database approach
    console.log('Attempting direct database fix...');
    await fixCartSchema();
    
    // Then, run Payload migrations to ensure everything is in sync
    console.log('Running Payload migrations...');
    const payload = await getPayload({
      config: configPromise,
    });
    
    // Generate and run migrations
    await payload.migrate();
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 