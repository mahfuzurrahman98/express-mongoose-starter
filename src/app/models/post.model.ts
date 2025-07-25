import mongoose, { Schema, Document, Types } from 'mongoose';
import { UserRole } from '@/app/enums/user.enum';

export interface Post extends Document {
    title: string;
    content: string;
    tags?: string[];
    categoryId: Types.ObjectId;
    userId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema = new Schema<Post>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        tags: [{ type: String }],
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true },
);

export const PostModel = mongoose.model<Post>('Post', PostSchema);
