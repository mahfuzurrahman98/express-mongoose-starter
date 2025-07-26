import mongoose, { Schema } from 'mongoose';
import { UserRole, UserStatus } from '@/app/enums/user.enum';
import { User } from '@/app/interfaces/user.interface';

const userSchema: Schema<User> = new Schema<User>(
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

export const UserModel = mongoose.model<User>('User', userSchema);
