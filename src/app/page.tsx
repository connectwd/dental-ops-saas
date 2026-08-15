import { redirect } from "next/navigation";

// S00 has no public marketing content — redirect straight to the
// authenticated shell (middleware sends unauthenticated users to /login).
export default function RootPage() {
  redirect("/app");
}
