import pg from 'pg';

const { Pool } = pg;

async function fixCartSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Checking current schema...');
    
    // Check if both columns exist
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'carts_items' 
      AND column_name IN ('product_id', 'product_id_id')
      ORDER BY column_name;
    `);
    
    const existingColumns = columnsResult.rows.map(row => row.column_name);
    console.log('Existing columns:', existingColumns);
    
    if (existingColumns.includes('product_id_id') && existingColumns.includes('product_id')) {
      console.log('Both columns exist. Dropping the duplicate product_id_id column...');
      
      // Drop the duplicate column
      await client.query(`
        ALTER TABLE carts_items DROP COLUMN product_id_id;
      `);
      
      console.log('Successfully dropped product_id_id column');
    } else if (existingColumns.includes('product_id_id') && !existingColumns.includes('product_id')) {
      console.log('Only product_id_id exists. Renaming to product_id...');
      
      // Rename the column
      await client.query(`
        ALTER TABLE carts_items RENAME COLUMN product_id_id TO product_id;
      `);
      
      console.log('Successfully renamed product_id_id to product_id');
    } else if (!existingColumns.includes('product_id_id') && existingColumns.includes('product_id')) {
      console.log('Only product_id exists. Schema is already correct.');
    } else {
      console.log('Neither column exists. This might be a new table.');
    }
    
    // Verify the final state
    const finalCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'carts_items' 
      AND column_name = 'product_id';
    `);
    
    if (finalCheck.rows.length > 0) {
      console.log('✅ Schema fix completed successfully. product_id column is now correct.');
    } else {
      console.log('❌ product_id column not found after fix. Please check the schema manually.');
    }
    
    client.release();
  } catch (error) {
    console.error('Error fixing cart schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  fixCartSchema()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { fixCartSchema }; 