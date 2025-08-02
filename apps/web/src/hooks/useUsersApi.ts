import { queryKeys } from '../lib/queryKeys';
import { CreateUser, User, CreateUserSchema, UserResponseSchema } from '../types/user';
import { useApiMutation } from './useApiRequest';

export async function createUser(userData: CreateUser): Promise<User> {
  const validData = CreateUserSchema.parse(userData);

  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create user');
  }

  const data = await response.json();
  return UserResponseSchema.parse(data);
}

export function useCreateUser() {
  return useApiMutation<User, CreateUser>('/users', 'POST', {
    invalidateKeys: [
      queryKeys.users.all, // Invalidate all user queries
    ],
  });
}
