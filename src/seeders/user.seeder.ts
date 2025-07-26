import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables from the .env file in the project root
const envPath = path.resolve(__dirname, '../../.env');
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

async function createAdminUser() {
    const admin = new UserModel({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: await hash('Admin@123#', 10),
        systemRole: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        settings: { timezone: 'UTC' },
    });
    await admin.save();
    console.log('✅ Admin user seeded: admin@example.com');
    return admin;
}

async function createRegularUsers(count = 5) {
    const users = [];
    for (let i = 0; i < count; i++) {
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
        users.push(user);
        console.log(`✅ Regular user seeded: ${user.email}`);
    }
    return users;
}

const seedUser = async () => {
    const connection = await connectMongo();
    try {
        const existing = await UserModel.countDocuments({}).exec();
        // if (existing > 0) {
        //     console.log('Users already exist, skipping seeding.');
        //     return;
        // }
        // await createAdminUser();
        await createRegularUsers(5);
    } catch (error: any) {
        console.error('❌ Error seeding user:', error);
        throw error;
    } finally {
        await connection.disconnect();
        console.log('MongoDB connection closed');
    }
};

seedUser().catch((err) => {
    console.error('❌ Error seeding user:', err);
});
