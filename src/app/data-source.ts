import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

export class Database {
    static async connect(): Promise<void> {
        const dbUrl = process.env.DATABASE_URL || '';
        if (!dbUrl) {
            throw new Error('DATABASE_URL not set in environment variables');
        }
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as any); // Type assertion for options compatibility
        // You can add more connection event listeners/logging here if needed
    }

    static async disconnect(): Promise<void> {
        await mongoose.disconnect();
    }
}
