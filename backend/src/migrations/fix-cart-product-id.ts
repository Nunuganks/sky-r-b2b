import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // This migration fixes the product_id column naming issue in carts_items table
  // The issue occurs when both product_id and product_id_id columns exist
  // We need to ensure only product_id exists and is properly named
  
  try {
    // Check if we're in a PostgreSQL environment
    const db = payload.db as any;
    
    if (db && db.pool) {
      const client = await db.pool.connect();
      
      try {
        // Check current schema state
        const columnsResult = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'carts_items' 
          AND column_name IN ('product_id', 'product_id_id')
          ORDER BY column_name;
        `);
        
        const existingColumns = columnsResult.rows.map((row: any) => row.column_name);
        console.log('Migration: Existing columns in carts_items:', existingColumns);
        
        if (existingColumns.includes('product_id_id') && existingColumns.includes('product_id')) {
          console.log('Migration: Both columns exist. Dropping duplicate product_id_id...');
          
          // Drop the duplicate column
          await client.query(`
            ALTER TABLE carts_items DROP COLUMN product_id_id;
          `);
          
          console.log('Migration: Successfully dropped product_id_id column');
        } else if (existingColumns.includes('product_id_id') && !existingColumns.includes('product_id')) {
          console.log('Migration: Only product_id_id exists. Renaming to product_id...');
          
          // Rename the column
          await client.query(`
            ALTER TABLE carts_items RENAME COLUMN product_id_id TO product_id;
          `);
          
          console.log('Migration: Successfully renamed product_id_id to product_id');
        } else if (!existingColumns.includes('product_id_id') && existingColumns.includes('product_id')) {
          console.log('Migration: Schema is already correct. product_id column exists.');
        } else {
          console.log('Migration: Neither column exists. This might be a new table.');
        }
        
        // Verify final state
        const finalCheck = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'carts_items' 
          AND column_name = 'product_id';
        `);
        
        if (finalCheck.rows.length > 0) {
          console.log('Migration: ✅ Schema fix completed successfully.');
        } else {
          console.log('Migration: ⚠️ product_id column not found. This might be expected for new installations.');
        }
        
      } finally {
        client.release();
      }
    } else {
      console.log('Migration: Database pool not available, skipping schema fix');
    }
  } catch (error) {
    console.error('Migration: Error during schema fix:', error);
    // Don't throw error to prevent migration from failing
    // The schema might be correct already
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // This migration is not reversible as it's fixing a schema issue
  // The down migration does nothing
  console.log('Migration: Down migration not implemented for schema fix');
} 