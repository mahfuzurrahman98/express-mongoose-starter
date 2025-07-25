import mongoose, { Schema, Document } from 'mongoose';

export interface Category extends Document {
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema: Schema = new Schema<Category>(
    {
        name: { type: String, required: true },
    },
    { timestamps: true },
);

export const CategoryModel = mongoose.model<Category>('Category', CategorySchema);
