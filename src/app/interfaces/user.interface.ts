import { Document } from 'mongoose';
import { UserRole, UserStatus } from '@/app/enums/user.enum';

export interface User extends Document {
    firstName: string;
    lastName?: string | null;
    email: string;
    password: string;
    systemRole: UserRole;
    settings?: UserSettings | null;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserSettings {
    timezone?: string;
}
