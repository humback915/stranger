import { setRequestLocale } from "next-intl/server";
import { getMyNotifications } from "@/actions/notification";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const result = await getMyNotifications();
  const notifications = result.notifications ?? [];

  return <NotificationsClient initialNotifications={notifications} />;
}
