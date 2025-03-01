import { env } from "@/env.js";
import Main from "./Main";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function MainPage() {
  const session = await auth();

  // Redirect to home if user is not logged in
  if (!session?.user) {
    redirect("/");
  }

  return <Main user={session.user} mapsKey={env.NEXT_PUBLIC_MAPS_KEY} />;
} 