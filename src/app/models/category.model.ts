import mongoose, { Schema } from 'mongoose';
import { Category } from '@/app/interfaces/category.interface';

const categorySchema: Schema<Category> = new Schema<Category>(
    {
        name: { type: String, required: true },
    },
    { timestamps: true },
);

export const CategoryModel = mongoose.model<Category>('Category', categorySchema);
