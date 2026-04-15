/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponseDto } from '../../../../common/models/AuthResponseDto';
import type { ChangePasswordRequest } from '../../../../common/models/ChangePasswordRequest';
import type { ForgotPasswordRequest } from '../../../../common/models/ForgotPasswordRequest';
import type { LoginRequest } from '../../../../common/models/LoginRequest';
import type { RegisterRequest } from '../../../../common/models/RegisterRequest';
import type { ResetPasswordRequest } from '../../../../common/models/ResetPasswordRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthApi {
  /**
   * Register a new user
   * @param requestBody
   * @returns AuthResponseDto
   * @throws ApiError
   */
  public static register(requestBody: RegisterRequest): CancelablePromise<AuthResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/auth/register',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        409: `AUTH_001: Email already in use`,
      },
    });
  }
  /**
   * Login with email and password
   * @param requestBody
   * @returns AuthResponseDto
   * @throws ApiError
   */
  public static login(requestBody: LoginRequest): CancelablePromise<AuthResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/auth/login',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        401: `AUTH_002: Invalid credentials`,
      },
    });
  }
  /**
   * Refresh access token
   * @returns AuthResponseDto
   * @throws ApiError
   */
  public static refresh(): CancelablePromise<AuthResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/auth/refresh',
      errors: {
        401: `AUTH_004: Access denied`,
      },
    });
  }
  /**
   * Logout
   * @returns any
   * @throws ApiError
   */
  public static logout(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/auth/logout',
    });
  }
  /**
   * Request password reset
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static forgotPassword(requestBody: ForgotPasswordRequest): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/auth/forgot-password',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Reset password with token
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static resetPassword(requestBody: ResetPasswordRequest): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/auth/reset-password',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `AUTH_003: Invalid or expired reset token`,
      },
    });
  }
  /**
   * Change password
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static changePassword(requestBody: ChangePasswordRequest): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/auth/change-password',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        401: `AUTH_002: Invalid credentials`,
      },
    });
  }
  /**
   * Login with Google
   * @returns any
   * @throws ApiError
   */
  public static googleAuth(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/auth/google',
    });
  }
  /**
   * @returns any
   * @throws ApiError
   */
  public static googleCallback(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/auth/google/callback',
    });
  }
  /**
   * Login with GitHub
   * @returns any
   * @throws ApiError
   */
  public static githubAuth(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/auth/github',
    });
  }
  /**
   * @returns any
   * @throws ApiError
   */
  public static githubCallback(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/auth/github/callback',
    });
  }
}
