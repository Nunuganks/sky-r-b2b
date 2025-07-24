const { MongoClient } = require('mongodb');

async function updateMainImages() {
  const uri = process.env.DATABASE_URI || 'mongodb://localhost:27017/sky-r-b2b';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to database');

    const db = client.db();
    const products = db.collection('products');

    // Find all products that have imageGallery but no mainImage
    const productsToUpdate = await products.find({
      'imageGallery.0': { $exists: true },
      mainImage: { $exists: false }
    }).toArray();

    console.log(`Found ${productsToUpdate.length} products to update`);

    for (const product of productsToUpdate) {
      if (product.imageGallery && product.imageGallery.length > 0) {
        await products.updateOne(
          { _id: product._id },
          { $set: { mainImage: product.imageGallery[0].image } }
        );
        console.log(`Updated product ${product.sku} with main image`);
      }
    }

    console.log('Update completed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateMainImages(); 