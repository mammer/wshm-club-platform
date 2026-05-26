"use client";

import { useState, useMemo, useEffect } from "react";

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // Clamp page if items shrink (e.g. after search)
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [items.length, totalPages, page]);

  const paged = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );

  return { paged, page: safePage, setPage, totalPages, total: items.length, pageSize };
}
