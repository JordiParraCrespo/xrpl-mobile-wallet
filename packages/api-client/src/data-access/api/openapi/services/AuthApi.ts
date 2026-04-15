/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponseDto } from '../../../../common/models/AuthResponseDto';
import type { Function } from '../../../../common/models/Function';
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
  public static register(requestBody: Function): CancelablePromise<AuthResponseDto> {
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
  public static login(requestBody: Function): CancelablePromise<AuthResponseDto> {
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
  public static forgotPassword(requestBody: Function): CancelablePromise<any> {
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
  public static resetPassword(requestBody: Function): CancelablePromise<any> {
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
