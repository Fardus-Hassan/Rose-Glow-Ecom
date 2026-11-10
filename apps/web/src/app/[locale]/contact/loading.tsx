import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function ContactLoading() {
  return (
    <div className="container-rg py-24 md:py-28">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-10 w-56" />
      <SkeletonText lines={2} className="mt-4 max-w-md" />
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-1.5 h-2.5 w-20" />
              <Skeleton className={i === 4 ? "h-28 w-full" : "h-11 w-full"} />
            </div>
          ))}
          <Skeleton className="h-12 w-36" />
        </div>
        <Skeleton className="min-h-[280px] w-full" />
      </div>
    </div>
  );
}
