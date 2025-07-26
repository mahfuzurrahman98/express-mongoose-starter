import mongoose, { Schema } from 'mongoose';
import { Post } from '@/app/interfaces/post.interface';

const postSchema: Schema<Post> = new Schema<Post>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        tags: [{ type: String }],
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true },
);

export const PostModel = mongoose.model<Post>('Post', postSchema);
