const mongoose = require('mongoose');

const uri = 'mongodb+srv://osamagivegh:990099@cluster0.npzs81o.mongodb.net/?appName=Cluster0';

async function checkUsers() {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;

        // Collection identified as 'users' in previous step
        const users = await db.collection('users').find({}).toArray();

        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- Username: ${u.username || 'N/A'}, Email: ${u.email}, Role: ${u.role}, Permissions: ${JSON.stringify(u.permissions || [])}`);
        });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
