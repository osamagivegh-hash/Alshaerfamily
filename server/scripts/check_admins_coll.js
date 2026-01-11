const mongoose = require('mongoose');

const uri = 'mongodb+srv://osamagivegh:990099@cluster0.npzs81o.mongodb.net/?appName=Cluster0';

async function checkAdmins() {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;

        const admins = await db.collection('admins').find({}).toArray();
        console.log(`Admins Collection: ${admins.length} records`);

        admins.forEach(a => {
            console.log(`- Username: ${a.username}, Role: ${a.role}, Permissions: ${a.permissions}`);
        });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

checkAdmins();
