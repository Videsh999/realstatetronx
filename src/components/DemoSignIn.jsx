"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

export default function DemoSignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect_url") || "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Invalid password");
        return;
      }
      router.replace(redirect);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(ellipse_at_top,_#E8F5E9_0%,_#F7F8F5_45%,_#FFFFFF_100%)]">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block font-playfair text-3xl font-bold tracking-tight text-[#1B4332]">
            <span className="text-[#2D6A4F]">TRO</span>NX
          </Link>
          <p className="mt-3 text-sm text-gray-500 font-inter">
            Admin portal — enter your access password
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white/80 backdrop-blur-sm border border-[#1B4332]/10 rounded-3xl p-8 shadow-[0_20px_60px_-30px_rgba(27,67,50,0.45)]"
        >
          <div className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-[#1B4332]/5 flex items-center justify-center">
            <Lock className="text-[#1B4332]" size={22} />
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Admin password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter ADMIN_PASSWORD"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30 focus:border-[#1B4332] transition"
            autoFocus
            required
          />

          {error ? (
            <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1B4332] text-white py-3.5 text-sm font-semibold hover:bg-[#133024] transition disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Continue
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Tip: add Clerk keys in <code className="text-gray-500">.env.local</code> for production auth.
        </p>
      </div>
    </div>
  );
}
