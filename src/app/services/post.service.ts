import { RequestUser } from '@/app/interfaces/auth.interface';
import { CreatePostRequestDTO, UpdatePostRequestDTO } from '@/app/dtos/post.dto';
import { CustomError } from '@/utils/custom-error';
import { PostListQueryParams, PostList, PostWithDetails } from '@/app/interfaces/post.interface';
import { CursorPaginationMeta } from '@/app/interfaces/common';
import { PostModel } from '@/app/models/post.model';
import { decodeCursor, encodeCursor } from '@/utils/helpers/cursor';
import { Types } from 'mongoose';
import { PostSortOrder } from '../enums/post.enum';

export class PostService {
    async createPost({
        user,
        data,
    }: {
        user: RequestUser;
        data: CreatePostRequestDTO;
    }): Promise<PostWithDetails> {
        try {
            const post = new PostModel({
                ...data,
                userId: user.id,
                tags: Array.isArray(data.tags) ? data.tags : [],
            });

            await post.save();

            return this.getPostById(post.id.toString());
        } catch (error: any) {
            throw new CustomError(500, `[PostService] ${error.message}`);
        }
    }

    async getPostById(id: string): Promise<PostWithDetails> {
        try {
            const pipeline = [
                { $match: { _id: new Types.ObjectId(id) } },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                { $unwind: '$category' },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: '$user' },
                {
                    $project: {
                        _id: 0,
                        id: '$_id',
                        title: 1,
                        content: 1,
                        tags: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        'category.id': '$category._id',
                        'category.name': 1,
                        'user.id': '$user._id',
                        'user.email': 1,
                        'user.firstName': 1,
                        'user.lastName': 1,
                    },
                },
            ];

            const posts = await PostModel.aggregate(pipeline);

            if (posts.length === 0) {
                throw new CustomError(404, 'Post not found');
            }

            return posts[0];
        } catch (error: any) {
            if (error instanceof CustomError) throw error;
            throw new CustomError(500, `[PostService] ${error.message}`);
        }
    }

    async getAllPosts({
        user,
        queryParams,
    }: {
        user: RequestUser;
        queryParams?: PostListQueryParams;
    }): Promise<{ posts: PostList[]; meta: CursorPaginationMeta }> {
        try {
            const limit = queryParams?.limit || 10;
            const cursor = queryParams?.cursor;

            // Build the filter object
            const filter: any = {};
            if (queryParams?.categoryId) {
                filter.categoryId = new Types.ObjectId(queryParams.categoryId);
            }
            if (queryParams?.myPosts) {
                filter.userId = new Types.ObjectId(user.id);
            } else if (queryParams?.userId) {
                filter.userId = new Types.ObjectId(queryParams.userId);
            }
            if (queryParams?.q) {
                filter.$or = [
                    { title: { $regex: queryParams.q, $options: 'i' } },
                    { content: { $regex: queryParams.q, $options: 'i' } },
                ];
            }
            if (
                queryParams?.tags &&
                Array.isArray(queryParams.tags) &&
                queryParams.tags.length > 0
            ) {
                // Match any of the tags
                filter.tags = { $in: queryParams.tags };
            }

            // Determine sort field and order
            let sort: Record<string, 1 | -1> = { createdAt: -1, _id: -1 };
            if (queryParams?.sortBy || queryParams?.sortOrder) {
                // Default to createdAt if not specified
                const sortField = queryParams.sortBy || 'createdAt';
                const sortDirection = queryParams.sortOrder === PostSortOrder.ASC ? 1 : -1;
                sort = { [sortField]: sortDirection, _id: sortDirection };
            }

            // Add cursor-based filtering
            if (cursor) {
                try {
                    const cursorData = decodeCursor(cursor);

                    // Filter for posts created before the cursor date, or
                    // posts created at the same time but with smaller ObjectId
                    filter.$or = [
                        { createdAt: { $lt: cursorData.createdAt } },
                        {
                            createdAt: cursorData.createdAt,
                            _id: { $lt: new Types.ObjectId(cursorData.id) },
                        },
                    ];

                    // If there were existing $or conditions (from search), combine them
                    if (queryParams?.q) {
                        filter.$and = [
                            {
                                $or: [
                                    { title: { $regex: queryParams.q, $options: 'i' } },
                                    { content: { $regex: queryParams.q, $options: 'i' } },
                                ],
                            },
                            {
                                $or: [
                                    { createdAt: { $lt: cursorData.createdAt } },
                                    {
                                        createdAt: cursorData.createdAt,
                                        _id: { $lt: new Types.ObjectId(cursorData.id) },
                                    },
                                ],
                            },
                        ];
                        delete filter.$or; // Remove the original $or since we're using $and now
                    }
                } catch (error) {
                    throw new CustomError(
                        400,
                        `Invalid cursor: ${
                            error instanceof Error ? error.message : 'Unknown error'
                        }`,
                    );
                }
            }

            const pipeline: any[] = [
                { $match: filter },
                { $sort: { createdAt: -1, _id: -1 } }, // Sort by createdAt desc, then _id desc
                { $limit: limit + 1 }, // Fetch one extra to check if there are more
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                { $unwind: '$category' },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: '$user' },
                {
                    $project: {
                        _id: 0,
                        id: '$_id',
                        title: 1,
                        content: 1,
                        tags: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        'category.id': '$category._id',
                        'category.name': '$category.name',
                        'user.id': '$user._id',
                        'user.email': '$user.email',
                        'user.firstName': '$user.firstName',
                        'user.lastName': '$user.lastName',
                    },
                },
            ];

            // For cursor pagination, total count is often not needed as it's expensive
            // But keeping it here if your frontend requires it
            const countFilter = { ...filter };
            if (countFilter.$and) {
                // For count, we don't need the cursor filtering
                countFilter.$and = countFilter.$and.filter(
                    (condition: any) =>
                        !condition.$or ||
                        !condition.$or.some((or: any) => or.createdAt || (or.createdAt && or._id)),
                );
                if (countFilter.$and.length === 1) {
                    Object.assign(countFilter, countFilter.$and[0]);
                    delete countFilter.$and;
                } else if (countFilter.$and.length === 0) {
                    delete countFilter.$and;
                }
            }

            const totalQuery = PostModel.countDocuments(countFilter);
            const postsQuery = PostModel.aggregate(pipeline);

            const [total, postsResult] = await Promise.all([totalQuery, postsQuery]);

            // Check if there are more posts
            const hasMore = postsResult.length > limit;
            const posts = hasMore ? postsResult.slice(0, limit) : postsResult;

            // Generate next cursor from the last post's createdAt and id
            const nextCursor =
                hasMore && posts.length > 0
                    ? encodeCursor(
                          posts[posts.length - 1].createdAt,
                          posts[posts.length - 1].id.toString(),
                      )
                    : undefined;

            const meta: CursorPaginationMeta = {
                total,
                hasMore,
                nextCursor,
            };

            return { posts, meta };
        } catch (error: any) {
            throw new CustomError(500, `[PostService] ${error.message}`);
        }
    }

    async updatePost({
        user,
        id,
        data,
    }: {
        user: RequestUser;
        id: string;
        data: UpdatePostRequestDTO;
    }): Promise<PostWithDetails> {
        try {
            const post = await PostModel.findOneAndUpdate(
                { _id: id, userId: user.id },
                { ...data, tags: Array.isArray(data.tags) ? data.tags : [] },
                { new: true },
            );

            if (!post) {
                throw new CustomError(404, 'Post not found');
            }

            return this.getPostById(post.id.toString());
        } catch (error: any) {
            if (error instanceof CustomError) throw error;
            throw new CustomError(500, `[PostService] ${error.message}`);
        }
    }

    async deletePost({ user, id }: { user: RequestUser; id: string }): Promise<void> {
        try {
            const post = await PostModel.findOneAndDelete({ _id: id, userId: user.id }).exec();
            if (!post) {
                throw new CustomError(404, 'Post not found');
            }
        } catch (error: any) {
            if (error instanceof CustomError) throw error;
            throw new CustomError(500, `[PostService] ${error.message}`);
        }
    }
}
