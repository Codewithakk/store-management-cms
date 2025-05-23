// import { Request, Response, NextFunction } from 'express';
// import httpResponse from '../util/httpResponse';
// import httpError from '../util/httpError';
// import { authService } from '../services/auth.service';
// import jwt from 'jsonwebtoken';
// import { Role } from '@prisma/client';
// import { ForgotPasswordRequest, RefreshTokenRequest, ResetPasswordRequest, SigninRequest, SignupRequest, VerifyOtpRequest } from '../types/auth';
// import { CryptoHelper } from '../util/crypto-helper';

// export const authController = {
//   signup: async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { firstName, lastName, email, password, phone, role, locationId, location } = req.body;

//       if (!firstName || !email || !password) {
//         return httpResponse(req, res, 400, 'First name, email, and password are required');
//       }

//       if (!/^[a-zA-Z0-9]+$/.test(firstName)) {
//         return httpResponse(req, res, 400, 'First name must be alphanumeric');
//       }

//       if (lastName && !/^[a-zA-Z0-9]+$/.test(lastName)) {
//         return httpResponse(req, res, 400, 'Last name must be alphanumeric');
//       }

//       if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
//         return httpResponse(req, res, 400, 'Invalid email format');
//       }

//       if (password.length < 6) {
//         return httpResponse(req, res, 400, 'Password must be at least 6 characters long');
//       }

//       const roleEnum =
//         role && Object.values(Role).includes(role.toUpperCase() as Role)
//           ? (role.toUpperCase() as Role)
//           : Role.ADMIN;

//       const userData = await authService.signupService(
//         firstName.trim(),
//         lastName?.trim() || null,
//         email.toLowerCase(),
//         password,
//         phone ?? null,
//         roleEnum,
//         locationId ?? null,
//         location ?? null
//       );

//       const encryptedResponse = CryptoHelper.encrypt({
//         message: 'Signup successful',
//         userData,
//       });

//       res.status(200).json({
//         success: true,
//         statusCode: 200,
//         encryptedData: encryptedResponse.encryptedData,
//         iv: encryptedResponse.iv,
//       });

//       // httpResponse(req, res, 200, 'Signup successful', userData);
//     } catch (err) {
//       return httpError(next, err, req);
//     }
//   },

//   signin: async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { email, password } = req.body as SigninRequest;
//       const data = await authService.signInService(email, password);
//       const encryptedResponse = CryptoHelper.encrypt({
//         message: 'Login successful',
//         data,
//       });

//       res.status(200).json({
//         success: true,
//         statusCode: 200,
//         encryptedData: encryptedResponse.encryptedData,
//         iv: encryptedResponse.iv,
//       });
//       // httpResponse(req, res, 200, 'Login successful', data);
//     } catch (err) {
//       httpError(next, err, req);
//     }
//   },
//   signintest: async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { email, password } = req.body as SigninRequest;
//       // const { firstName, lastName, email, password, phone, role } = req.body;

//       const encrypted = CryptoHelper.encrypt({ email, password });

//       res.status(200).json({
//         success: true,
//         message: 'Test encryption successful',
//         encryptedPayload: encrypted,
//       });
//     } catch (err) {
//       httpError(next, err, req);
//     }
//   },

//   refreshToken: async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { refreshToken } = req.body as RefreshTokenRequest;
//       interface RefreshTokenPayload extends jwt.JwtPayload {
//         userId: string;
//         role: string;
//       }
//       const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as RefreshTokenPayload;
//       const data = await authService.refreshToken(decoded.userId, refreshToken, decoded.role);
//       httpResponse(req, res, 200, 'Token refreshed', data);
//     } catch (err) {
//       httpError(next, err, req, 403);
//     }
//   },

//   logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const userId = req.user?.userId;
//       if (!userId)
//         httpResponse(req, res, 401, 'Unauthorized');
//       await authService.logout(userId as string);
//       httpResponse(req, res, 200, 'Logout successful');
//     } catch (err) {
//       httpError(next, err, req);
//     }
//   },

//   forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { email } = req.body as ForgotPasswordRequest;
//       if (!email) return httpResponse(req, res, 400, 'Email is required');

//       await authService.forgotPasswordService(email);
//       return httpResponse(req, res, 200, 'OTP sent to email');
//     } catch (err) {
//       httpError(next, err, req, 500);
//     }
//   },
//   verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { otp } = req.body as VerifyOtpRequest;
//       if (!otp) return httpResponse(req, res, 400, 'OTP is required');

//       const resetToken = await authService.verifyOtpService(otp);
//       return httpResponse(req, res, 200, 'OTP verified', { resetToken });
//     } catch (err) {
//       httpError(next, err, req, 500);
//     }
//   },

//   resetPassword: async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { resetToken, newPassword } = req.body as ResetPasswordRequest;
//       if (!resetToken || !newPassword)
//         return httpResponse(req, res, 400, 'Reset token and new password are required');

//       await authService.resetPasswordService(resetToken, newPassword);
//       return httpResponse(req, res, 200, 'Password reset successful');
//     } catch (err) {
//       httpError(next, err, req, 500);
//     }
//   },

//   UpdateProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const id = req.user?.userId;
//       const userId = req.params.id;
//       if (!userId) {
//         return httpResponse(req, res, 403, 'Profile not found');
//       }
//       if (!id)
//         return httpResponse(req, res, 401, 'Unauthorized');

//       const updatedUser = await authService.updateUserProfileService(userId, req.body);
//       httpResponse(req, res, 200, 'Profile updated successfully', updatedUser);
//     } catch (error: any) {
//       return httpError(next, error, req, 500);
//     }
//   },
// }

import { Request, Response, NextFunction } from 'express'
import httpResponse from '../../util/httpResponse'
import httpError from '../../util/httpError'
import { authService } from '../../services/auth.service'
import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { ForgotPasswordRequest, RefreshTokenRequest, ResetPasswordRequest, SigninRequest, SignupRequest, VerifyOtpRequest } from '../../types/auth'
import { CryptoHelper } from '../../util/crypto-helper'
import prisma from '../../util/prisma'

export const authController = {
    // signup: async (req: Request, res: Response, next: NextFunction) => {
    //   try {
    //     const { firstName, lastName, email, password, phone, roles, workspaceId, workspace, locationId, location } = req.body;

    //     if (!firstName || !email || !password) {
    //       return httpResponse(req, res, 400, 'First name, email, and password are required');
    //     }

    //     if (!/^[a-zA-Z0-9]+$/.test(firstName)) {
    //       return httpResponse(req, res, 400, 'First name must be alphanumeric');
    //     }

    //     if (lastName && !/^[a-zA-Z0-9]+$/.test(lastName)) {
    //       return httpResponse(req, res, 400, 'Last name must be alphanumeric');
    //     }

    //     if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    //       return httpResponse(req, res, 400, 'Invalid email format');
    //     }

    //     if (password.length < 6) {
    //       return httpResponse(req, res, 400, 'Password must be at least 6 characters long');
    //     }

    //     // Handle roles - default to ["customer"] if not provided
    //     let rolesEnum: Role[] = [Role.CUSTOMER];
    //     if (roles) {
    //       if (!Array.isArray(roles)) {
    //         return httpResponse(req, res, 400, 'Roles must be an array');
    //       }
    //       rolesEnum = roles.map((role: string) => {
    //         if (!Object.values(Role).includes(role.toUpperCase() as Role)) {
    //           throw new Error(`Invalid role: ${role}`);
    //         }
    //         return role.toUpperCase() as Role;
    //       });
    //       if (rolesEnum.length === 0) {
    //         rolesEnum = [Role.CUSTOMER]; // Default if empty array
    //       }
    //     }

    //     // Only allow workspace creation if the role is not customer
    //     if (workspace && rolesEnum.includes(Role.CUSTOMER)) {
    //       return httpResponse(req, res, 400, 'Workspace can only be created for non-customer roles');
    //     }

    //     if (
    //       rolesEnum.length === 1 &&
    //       rolesEnum.includes(Role.CUSTOMER) &&
    //       (workspaceId || workspace)
    //     ) {
    //       return httpResponse(req, res, 400, 'Customers cannot be assigned or create a workspace');
    //     }

    //     if (workspaceId && workspace) {
    //       return httpResponse(req, res, 400, 'Provide either workspaceId or workspace, not both');
    //     }

    //     if (workspaceId) {
    //       const workspaceExists = await prisma.workspace.findUnique({ where: { id: parseInt(workspaceId) } });
    //       if (!workspaceExists) {
    //         return httpResponse(req, res, 400, 'Invalid workspace ID');
    //       }
    //     }

    //     if (workspace && typeof workspace === 'object') {
    //       if (!workspace.name || !workspace.slug) {
    //         return httpResponse(req, res, 400, 'Workspace name and slug are required');
    //       }
    //       if (!/^[a-z0-9-]+$/.test(workspace.slug)) {
    //         return httpResponse(req, res, 400, 'Workspace slug must be lowercase alphanumeric with hyphens');
    //       }
    //     }

    //     const userData = await authService.signupService(
    //       firstName.trim(),
    //       lastName?.trim() || null,
    //       email.toLowerCase(),
    //       password,
    //       phone ?? null,
    //       rolesEnum,
    //       workspaceId ? parseInt(workspaceId) : null,
    //       workspace ?? null,
    //       locationId ?? null,
    //       location ?? null
    //     );
    //     // const encryptedResponse = CryptoHelper.encrypt({
    //     //   message: 'Signup successful',
    //     //   userData,
    //     // });

    //     // res.status(200).json({
    //     //   success: true,
    //     //   statusCode: 200,
    //     //   encryptedData: encryptedResponse.encryptedData,
    //     //   iv: encryptedResponse.iv,
    //     // });
    //     httpResponse(req, res, 200, 'Signup successful', userData);
    //   } catch (err) {
    //     return httpError(next, err, req);
    //   }
    // },

    signup: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { firstName, lastName, email, password, phone, roles, workspaceId, workspace, locationId, location } = req.body

            // Validate required fields
            if (!firstName || !email || !password) {
                return httpResponse(req, res, 400, 'First name, email, and password are required')
            }

            if (!/^[a-zA-Z0-9]+$/.test(firstName)) {
                return httpResponse(req, res, 400, 'First name must be alphanumeric')
            }

            if (lastName && !/^[a-zA-Z0-9]+$/.test(lastName)) {
                return httpResponse(req, res, 400, 'Last name must be alphanumeric')
            }

            if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                return httpResponse(req, res, 400, 'Invalid email format')
            }

            if (password.length < 6) {
                return httpResponse(req, res, 400, 'Password must be at least 6 characters long')
            }

            let rolesEnum: Role[] = [Role.CUSTOMER] // Default
            if (roles) {
                let roleInput: string
                if (typeof roles === 'string') {
                    roleInput = roles // Single role string
                } else if (Array.isArray(roles) && roles.length > 0) {
                    roleInput = roles[0] // Use only the first role
                } else {
                    roleInput = 'CUSTOMER' // Fallback
                }

                const formattedRole = roleInput.toUpperCase()
                if (!Object.values(Role).includes(formattedRole as Role)) {
                    return httpResponse(req, res, 400, `Invalid role: ${formattedRole}`)
                }

                rolesEnum = [formattedRole as Role]
            }
            if (workspace && rolesEnum.includes(Role.CUSTOMER)) {
                return httpResponse(req, res, 400, 'Workspace can only be created for non-customer roles')
            }

            if (rolesEnum.length === 1 && rolesEnum.includes(Role.CUSTOMER) && (workspaceId || workspace)) {
                return httpResponse(req, res, 400, 'Customers cannot be assigned or create a workspace')
            }

            if (workspaceId && workspace) {
                return httpResponse(req, res, 400, 'Provide either workspaceId or workspace, not both')
            }

            if (workspaceId) {
                const workspaceExists = await prisma.workspace.findUnique({ where: { id: parseInt(workspaceId) } })
                if (!workspaceExists) {
                    return httpResponse(req, res, 400, 'Invalid workspace ID')
                }
            }

            if (workspace && typeof workspace === 'object') {
                if (!workspace.name || !workspace.slug) {
                    return httpResponse(req, res, 400, 'Workspace name and slug are required')
                }
                if (!/^[a-z0-9-]+$/.test(workspace.slug)) {
                    return httpResponse(req, res, 400, 'Workspace slug must be lowercase alphanumeric with hyphens')
                }
            }

            const userData = await authService.signupService(
                firstName.trim(),
                lastName?.trim() || null,
                email.toLowerCase(),
                password,
                phone ?? null,
                rolesEnum,
                workspaceId ? parseInt(workspaceId) : null,
                workspace ?? null,
                locationId ?? null,
                location ?? null
            )
            const encryptedResponse = CryptoHelper.encrypt({
                message: 'Signup successful',
                userData
            })

            res.status(200).json({
                success: true,
                statusCode: 200,
                encryptedData: encryptedResponse.encryptedData,
                iv: encryptedResponse.iv
            })
            // httpResponse(req, res, 200, 'Signup successful', userData);
        } catch (err) {
            return httpError(next, err, req)
        }
    },

    signin: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body as SigninRequest
            const data = await authService.signInService(email, password)
            const encryptedResponse = CryptoHelper.encrypt({
                message: 'Login successful',
                data
            })

            res.status(200).json({
                success: true,
                statusCode: 200,
                encryptedData: encryptedResponse.encryptedData,
                iv: encryptedResponse.iv
            })
            // httpResponse(req, res, 200, 'Login successful', data);
        } catch (err) {
            httpError(next, err, req)
        }
    },

    signintest: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { firstName, lastName, email, password, phone, role } = req.body

            const encrypted = CryptoHelper.encrypt({ firstName, lastName, email, password, phone, role })

            res.status(200).json({
                success: true,
                message: 'Test encryption successful',
                encryptedPayload: encrypted
            })
            // httpResponse(req, res, 200, 'Test encryption successful');
        } catch (err) {
            httpError(next, err, req)
        }
    },

    refreshToken: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body as RefreshTokenRequest
            interface RefreshTokenPayload extends jwt.JwtPayload {
                userId: string
            }
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as RefreshTokenPayload
            const data = await authService.refreshToken(decoded.userId, refreshToken)
            httpResponse(req, res, 200, 'Token refreshed', data)
        } catch (err) {
            httpError(next, err, req, 403)
        }
    },

    logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId
            if (!userId) {
                httpResponse(req, res, 401, 'Unauthorized')
                return
            }
            await authService.logout(userId)
            httpResponse(req, res, 200, 'Logout successful')
        } catch (err) {
            httpError(next, err, req)
        }
    },

    forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body as ForgotPasswordRequest
            if (!email) return httpResponse(req, res, 400, 'Email is required')

            await authService.forgotPasswordService(email)
            return httpResponse(req, res, 200, 'OTP sent to email')
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { otp } = req.body as VerifyOtpRequest
            if (!otp) return httpResponse(req, res, 400, 'OTP is required')

            const resetToken = await authService.verifyOtpService(otp)
            return httpResponse(req, res, 200, 'OTP verified', { resetToken })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    resetPassword: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { resetToken, newPassword } = req.body as ResetPasswordRequest
            if (!resetToken || !newPassword) {
                return httpResponse(req, res, 400, 'Reset token and new password are required')
            }

            await authService.resetPasswordService(resetToken, newPassword)
            return httpResponse(req, res, 200, 'Password reset successful')
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    UpdateProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return httpResponse(req, res, 403, 'Profile not found');
            }
            await authService.updateUserProfileService(
                userId,
                req.body,
                req.file
            );

            httpResponse(req, res, 200, 'Profile updated successfully');
        } catch (error: any) {
            return httpError(next, error, req, 500);
        }
    },
    userRoles: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.user?.userId

        try {
            const roles = await authService.userRoles(userId as string)
            httpResponse(req, res, 200, 'User roles fetched successfully', roles)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },
    getUserDetails: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return httpResponse(req, res, 403, 'Profile not found');
            }
            const userDetails = await authService.getUserDetails(
                userId
            );

            httpResponse(req, res, 200, 'Profile updated successfully', userDetails);
        } catch (error: any) {
            return httpError(next, error, req, 500);
        }
    },
    deleteAddress: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId
            const addressId = req.params.addressId

            // Validate user authentication
            if (!userId) {
                return httpError(next, new Error('Unauthorized'), req, 401)
            }

            // Validate addressId
            if (!addressId) {
                return httpError(next, new Error('Address ID is required'), req, 400)
            }

            // Call service to delete address
            const result = await authService.deleteAddress(userId, addressId)

            // Return success response
            res.status(200).json(result)
        } catch (error: any) {
            console.error('Delete address error:', error)

            // Specific error handling
            if (error.message.includes('not found')) {
                return httpError(next, new Error('Address not found'), req, 404)
            }
            if (error.message.includes('Access denied')) {
                return httpError(next, new Error('Access denied'), req, 403)
            }
            if (error.message.includes('used in existing orders')) {
                return httpError(next, new Error('Address is used in orders'), req, 400)
            }
            return httpError(next, new Error('Internal server error'), req, 500)
        }
    },

    updateAddress: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId
            if (!userId) {
                return httpError(next, new Error('User not authenticated'), req, 401) // If userId is missing
            }
            const { addressId } = req.params
            const updateData = req.body

            if (!userId || !addressId) {
                return httpError(next, new Error('Missing userId or addressId'), req, 400)
            }

            const updated = await authService.updateAddress(userId, addressId, updateData)
            res.status(200).json({ success: true, message: 'Address updated successfully', data: updated })
        } catch (error) {
            console.error('Update address error:', error)
            res.status(500).json({ success: false, message: error || 'Internal server error' })
        }
    },
    addAddress: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.user?.userId
        const addressData = req.body
        if (!userId) {
            httpError(next, new Error('User not authenticated'), req, 401) // If userId is missing
            return
        }
        try {
            const address = await authService.addAddress(userId as string, addressData)
            return httpResponse(req, res, 201, 'Address added successfully', address)
        } catch (error) {
            return httpError(next, error, req, 500)
        }
    }
}
