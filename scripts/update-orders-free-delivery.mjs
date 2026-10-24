import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('ERROR: MONGODB_URI environment variable is required to run this script.');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('rps_ecommerce');
  
  // 1. Update all existing orders
  const orders = await db.collection('orders').find({}).toArray();
  console.log(`Found ${orders.length} orders in MongoDB.`);
  for (const ord of orders) {
    const subtotal = (ord.items || []).reduce((acc, it) => acc + (it.totalPrice || it.unitPrice * it.quantity), 0);
    await db.collection('orders').updateOne(
      { _id: ord._id },
      {
        $set: {
          deliveryFee: 0,
          totalAmount: subtotal,
        },
      }
    );
    console.log(`Updated order ${ord.orderNumber || ord.id} -> deliveryFee: 0, totalAmount: ${subtotal}`);
  }

  // 2. Update settings doc
  await db.collection('settings').updateOne(
    { id: 'platform_config' },
    {
      $set: {
        flatDeliveryFeeINR: 0,
        minimumOrderValueForFreeDeliveryINR: 0,
      },
    },
    { upsert: true }
  );

  await client.close();
  console.log('Finished updating MongoDB orders and settings.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
