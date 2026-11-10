import { Skeleton } from "@/components/ui/Skeleton";

export function HeaderSkeleton() {
  return (
    <header
      role="status"
      aria-busy="true"
      aria-label="Loading header"
      className="sticky top-0 z-50 border-b border-[#1c1a19]/10 bg-[#f0ebe4]/95 backdrop-blur-md"
    >
      <div className="container-rg flex h-16 items-center justify-between gap-4 md:h-[4.75rem]">
        <Skeleton className="h-9 w-9 md:hidden" />
        <Skeleton className="hidden h-3 w-16 md:block" />
        <Skeleton className="h-6 w-28" />
        <div className="flex items-center gap-3">
          <Skeleton className="hidden h-3 w-14 sm:block" />
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </header>
  );
}

export function FooterSkeleton() {
  return (
    <footer
      role="status"
      aria-busy="true"
      aria-label="Loading footer"
      className="bg-[#0e0d0c]"
    >
      <div className="container-rg grid gap-12 py-16 md:grid-cols-4 md:gap-10 md:py-20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full bg-white/10" />
            <Skeleton className="h-6 w-28 bg-white/10" />
          </div>
          <Skeleton className="h-3 w-48 bg-white/10" />
          <Skeleton className="h-3 w-40 bg-white/10" />
          <div className="flex gap-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 bg-white/10" />
            ))}
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="space-y-3">
            <Skeleton className="h-2.5 w-20 bg-white/15" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-24 bg-white/10" />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </footer>
  );
}

export function CollectionsStripSkeleton() {
  return (
    <section
      role="status"
      aria-busy="true"
      aria-label="Loading collections"
      className="bg-[#0e0d0c] py-14 md:py-20"
    >
      <div className="container-rg">
        <Skeleton className="h-9 w-56 bg-white/15" />
        <Skeleton className="mt-3 h-3 w-72 max-w-full bg-white/10" />
        <div className="mt-8 flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-[3/4] w-[72%] shrink-0 bg-white/10 sm:w-[48%] md:w-[32%] lg:w-[22%]"
            />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </section>
  );
}
