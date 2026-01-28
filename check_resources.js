
const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function checkResources() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // We can't import the TS model directly in node script without ts-node, so we define a basic schema
        const resourceSchema = new mongoose.Schema({ title: String });
        const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);

        const count = await Resource.countDocuments();
        console.log(`Total Resources: ${count}`);

        if (count > 0) {
            const resources = await Resource.find().limit(5);
            console.log('Sample Resources:', JSON.stringify(resources, null, 2));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkResources();
