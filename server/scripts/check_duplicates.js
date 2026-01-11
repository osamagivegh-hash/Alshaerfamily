const mongoose = require('mongoose');

// Use the production URI
const uri = 'mongodb+srv://osamagivegh:990099@cluster0.npzs81o.mongodb.net/?appName=Cluster0';

async function checkDuplicates() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const db = mongoose.connection.db;
        const persons = await db.collection('persons').find({}).toArray();
        console.log('Total persons:', persons.length);

        // Check for exact duplicates
        const nameCounts = {};
        persons.forEach(p => {
            nameCounts[p.fullName] = (nameCounts[p.fullName] || 0) + 1;
        });

        const duplicates = Object.keys(nameCounts).filter(name => nameCounts[name] > 1);

        if (duplicates.length > 0) {
            console.log('Duplicates found:', duplicates.map(name => `${name} (${nameCounts[name]})`).join(', '));
        } else {
            console.log('No exact duplicates found by full name.');
        }

        // Check for "برهم"
        const barham = persons.filter(p => p.fullName && p.fullName.includes('برهم'));
        if (barham.length > 0) {
            console.log('\nEntries containing "برهم":');
            barham.forEach(p => {
                console.log(`- ${p.fullName} (ID: ${p._id}, FatherID: ${p.fatherId})`);
            });
        } else {
            console.log('\nNo entries found containing "برهم"');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDuplicates();
