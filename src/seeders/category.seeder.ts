import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables from the .env file in the project root
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
config({ path: envPath });

console.log('Database URL is set:', process.env.DATABASE_URL);

import { connectMongo } from '@/app/data-source';
import { CategoryModel } from '@/app/models/category.model';

const categories = ['Technology', 'Lifestyle', 'Business', 'Travel', 'Health'];

const seedCategories = async () => {
    const connection = await connectMongo();
    try {
        const existing = await CategoryModel.countDocuments({}).exec();
        if (existing > 0) {
            console.log('Categories already exist, skipping seeding.');
            return;
        }
        for (const name of categories) {
            await CategoryModel.create({ name });
            console.log(`✅ Category seeded: ${name}`);
        }
    } catch (error: any) {
        console.error('❌ Error seeding categories:', error);
        throw error;
    } finally {
        await connection.disconnect();
        console.log('MongoDB connection closed');
    }
};

seedCategories().catch((err) => {
    console.error('❌ Error in seeder:', err);
});
