import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, UserStatus } from '@/app/enums/user.enum';
import { UserSettings } from '@/app/interfaces/user.interface';

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

const UserSchema: Schema = new Schema<User>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        systemRole: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
        settings: { type: Schema.Types.Mixed },
        status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    },
    { timestamps: true },
);

export const UserModel = mongoose.model<User>('User', UserSchema);
