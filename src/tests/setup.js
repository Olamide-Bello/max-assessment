const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            if (mongoose.connection.readyState === 1) {
                await mongoose.disconnect();
            }

            const mongoUri = 'mongodb://localhost:27018/test-db';
            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000
            });
            console.log('✅ Connected to test database');
            return;
        } catch (error) {
            console.log(`❌ Connection attempt ${i + 1} failed. Retrying in ${delay}ms...`);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

beforeAll(async () => {
    await connectDB();
}, 30000);

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
});

afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        await Promise.all(
            Object.values(collections).map(collection => collection.deleteMany({}))
        );
    }
});