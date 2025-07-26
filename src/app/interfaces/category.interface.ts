import { Document } from 'mongoose';

export interface Category {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
