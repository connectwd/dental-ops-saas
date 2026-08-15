import { signIn } from "@/infrastructure/auth/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl = resolvedSearchParams?.callbackUrl ?? "/app";

  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    await signIn("credentials", { email, redirectTo: callbackUrl });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <form
        action={login}
        className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
        <p className="text-sm text-slate-500">
          Dev login — enter a seeded user email.
        </p>
        <input
          type="email"
          name="email"
          required
          placeholder="manager@example-dental.co.uk"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
