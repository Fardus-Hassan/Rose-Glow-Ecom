import { ProductGridSkeleton } from "@/components/skeletons/StorefrontSkeletons";
import { Skeleton } from "@/components/ui/Skeleton";

export default function WishlistLoading() {
  return (
    <div className="container-rg py-24 md:py-28">
      <Skeleton className="h-9 w-40" />
      <div className="mt-10">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
