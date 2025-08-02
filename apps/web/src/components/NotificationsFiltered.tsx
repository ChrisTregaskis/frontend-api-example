import { useNotifications } from "../hooks/useNotificationsApi";

export function FilteredNotifications() {
  const { data: unreadNotifications } = useNotifications({
    acknowledged: false,
  });
  const { data: errorNotifications } = useNotifications({ type: "error" });

  return (
    <div>
      <h2>Unread: {unreadNotifications?.length || 0}</h2>
      <h2>Errors: {errorNotifications?.length || 0}</h2>
    </div>
  );
}
