import Link from "next/link";
import { redirect } from "next/navigation";
// import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { FcGoogle } from "react-icons/fc";

export default async function Home() {
//   const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  // Redirect to /main if user is logged in
  if (session?.user) {
    redirect("/main");
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Beyonds <span className="text-[hsl(280,100%,70%)]">Cloud</span>
          </h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              Please sign in to access the map
            </p>
            <Link
              href="/api/auth/signin"
              className="flex items-center gap-2 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            >
              <FcGoogle className="h-6 w-6" />
              Sign in with Google
            </Link>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}