"use client";
import { useCallback } from "react";

import {
  useNotifications,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
} from "../hooks/useNotificationsApi";

export function NotificationList() {
  const { data: notifications, isLoading, error } = useNotifications();
  const updateMutation = useUpdateNotificationMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const handleAcknowledge = useCallback(
    async (id: string, currentStatus: boolean) => {
      try {
        await updateMutation.mutateAsync({ id, acknowledged: !currentStatus });
      } catch (error) {
        console.error("Failed to update notification:", error);
      }
    },
    [updateMutation]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync({ id });
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    },
    [deleteMutation]
  );

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="w-full max-w-none space-y-4">
      {notifications?.map((notification) => (
        <div
          key={notification.id}
          className={`w-full rounded border p-4 ${notification.acknowledged ? "bg-gray-50" : "border-blue-200 bg-white"}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{notification.title}</h3>
              <p className="text-gray-600">{notification.message}</p>
              <small className="text-gray-400">
                {new Date(notification.createdAt).toLocaleDateString()}
              </small>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() =>
                  handleAcknowledge(notification.id, notification.acknowledged)
                }
                className="text-sm text-blue-500 hover:underline"
              >
                {notification.acknowledged ? "Mark as unread" : "Mark as read"}
              </button>

              <button
                onClick={() => handleDelete(notification.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
