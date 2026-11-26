import { redirect } from "next/navigation";

/** /admin has no screen of its own: the middleware already required a session, so go to the dashboard. */
export default function AdminIndex() {
  redirect("/admin/dashboard");
}
