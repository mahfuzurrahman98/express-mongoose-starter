import { autoInjectable } from 'tsyringe';
import { compare } from 'bcrypt';
import { UserModel } from '@/app/models/user.model';
import { TokenService } from '@/app/services/token.service';
import { ReqUserCompany, RequestUser } from '@/app/interfaces/auth.interface';
import { UserStatus } from '@/app/enums/user.enum';
import { CustomError } from '@/utils/custom-error';
import { SigninRequestDTO } from '@/app/dtos/auth.dto';

/**
 * Service class handling user authentication operations including sign-in and token refresh.
 */
@autoInjectable()
export class AuthService {
    private tokenService: TokenService;

    /**
     * Constructor for AuthService.
     *
     * @param {TokenService} tokenService - The token service
     */
    constructor(tokenService: TokenService) {
        this.tokenService = tokenService;
    }

    /**
     * Handles user sign-in operation.
     *
     * @param {SigninRequestDTO} credentials - User credentials including email and password
     * @returns {Promise<RequestUser>} Authenticated user information
     * @throws {CustomError} When credentials are invalid or account is deactivated/suspended
     */
    async signin({ email, password }: SigninRequestDTO): Promise<RequestUser> {
        try {
            const user = await UserModel.findOne({ email }).exec();
            if (!user) {
                throw new CustomError(401, 'Invalid credentials');
            }

            if (user.status === UserStatus.INACTIVE) {
                throw new CustomError(403, 'Your account is deactivated');
            }
            if (user.status === UserStatus.SUSPENDED) {
                throw new CustomError(403, 'Your account is suspended');
            }

            const passwordMatch = await compare(password, user.password);
            if (!passwordMatch) {
                throw new CustomError(401, 'Invalid credentials');
            }

            let userCompany: ReqUserCompany | undefined = undefined;

            const reqUser: RequestUser = {
                id: user.id.toString(),
                email: user.email,
                firstName: user.firstName || '',
                lastName: user.lastName || undefined,
                systemRole: user.systemRole,
                company: userCompany,
                status: user.status,
                settings: user.settings || undefined,
            };

            return reqUser;
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError(500, `[authService_signin]: ${error.message}`);
        }
    }

    /**
     * Handles token refresh operation.
     *
     * @param {string} refreshToken - Valid refresh token
     * @returns {Promise<RequestUser>} Authenticated user information
     * @throws {CustomError} When refresh token is invalid or user account is deactivated/suspended
     */
    async refreshToken(refreshToken: string): Promise<RequestUser> {
        try {
            const decoded = this.tokenService.decodeRefreshToken(refreshToken);
            const decodedUser = decoded.user;
            const user = await UserModel.findById(decodedUser.id).exec();
            if (!user) {
                throw new CustomError(401, 'Unauthorized: User not found');
            }
            let userCompany: ReqUserCompany | undefined = undefined;

            if (user.status === UserStatus.INACTIVE) {
                throw new CustomError(403, 'Your account is deactivated');
            }
            if (user.status === UserStatus.SUSPENDED) {
                throw new CustomError(403, 'Your account is suspended');
            }
            const reqUser: RequestUser = {
                id: user.id.toString(),
                email: user.email,
                firstName: user.firstName || '',
                lastName: user.lastName || undefined,
                systemRole: user.systemRole,
                company: userCompany,
                status: user.status,
                settings: user.settings || undefined,
            };
            return reqUser;
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError(500, `[authService_refreshToken]: ${error.message}`);
        }
    }
}
