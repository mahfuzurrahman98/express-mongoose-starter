import { infer as zInfer } from 'zod';
import { Types, Document } from 'mongoose';
import { postListQueryParamsSchema } from '@/app/schemas/post.schema';

export interface Post extends Document {
    title: string;
    content: string;
    tags?: string[];
    categoryId: Types.ObjectId;
    userId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface PostList {
    id: string;
    title: string;
    tags: string[];
    category: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName?: string;
    };
}

export interface PostWithDetails {
    id: string;
    title: string;
    content: string;
    tags: string[];
    category: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface PostListQueryParams extends zInfer<typeof postListQueryParamsSchema> {}
