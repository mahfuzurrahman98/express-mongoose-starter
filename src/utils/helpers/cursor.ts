// cursor.utils.ts
import mongoose from 'mongoose';

export interface CursorData {
    createdAt: Date;
    id: string;
}

/**
 * Encodes cursor data (createdAt and id) into a base64 string
 * @param createdAt - The creation date of the post
 * @param id - The MongoDB ObjectId as string
 * @returns Base64 encoded cursor string
 */
export function encodeCursor(createdAt: Date, id: string): string {
    const cursorData: CursorData = {
        createdAt,
        id,
    };

    const jsonString = JSON.stringify(cursorData);
    return Buffer.from(jsonString, 'utf-8').toString('base64');
}

/**
 * Decodes a base64 cursor string back to cursor data
 * @param cursor - Base64 encoded cursor string
 * @returns Decoded cursor data with createdAt and id
 * @throws Error if cursor is invalid
 */
export function decodeCursor(cursor: string): CursorData {
    try {
        const jsonString = Buffer.from(cursor, 'base64').toString('utf-8');
        const cursorData = JSON.parse(jsonString) as CursorData;

        // Validate the decoded data
        if (!cursorData.createdAt || !cursorData.id) {
            throw new Error('Invalid cursor data structure');
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(cursorData.id)) {
            throw new Error('Invalid ObjectId in cursor');
        }

        // Ensure createdAt is a valid date
        const date = new Date(cursorData.createdAt);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date in cursor');
        }

        return {
            createdAt: date,
            id: cursorData.id,
        };
    } catch (error) {
        throw new Error(
            `Invalid cursor format: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
    }
}
