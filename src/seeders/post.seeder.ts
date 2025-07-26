import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables from the .env file in the project root
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
config({ path: envPath });

console.log('Database URL is set:', process.env.DATABASE_URL);

import { connectMongo } from '@/app/data-source';
import { PostModel } from '@/app/models/post.model';
import { CategoryModel } from '@/app/models/category.model';
import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';

const USER_ID = '688460aa062baf41c5f2590d';
const POST_COUNT = 20;

const seedPosts = async () => {
    const connection = await connectMongo();
    try {
        // Fetch all categories for random assignment
        const categories = await CategoryModel.find({}).exec();
        if (!categories.length) {
            throw new Error('No categories found. Seed categories first.');
        }

        for (let i = 0; i < POST_COUNT; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const post = new PostModel({
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraphs(2),
                tags: faker.helpers.arrayElements(
                    [
                        'tech',
                        'life',
                        'business',
                        'travel',
                        'health',
                        'news',
                        'coding',
                        'startup',
                        'remote',
                        'productivity',
                    ],
                    faker.number.int({ min: 1, max: 3 }),
                ),
                categoryId: category._id,
                userId: new Types.ObjectId(USER_ID),
                createdAt: faker.date.past({ years: 1 }),
                updatedAt: new Date(),
            });
            await post.save();
            console.log(`✅ Post seeded: ${post.title}`);
        }
    } catch (error: any) {
        console.error('❌ Error seeding posts:', error);
        throw error;
    } finally {
        await connection.disconnect();
        console.log('MongoDB connection closed');
    }
};

seedPosts().catch((err) => {
    console.error('❌ Error in seeder:', err);
});
