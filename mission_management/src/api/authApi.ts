/**
 * @fileoverview Authentication API endpoints.
 *
 * Provides methods for login, registration, and fetching the current user.
 * Automatically stores the access token upon successful login or registration.
 *
 * @module api/authApi
 */

import { apiClient, setAccessToken } from './client';
import type { LoginRequest, LoginResponse, MeResponse, RegisterRequest, RegisterResponse } from '../types/auth';

/**
 * Authentication API object.
 */
export const authApi = {
  /**
   * Authenticates a user with email and password.
   *
   * @param payload - Login credentials (email, password).
   * @returns Promise resolving to user info and access token.
   */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    setAccessToken(data.accessToken);
    return data;
  },

  /**
   * Fetches the currently authenticated user's information.
   *
   * @returns Promise resolving to the user object.
   */
  async me(): Promise<MeResponse> {
    const { data } = await apiClient.get<MeResponse>('/auth/me');
    return data;
  },

  /**
   * Registers a new user (observer role by default in mock).
   *
   * @param payload - Registration data (name, email, password).
   * @returns Promise resolving to user info and access token.
   */
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await apiClient.post<RegisterResponse>('/auth/register', payload);
    setAccessToken(data.accessToken);
    return data;
  },
};
