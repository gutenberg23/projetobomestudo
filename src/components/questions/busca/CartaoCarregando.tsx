import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto de uma questão enquanto a busca carrega. */
export const CartaoCarregando = () => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
    <div className="flex items-center gap-3">
      <Skeleton className="h-7 w-7 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="mt-5 h-16 w-full" />
    <div className="mt-4 space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  </div>
);
