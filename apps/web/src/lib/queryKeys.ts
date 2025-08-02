import { NotificationFilters } from '../types/notification';

type QueryKeyFactory<TFilters = unknown> = {
  all: () => readonly string[];
  list: (filters?: TFilters) => readonly (string | TFilters)[];
  detail: (id: string) => readonly string[];
};

type DomainKeys = {
  users: Pick<QueryKeyFactory, 'all'>;
  notifications: QueryKeyFactory<NotificationFilters>;
};

/**
 * Centralized query key factory organized by domain.
 * Provides consistent, hierarchical query keys for React Query caching and invalidation.
 */
export const queryKeys: DomainKeys = {
  users: {
    all: () => ['users'] as const,
  },
  notifications: {
    all: () => ['notifications'] as const,
    list: (filters?: NotificationFilters) => [...queryKeys.notifications.all(), 'list', filters] as const,
    detail: (id: string) => [...queryKeys.notifications.all(), 'detail', id] as const,
  },
} as const;

/**
 * Union type representing all possible query key arrays that can be returned from the queryKeys object.
 *
 * This type works by:
 * 1. Getting all domain keys from queryKeys (e.g., 'users', 'notifications')
 * 2. For each domain, getting all method keys (e.g., 'all', 'list', 'detail')
 * 3. Using ReturnType to extract the actual array types returned by each method
 *
 * Result: A union of all possible query key arrays like:
 * - readonly ["users"]
 * - readonly ["notifications"]
 * - readonly ["notifications", "list", NotificationFilters | undefined]
 * - readonly ["notifications", "detail", string]
 *
 * Example usage:
 * ```typescript
 * // Type-safe query key validation
 * function invalidateQuery(queryKey: QueryKey) {
 *   queryClient.invalidateQueries({ queryKey });
 * }
 *
 * // Valid usage:
 * invalidateQuery(queryKeys.users.all());
 * invalidateQuery(queryKeys.notifications.list({ status: 'unread' }));
 * invalidateQuery(queryKeys.notifications.detail('123'));
 * ```
 */
export type QueryKey = ReturnType<
  (typeof queryKeys)[keyof typeof queryKeys][keyof (typeof queryKeys)[keyof typeof queryKeys]]
>;
