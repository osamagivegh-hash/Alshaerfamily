/**
 * Migration Script - Transfer Family Tree Data
 * From: familytree database (mawaddah cluster)
 * To: myfamily website database
 * 
 * Run this script to migrate your existing family tree data
 */

const mongoose = require('mongoose');

// Source database connection (old familytree project)
const SOURCE_URI = 'mongodb+srv://osamashaer66_db_user:990099@mawaddah.lh79hv8.mongodb.net/familytree?retryWrites=true&w=majority&appName=Mawaddah';

// Target database connection (myfamily website - update this if different)
// You need to set this to your myfamily database URI
const TARGET_URI = process.env.MONGODB_URI || 'mongodb+srv://osamashaer66_db_user:990099@mawaddah.lh79hv8.mongodb.net/test?retryWrites=true&w=majority&appName=Mawaddah';

// Person Schema (same structure for both)
const personSchema = new mongoose.Schema({
    fullName: String,
    nickname: String,
    fatherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    motherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    generation: Number,
    gender: String,
    birthDate: String,
    deathDate: String,
    isAlive: Boolean,
    birthPlace: String,
    currentResidence: String,
    occupation: String,
    biography: String,
    notes: String,
    profileImage: String,
    siblingOrder: Number,
    isRoot: Boolean,
    contact: Object,
    verification: Object,
    createdBy: String,
    createdAt: Date,
    updatedAt: Date
}, { timestamps: true });

async function migrateData() {
    console.log('🚀 Starting Family Tree Data Migration...\n');

    // Connect to source database
    console.log('📤 Connecting to source database (familytree)...');
    const sourceConn = await mongoose.createConnection(SOURCE_URI);
    const SourcePerson = sourceConn.model('Person', personSchema);

    // Get all persons from source
    const sourcePersons = await SourcePerson.find({}).lean();
    console.log(`✓ Found ${sourcePersons.length} persons in source database\n`);

    if (sourcePersons.length === 0) {
        console.log('⚠️ No data found in source database. Nothing to migrate.');
        await sourceConn.close();
        process.exit(0);
    }

    // Show data to be migrated
    console.log('📋 Data to be migrated:');
    sourcePersons.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.fullName} (Gen ${p.generation})${p.isRoot ? ' 👑 Root' : ''}`);
    });
    console.log('');

    // Connect to target database
    console.log('📥 Connecting to target database (myfamily)...');
    const targetConn = await mongoose.createConnection(TARGET_URI);
    const TargetPerson = targetConn.model('Person', personSchema);

    // Check if target already has data
    const existingCount = await TargetPerson.countDocuments();
    if (existingCount > 0) {
        console.log(`⚠️ Target database already has ${existingCount} persons.`);
        console.log('   Skipping migration to avoid duplicates.');
        console.log('   If you want to force migration, clear the target collection first.\n');
        await sourceConn.close();
        await targetConn.close();
        process.exit(0);
    }

    // Build ID mapping for reference preservation
    console.log('🔄 Migrating data...');
    const idMap = new Map();

    // First pass: Create all documents with new IDs
    const newPersons = sourcePersons.map(person => {
        const newId = new mongoose.Types.ObjectId();
        idMap.set(person._id.toString(), newId);
        return {
            ...person,
            _id: newId,
            fatherId: person.fatherId, // Will be updated in second pass
            motherId: person.motherId  // Will be updated in second pass
        };
    });

    // Second pass: Update father/mother references
    newPersons.forEach(person => {
        if (person.fatherId) {
            const newFatherId = idMap.get(person.fatherId.toString());
            if (newFatherId) {
                person.fatherId = newFatherId;
            }
        }
        if (person.motherId) {
            const newMotherId = idMap.get(person.motherId.toString());
            if (newMotherId) {
                person.motherId = newMotherId;
            }
        }
    });

    // Insert into target database
    try {
        await TargetPerson.insertMany(newPersons);
        console.log(`✅ Successfully migrated ${newPersons.length} persons!\n`);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        await sourceConn.close();
        await targetConn.close();
        process.exit(1);
    }

    // Verify migration
    const verifyCount = await TargetPerson.countDocuments();
    console.log(`✓ Verification: ${verifyCount} persons now in target database`);

    // Close connections
    await sourceConn.close();
    await targetConn.close();

    console.log('\n🎉 Migration completed successfully!');
    console.log('   Your family tree data is now available in the integrated website.');
}

// Run migration
migrateData().catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
});
