const mongoose = require('mongoose');
const net = require('net');

// Production URI
const uri = 'mongodb+srv://osamagivegh:990099@cluster0.npzs81o.mongodb.net/?appName=Cluster0';

async function checkPort(port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.on('error', () => {
            resolve(false);
        });
        socket.connect(port, '127.0.0.1');
    });
}

async function verifyState() {
    console.log('--- System Verification ---');

    // Check Server Port
    const serverUp = await checkPort(5000);
    console.log(`Server Port (5000): ${serverUp ? 'OPEN' : 'CLOSED'}`);

    // Check Database
    try {
        await mongoose.connect(uri);
        console.log('Database: Connected');
        const db = mongoose.connection.db;

        // List Collections
        const collections = await db.listCollections().toArray();
        const collNames = collections.map(c => c.name);
        console.log('Collections:', collNames.join(', '));

        // Check Persons
        const personsCount = await db.collection('persons').countDocuments();
        console.log(`Persons Count (Expected ~33): ${personsCount}`);

        // Check People (Old/Backup)
        const peopleCount = await db.collection('people').countDocuments();
        console.log(`People Count (Backup): ${peopleCount}`);

        // Check Admins
        const adminCollName = collNames.find(c => c.includes('admin') || c.includes('user')) || 'admins';
        const adminsCount = await db.collection(adminCollName).countDocuments();
        console.log(`Admins Count (${adminCollName}): ${adminsCount}`);

        // Find tree_editor
        const treeEditor = await db.collection(adminCollName).findOne({ username: 'tree_editor' });

        if (treeEditor) {
            console.log(`User 'tree_editor': EXISTS`);
            console.log(` - Role: ${treeEditor.role}`);
            console.log(` - Permissions: ${JSON.stringify(treeEditor.permissions || [])}`);
            console.log(` - ID: ${treeEditor._id}`);
        } else {
            console.log(`User 'tree_editor': MISSING`);
            // Check if default admin exists
            const admin = await db.collection(adminCollName).findOne({ username: 'admin' });
            console.log(`User 'admin' exists: ${!!admin}`);
        }

    } catch (e) {
        console.error('DB Error:', e.message);
    } finally {
        await mongoose.disconnect();
    }
    console.log('---------------------------');
}

verifyState();
