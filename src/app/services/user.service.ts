import { CustomError } from '@/utils/custom-error';
import { RequestUser } from '@/app/interfaces/auth.interface';
import { UserProfileSettingsRequestDTO } from '@/app/dtos/user.dto';
import { UserSettings } from '@/app/interfaces/user.interface';
import { autoInjectable } from 'tsyringe';
import { UserModel, User } from '@/app/models/user.model';

@autoInjectable()
export class UserService {
    /**
     * Gets a user by ID.
     *
     * @param {string} id - The user ID
     * @returns {Promise<RequestUser | null>} The user
     */
    async getUserById(id: string): Promise<RequestUser | null> {
        try {
            const user = await UserModel.findById(id).exec();
            if (!user) {
                return null;
            }

            return {
                id: user.id.toString(),
                email: user.email,
                firstName: user.firstName || '',
                lastName: user.lastName || undefined,
                systemRole: user.systemRole,
                status: user.status,
                settings: user.settings || undefined,
            } as RequestUser;
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError(500, `[userService_getUserById]: ${error.message}`);
        }
    }

    /**
     * Gets a user by email.
     *
     * @param {string} email - The user email
     * @returns {Promise<RequestUser | null>} The user
     */
    async getUserByEmail(email: string): Promise<RequestUser | null> {
        try {
            const user = await UserModel.findOne({ email }).exec();
            if (!user) {
                return null;
            }
            return {
                id: user.id.toString(),
                email: user.email,
                firstName: user.firstName || '',
                lastName: user.lastName || undefined,
                systemRole: user.systemRole,
                status: user.status,
                settings: user.settings || undefined,
            } as RequestUser;
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError(500, `[userService_getUserByEmail]: ${error.message}`);
        }
    }

    /**
     * Gets a user profile.
     *
     * @param {Object} params - The parameters for the getUserProfile operation
     * @param {RequestUser} params.currentUser - The current user
     * @param {string} params.id - The user ID
     * @returns {Promise<UserProfileSettingsRequestDTO>} The user profile
     */
    async getUserProfile({
        currentUser,
        id,
    }: {
        currentUser: RequestUser;
        id: string;
    }): Promise<UserProfileSettingsRequestDTO> {
        try {
            const user = await UserModel.findById(id).exec();
            if (!user) {
                throw new CustomError(404, 'User not found');
            }
            let userSettings: UserSettings = { timezone: '' };
            const dbSettings = user.settings;
            if (dbSettings) {
                userSettings = { timezone: dbSettings.timezone };
            }
            const profile: UserProfileSettingsRequestDTO = {
                firstName: user.firstName || '',
                lastName: user.lastName || undefined,
                settings: userSettings,
            };
            return profile;
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError(500, `[userService_getUserProfile]: ${error.message}`);
        }
    }

    /**
     * Updates a user profile.
     *
     * @param {Object} params - The parameters for the updateUserProfile operation
     * @param {RequestUser} params.currentUser - The current user
     * @param {string} params.id - The user ID
     * @param {UserProfileSettingsRequestDTO} params.data - The user profile data
     * @returns {Promise<UserProfileSettingsRequestDTO>} The updated user profile
     */
    async updateUserProfile(
        currentUser: RequestUser,
        id: string,
        data: UserProfileSettingsRequestDTO,
    ): Promise<UserProfileSettingsRequestDTO> {
        try {
            const user = await UserModel.findById(id).exec();
            if (!user) {
                throw new CustomError(404, 'User not found');
            }
            user.firstName = data.firstName;
            user.lastName = data.lastName || null;
            user.settings = data.settings;
            await user.save();
            return data;
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError(500, `[userService_updateUserProfile]: ${error.message}`);
        }
    }
}
