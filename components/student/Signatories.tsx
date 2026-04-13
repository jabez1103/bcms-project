"use client";

import Link from "next/link";
import { signatories } from "@/lib/mock-data/id/signatories";

export default function SignatoriesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Signatories</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {signatories.map((sig) => (
          <Link key={sig.id} href={`/student/signatories/${sig.id}`}>
            <div className="border rounded-xl p-4 hover:shadow-md cursor-pointer">

              <p className="font-semibold">{sig.role}</p>
              <p className="text-sm text-gray-500">
                {sig.person.name}
              </p>

              {/* STATUS */}
              <p className="text-xs mt-2">
                Status: <span className="font-medium">{sig.status}</span>
              </p>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}