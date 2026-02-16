import { getMyNotifications } from "@/actions/notification";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const result = await getMyNotifications();
  const notifications = result.notifications ?? [];

  return <NotificationsClient initialNotifications={notifications} />;
}
