import { Suspense } from "react";
import { OrderDetailClient } from "./OrderDetailClient";

// Server page shell. The actual param resolution + client hydration happen
// inside the Suspense boundary so Next's prerender can stream the dynamic
// bits at runtime (required with Cache Components).
export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-16">
          <div className="h-6 w-40 animate-pulse rounded bg-line" />
        </div>
      }
    >
      <OrderDetailResolver params={params} />
    </Suspense>
  );
}

async function OrderDetailResolver({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailClient id={id} />;
}
