import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Core API request function that handles all HTTP requests with error handling
 * Heavily commented as an example for educational purposes!
 *
 * @param endpoint - The API endpoint (e.g., '/notifications', '/users/123')
 * @param options - RequestInit options (method, headers, body, etc.)
 * @returns Promise<T> - Parsed JSON response
 *
 * Features:
 * - Automatically prepends API_BASE_URL
 * - Sets default Content-Type to application/json
 * - Handles authentication headers (TODO: implement)
 * - Provides consistent error handling
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // TODO: Implement authentication token retrieval
  // const token = getCookie('authToken');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      // TODO: Include auth header when token is available
      // ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers, // Allow override of default headers
    },
    ...options,
  });

  // eslint-disable-next-line no-console
  console.log('TEST_RUN: response', response);

  // Handle HTTP errors
  if (!response.ok) {
    // Try to extract error message from response, fallback to generic message
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    // TODO: Utilise appError in future
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * React Query wrapper for GET requests with automatic caching and refetching
 *
 * @param queryKey - Unique identifier for caching (use queryKeys helper)
 * @param endpoint - API endpoint to fetch from
 * @param options - Additional query options (enabled, etc.)
 * @returns useQuery result with data, loading, error states
 *
 * Usage:
 * ```tsx
 * const { data, isLoading, error } = useApiQuery<User[]>(
 *   queryKeys.users.list(),
 *   '/users'
 * );
 * ```
 *
 * Features:
 * - Automatic background refetching
 * - Intelligent caching based on queryKey
 * - Loading and error state management
 * - TypeScript support for response data
 */
export function useApiQuery<T>(
  queryKey: readonly (string | unknown)[],
  endpoint: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey, // Used for caching - changes trigger new requests
    queryFn: () => apiRequest<T>(endpoint), // Function that performs the actual API call
    enabled: options?.enabled, // Conditionally enable/disable the query
  });
}

/**
 * React Query wrapper for mutations (POST, PUT, DELETE, PATCH) with cache invalidation
 *
 * @param endpoint - Static endpoint string OR function that builds endpoint from variables
 * @param method - HTTP method (defaults to POST)
 * @param options - Configuration including success callbacks and cache invalidation
 * @returns useMutation result with mutate/mutateAsync functions
 *
 * Usage Examples:
 *
 * Static endpoint:
 * ```tsx
 * const createUser = useApiMutation<User, CreateUserRequest>('/users', 'POST');
 * await createUser.mutateAsync({ name: 'John', email: 'john@example.com' });
 * ```
 *
 * Dynamic endpoint:
 * ```tsx
 * const updateUser = useApiMutation<User, UpdateUserRequest & { id: string }>(
 *   variables => `/users/${variables.id}`,
 *   'PUT'
 * );
 * await updateUser.mutateAsync({ id: '123', name: 'Jane' });
 * ```
 *
 * With cache invalidation:
 * ```tsx
 * const deleteUser = useApiMutation<void, { id: string }>(
 *   variables => `/users/${variables.id}`,
 *   'DELETE',
 *   {
 *     invalidateKeys: [queryKeys.users.all], // Refresh user lists after deletion
 *     onSuccess: () => showToast('User deleted successfully')
 *   }
 * );
 * ```
 */
export function useApiMutation<TData, TVariables>(
  endpoint: string | ((variables: TVariables) => string),
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  options?: {
    onSuccess?: (data: TData) => void;
    invalidateKeys?: (() => readonly (string | unknown)[])[];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) => {
      // Resolve endpoint: use function result if dynamic, otherwise use static string
      const resolvedEndpoint = typeof endpoint === 'function' ? endpoint(variables) : endpoint;

      return apiRequest<TData>(resolvedEndpoint, {
        method,
        body: JSON.stringify(variables), // Serialize request data
      });
    },
    onSuccess: data => {
      // Invalidate specified cache keys to trigger automatic refetches
      options?.invalidateKeys?.forEach(keyFactory => {
        queryClient.invalidateQueries({ queryKey: keyFactory() });
      });

      // Execute custom success callback if provided
      options?.onSuccess?.(data);
    },
  });
}
