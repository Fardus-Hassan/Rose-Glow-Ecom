import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function AboutLoading() {
  return (
    <div>
      <Skeleton className="min-h-[50svh] w-full rounded-none" />
      <div className="container-rg space-y-4 py-16 md:py-24">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <SkeletonText lines={5} className="max-w-2xl" />
      </div>
    </div>
  );
}
