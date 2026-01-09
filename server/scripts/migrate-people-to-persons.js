/**
 * Migration Script - Transfer Family Tree Data
 * From: familytree database "people" collection (old)
 * To: test database "persons" collection (myfamily website)
 */

const mongoose = require('mongoose');

const SOURCE_URI = 'mongodb+srv://osamashaer66_db_user:990099@mawaddah.lh79hv8.mongodb.net/familytree?retryWrites=true&w=majority';
const TARGET_URI = 'mongodb+srv://osamashaer66_db_user:990099@mawaddah.lh79hv8.mongodb.net/test?retryWrites=true&w=majority';

async function migrate() {
    console.log('🚀 Starting migration from people -> persons...\n');

    // Connect to source
    console.log('📤 Connecting to source (familytree/people)...');
    const sourceConn = mongoose.createConnection(SOURCE_URI);
    await sourceConn.asPromise();

    // Connect to target  
    console.log('📥 Connecting to target (test/persons)...');
    const targetConn = mongoose.createConnection(TARGET_URI);
    await targetConn.asPromise();

    // Get source data
    const sourceData = await sourceConn.db.collection('people').find({}).toArray();
    console.log(`✓ Found ${sourceData.length} people in source\n`);

    if (sourceData.length === 0) {
        console.log('⚠️ No data to migrate');
        await sourceConn.close();
        await targetConn.close();
        return;
    }

    // Show names being migrated
    console.log('📋 Data to migrate:');
    sourceData.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.fullName} (Gen ${p.generation})${p.isRoot ? ' 👑' : ''}`);
    });
    console.log('');

    // Clear target collection first
    await targetConn.db.collection('persons').deleteMany({});
    console.log('🗑️ Cleared target persons collection');

    // Insert all data
    const result = await targetConn.db.collection('persons').insertMany(sourceData);
    console.log(`✅ Migrated ${result.insertedCount} persons\n`);

    // Verify
    const count = await targetConn.db.collection('persons').countDocuments();
    console.log(`✓ Verification: ${count} persons now in target database`);

    await sourceConn.close();
    await targetConn.close();
    console.log('\n🎉 Migration completed successfully!');
}

migrate().catch(err => {
    console.error('❌ Migration error:', err);
    process.exit(1);
});
