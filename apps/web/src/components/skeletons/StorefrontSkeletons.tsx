import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { cn } from "@/lib/format";

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)} aria-hidden>
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="mt-3 h-2.5 w-16" />
      <Skeleton className="mt-2 h-4 w-[80%]" />
      <Skeleton className="mt-2 h-3 w-24" />
      <Skeleton className="mt-2 h-3.5 w-20" />
    </div>
  );
}

export function ProductGridSkeleton({
  count = 12,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading products"
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading page">
      {/* Hero */}
      <div className="relative min-h-[100svh] bg-[#e2dacf]">
        <Skeleton className="absolute inset-0 rounded-none bg-[#1c1a19]/10" />
        <div className="absolute inset-x-0 bottom-0 container-rg space-y-4 pb-16 md:pb-24">
          <Skeleton className="h-3 w-28 bg-white/20" />
          <Skeleton className="h-10 w-64 max-w-full bg-white/25 md:h-14 md:w-96" />
          <Skeleton className="h-4 w-80 max-w-full bg-white/15" />
          <Skeleton className="mt-4 h-11 w-40 bg-white/25" />
        </div>
      </div>

      {/* Promise bar */}
      <div className="container-rg grid grid-cols-3 gap-4 py-8 md:py-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Spotlight */}
      <div className="container-rg grid gap-8 py-12 md:grid-cols-2 md:py-16">
        <Skeleton className="min-h-[420px] w-full md:min-h-[560px]" />
        <div className="flex flex-col justify-center space-y-4 py-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-[75%]" />
          <SkeletonText lines={3} />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-36" />
        </div>
      </div>

      {/* Featured slider row */}
      <div className="container-rg py-12 md:py-16">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-9 w-56" />
        <div className="mt-8 flex gap-4 overflow-hidden md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton
              key={i}
              className="w-[70%] shrink-0 sm:w-[45%] lg:w-[32%] xl:w-[24%]"
            />
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="container-rg py-12 md:py-16">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-9 w-64" />
        <div className="mt-8 flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[240px] w-[85%] shrink-0 border border-[#1c1a19]/10 p-5 sm:w-[48%] md:min-h-[260px]"
            >
              <SkeletonText lines={4} />
              <Skeleton className="mt-6 h-3 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Atelier band */}
      <Skeleton className="min-h-[70svh] w-full rounded-none" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function ProductsPageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading shop"
      className="bg-[#f0ebe4] pb-20 md:pb-28"
    >
      <div className="relative isolate overflow-hidden border-b border-white/10 bg-[#0e0d0c]">
        <Skeleton className="absolute inset-0 rounded-none bg-white/5" />
        <div className="container-rg relative space-y-4 pb-12 pt-28 md:pb-16 md:pt-32">
          <Skeleton className="h-3 w-24 bg-white/20" />
          <Skeleton className="h-10 w-48 bg-white/25 md:h-12" />
          <Skeleton className="h-4 w-72 max-w-full bg-white/15" />
        </div>
      </div>

      <div className="container-rg pt-8 md:pt-10">
        <div className="mb-8 flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 shrink-0" />
          ))}
        </div>
        <Skeleton className="mb-6 h-3 w-32" />
        <ProductGridSkeleton />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading product"
      className="bg-[#f0ebe4] pb-28 md:pb-24"
    >
      <div className="container-rg pt-24 md:pt-28">
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-2.5 w-14" />
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-10 xl:gap-14">
          <div>
            <Skeleton className="aspect-[4/5] w-full" />
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-16 shrink-0 md:h-20 md:w-20" />
              ))}
            </div>
          </div>
          <div className="space-y-4 lg:pt-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-[80%]" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-40" />
            <SkeletonText lines={3} className="pt-2" />
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </div>
        </div>
      </div>

      <div className="container-rg mt-12 space-y-4 md:mt-16">
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-24" />
          ))}
        </div>
        <SkeletonText lines={4} />
      </div>

      <div className="container-rg mt-14 md:mt-20">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function LandingPageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading landing"
      className="min-h-screen bg-[#f0ebe4]"
    >
      <div className="flex h-16 items-center justify-between border-b border-[#1c1a19]/10 px-4 md:h-20">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="container-rg pb-28 pt-6 md:pt-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-[80%]" />
            <Skeleton className="h-5 w-24" />
            <SkeletonText lines={3} />
            <div className="grid grid-cols-3 gap-3 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
            <Skeleton className="mt-4 h-12 w-full" />
          </div>
        </div>

        <div className="mt-14 space-y-4 md:mt-20">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-56" />
          <div className="mt-6 flex gap-4 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProductCardSkeleton
                key={i}
                className="w-[82%] shrink-0 sm:w-[48%] lg:w-[32%]"
              />
            ))}
          </div>
        </div>

        <div className="mt-12 border border-[#1c1a19]/10 bg-[#e7e0d6]/40 p-4 md:mt-16 md:p-8">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-8 w-56" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-14 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[66%]" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="mb-1.5 h-2.5 w-20" />
                <Skeleton className={i > 2 ? "h-20 w-full" : "h-11 w-full"} />
              </div>
            ))}
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading cart"
      className="container-rg py-24 md:py-28"
    >
      <Skeleton className="h-9 w-40" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-[#1c1a19]/10 pb-6">
              <Skeleton className="h-28 w-24 shrink-0 md:h-36 md:w-28" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-[66%]" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4 border border-[#1c1a19]/10 p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading checkout"
      className="container-rg py-24 md:py-28"
    >
      <Skeleton className="h-9 w-48" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-1.5 h-2.5 w-24" />
              <Skeleton className={i === 5 ? "h-24 w-full" : "h-11 w-full"} />
            </div>
          ))}
          <Skeleton className="mt-4 h-12 w-full" />
        </div>
        <div className="space-y-4 border border-[#1c1a19]/10 p-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-16 w-14 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-[75%]" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading search"
      className="container-rg py-24 md:py-28"
    >
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-8 h-14 w-full border-b border-[#1c1a19]/10 bg-transparent md:h-16" />
      <div className="mt-10">
        <ProductGridSkeleton count={8} />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
