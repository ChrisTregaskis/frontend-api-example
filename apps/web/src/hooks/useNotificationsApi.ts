import { queryKeys } from '../lib/queryKeys';
import { Notification, NotificationFilters, UpdateNotificationRequest } from '../types/notification';
import { useApiMutation, useApiQuery } from './useApiRequest';

// GET /api/notifications with optional filters
export function useNotifications(filters?: NotificationFilters) {
  const queryParams = filters
    ? `?${new URLSearchParams(
        Object.entries(filters).reduce(
          (acc, [key, value]) => {
            if (value !== undefined) acc[key] = String(value);
            return acc;
          },
          {} as Record<string, string>
        )
      )}`
    : '';

  // Use unknown first, then consider a transform layor the response to ensure we get an array
  const query = useApiQuery<unknown>(queryKeys.notifications.list(filters), `/notifications${queryParams}`);

  return {
    ...query,
    data: transformNotificationsResponse(query.data),
  };
}

// An example of a helper function to handle different API response structures
function transformNotificationsResponse(data: unknown): Notification[] | undefined {
  if (!data) return undefined;

  // If it's already an array, return it
  if (Array.isArray(data)) {
    return data as Notification[];
  }

  // If it's an object, check for common wrapper properties
  if (typeof data === 'object' && data !== null) {
    const response = data as Record<string, unknown>;

    // Check for common API response patterns
    if (Array.isArray(response.data)) {
      return response.data as Notification[];
    }

    // In my mock postman example, I've set it to notifications
    if (Array.isArray(response.notifications)) {
      return response.notifications as Notification[];
    }
  }

  // Fallback: return empty array if we can't parse the response
  console.warn('Unexpected API response structure:', data);
  return [];
}

// Generic update mutation that accepts ID in the mutation data
export function useUpdateNotificationMutation() {
  return useApiMutation<Notification, UpdateNotificationRequest & { id: string }>(
    variables => `/notifications/${variables.id}`,
    'PUT',
    {
      invalidateKeys: [queryKeys.notifications.all],
    }
  );
}

// Generic delete mutation that accepts ID in the mutation data
export function useDeleteNotificationMutation() {
  return useApiMutation<void, { id: string }>(variables => `/notifications/${variables.id}`, 'DELETE', {
    invalidateKeys: [queryKeys.notifications.all],
  });
}
