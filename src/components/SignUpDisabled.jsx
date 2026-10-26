import Link from "next/link";

export default function SignUpDisabled() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F7F8F5]">
      <div className="text-center max-w-md">
        <h1 className="font-playfair text-3xl font-bold text-[#1B4332] mb-3">
          Sign-up unavailable
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Demo mode uses a shared admin password. Use the sign-in page instead.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex rounded-full bg-[#1B4332] text-white px-6 py-3 text-sm font-semibold"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}
