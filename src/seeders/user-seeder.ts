import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables from the .env file in the project root
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
config({ path: envPath });

// Log the DATABASE_URL to debug (remove sensitive info before committing)
console.log('Database URL is set:', process.env.DATABASE_URL);

// Import other dependencies after environment variables are loaded
import { connectMongo } from '@/app/data-source';
import { UserModel } from '@/app/models/user.model';
import { faker } from '@faker-js/faker';
import { hash } from 'bcrypt';
import { UserRole, UserStatus } from '@/app/enums/user.enum';

const seedUser = async () => {
    const connection = await connectMongo();
    try {
        // Avoid duplicating users on repeated seeds
        const existing = await UserModel.countDocuments({}).exec();
        if (existing > 0) {
            console.log('Users already exist, skipping seeding.');
            return;
        }

        const user = new UserModel({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: await hash('Asdf@123#', 10),
            systemRole: UserRole.USER,
            status: UserStatus.ACTIVE,
            settings: { timezone: 'UTC' },
        });

        await user.save();
        console.log('✅ User seeded successfully');
    } catch (error: any) {
        console.error('❌ Error seeding user:', error);
        throw error;
    } finally {
        await connection.disconnect();
        console.log('MongoDB connection closed');
    }
};

// seedUser().catch((err) => {
//     console.error('❌ Error seeding user:', err);
// });
