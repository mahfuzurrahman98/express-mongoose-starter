import { autoInjectable } from 'tsyringe';
import { CreateCategoryRequestDTO, UpdateCategoryRequestDTO } from '@/app/dtos/category.dto';
import { CustomError } from '@/utils/custom-error';
import { CategoryModel, Category } from '@/app/models/category.model';

@autoInjectable()
export class CategoryService {
    async createCategory(data: CreateCategoryRequestDTO): Promise<Category> {
        try {
            const category = new CategoryModel(data);
            await category.save();
            return category;
        } catch (error: any) {
            throw new CustomError(500, `[CategoryService] ${error.message}`);
        }
    }

    async getCategoryById(id: string): Promise<Category> {
        try {
            const category = await CategoryModel.findById(id).exec();
            if (!category) {
                throw new CustomError(404, 'Category not found');
            }
            return category;
        } catch (error: any) {
            throw new CustomError(500, `[CategoryService] ${error.message}`);
        }
    }

    async getAllCategories(queryParams?: { name?: string }): Promise<Category[]> {
        try {
            const filter: any = {};
            if (queryParams?.name) {
                filter.name = { $regex: queryParams.name, $options: 'i' };
            }
            const categories = await CategoryModel.find(filter).sort({ createdAt: -1 }).exec();
            return categories;
        } catch (error: any) {
            throw new CustomError(500, `[CategoryService] ${error.message}`);
        }
    }

    async updateCategory({
        id,
        data,
    }: {
        id: string;
        data: UpdateCategoryRequestDTO;
    }): Promise<Category> {
        try {
            const category = await CategoryModel.findByIdAndUpdate(id, data, { new: true }).exec();
            if (!category) {
                throw new CustomError(404, 'Category not found');
            }
            return category;
        } catch (error: any) {
            throw new CustomError(500, `[CategoryService] ${error.message}`);
        }
    }

    async deleteCategory(id: string): Promise<void> {
        try {
            const category = await CategoryModel.findByIdAndDelete(id).exec();
            if (!category) {
                throw new CustomError(404, 'Category not found');
            }
        } catch (error: any) {
            throw new CustomError(500, `[CategoryService] ${error.message}`);
        }
    }
}
