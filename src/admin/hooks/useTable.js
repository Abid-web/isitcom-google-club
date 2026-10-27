import { useMemo, useState } from "react";

export function useTable({
  data = [],
  initialSortField = "created_at",
  initialSortDir = "desc",
  initialPageSize = 10,
  searchFields = [],
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDir, setSortDir] = useState(initialSortDir);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const setFilter = (key, value) => {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearch("");
    setPage(1);
  };

  const toggleSort = field => {
    if (sortField === field) {
      setSortDir(current => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter(item => {
      // 1. Text search
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesSearch = searchFields.length > 0
          ? searchFields.some(field => {
              const val = item[field];
              return val && String(val).toLowerCase().includes(query);
            })
          : Object.values(item).some(val => val && String(val).toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // 2. Custom filters
      for (const [key, filterVal] of Object.entries(filters)) {
        if (!filterVal || filterVal === "all") continue;
        if (String(item[key]) !== String(filterVal)) {
          return false;
        }
      }

      return true;
    });
  }, [data, search, searchFields, filters]);

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let result = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        result = aVal - bVal;
      } else {
        result = String(aVal).localeCompare(String(bVal));
      }

      return sortDir === "asc" ? result : -result;
    });
  }, [filteredData, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  return {
    search,
    setSearch: val => { setSearch(val); setPage(1); },
    filters,
    setFilter,
    clearFilters,
    sortField,
    sortDir,
    toggleSort,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize: size => { setPageSize(size); setPage(1); },
    totalItems: sortedData.length,
    totalPages,
    items: paginatedData,
  };
}
