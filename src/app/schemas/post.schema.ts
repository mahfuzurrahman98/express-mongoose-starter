import { object, string, array, nativeEnum } from 'zod';
import { PostSortBy, PostSortOrder } from '@/app/enums/post.enum';
import { Types } from 'mongoose';

export const createPostSchema = object({
    title: string().trim().min(1, 'Title is required'),
    content: string().min(1, 'Content is required'),
    tags: array(string().trim().min(1, 'Tag is required')).optional(),
    categoryId: string()
        .trim()
        .refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid category id',
        }),
});

export const postListQueryParamsSchema = object({
    q: string().trim().optional(),
    categoryId: string()
        .trim()
        .refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid category id',
        })
        .optional(),
    userId: string()
        .trim()
        .refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid user id',
        })
        .optional(),
    tags: array(string().trim()).optional(),
    myPosts: string().optional(),
    sortBy: nativeEnum(PostSortBy).optional(),
    sortOrder: nativeEnum(PostSortOrder).optional(),
    cursor: string().optional(),
    limit: string()
        .transform((val) => parseInt(val, 10))
        .optional(),
});

export const updatePostSchema = createPostSchema.partial();
