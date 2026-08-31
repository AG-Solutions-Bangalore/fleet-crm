import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BASE_URL from "@/config/base-url";
import useNumericInput from "@/hooks/use-numeric-input";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  ArrowUpDown,
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import moment from "moment";
import CreateDailyCash from "./create-daily-cash";


const DailyCashList = () => {
  const queryClient = useQueryClient();
  const keyDown = useNumericInput();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const apiSearchTerm = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return "";
    return debouncedSearchTerm.trim().split(/\s+/)[0];
  }, [debouncedSearchTerm]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [pageInput, setPageInput] = useState("");

  const storeCurrentPage = () => {
    Cookies.set("dailyCashReturnPage", (pagination.pageIndex + 1).toString(), {
      expires: 1
    });
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = Cookies.get("token");

      const response = await axios.delete(
        `${BASE_URL}/api/daily-cash/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Daily cash deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["daily-cash", apiSearchTerm, pagination.pageIndex + 1],
      });
      setDeleteDialogOpen(false);
      setSelectedId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete daily cash");
      setDeleteDialogOpen(false);
      setSelectedId(null);
    },
  });

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = (id) => {
    if (id) {
      deleteMutation.mutate(id);
    }
  };

  useEffect(() => {
    const savedPage = Cookies.get("dailyCashReturnPage");
    if (savedPage) {
      Cookies.remove("dailyCashReturnPage");

      setTimeout(() => {
        const pageIndex = parseInt(savedPage) - 1;
        if (pageIndex >= 0) {
          setPagination(prev => ({ ...prev, pageIndex }));
          setPageInput(savedPage);

          queryClient.invalidateQueries({
            queryKey: ["daily-cash"],
            exact: false,
          });
        }
      }, 100);
    }
  }, [queryClient]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm !== debouncedSearchTerm) {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        setDebouncedSearchTerm(searchTerm);
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, debouncedSearchTerm]);

  const {
    data: dailyCashData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["daily-cash", apiSearchTerm, pagination.pageIndex + 1],
    queryFn: async () => {
      const token = Cookies.get("token");
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
      });

      if (apiSearchTerm) {
        params.append("search", apiSearchTerm);
      }

      const response = await axios.get(
        `${BASE_URL}/api/daily-cash?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data.data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    data: dailyCashPushDatesResponse,
    isLoading: isPushDatesLoading,
    refetch: refetchPushDates,
  } = useQuery({
    queryKey: ["daily-cash-push-dates"],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/getDailyCashPushDate`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    },
  });

  const categorizedDates = useMemo(() => {
    const data = dailyCashPushDatesResponse?.data || dailyCashPushDatesResponse;
    if (!data) return {};

    // Check if data is an object containing arrays like { "Uber Black": [...], "Uber Green": [...] }
    if (typeof data === "object" && !Array.isArray(data)) {
      const result = {};
      let hasCategories = false;
      for (const [key, val] of Object.entries(data)) {
        if (Array.isArray(val)) {
          hasCategories = true;
          const set = new Set();
          val.forEach((item) => {
            const dateStr =
              typeof item === "string"
                ? item
                : item?.daily_cash_push_date ||
                  item?.push_date ||
                  item?.cash_push_date ||
                  item?.date;
            if (dateStr && moment(dateStr).isValid()) {
              set.add(moment(dateStr).format("YYYY-MM-DD"));
            }
          });
          result[key] = set;
        }
      }
      if (hasCategories && Object.keys(result).length > 0) {
        return result;
      }
    }

    // Fallback: single flat list
    const set = new Set();
    const list = Array.isArray(data) ? data : [];
    list.forEach((item) => {
      const dateVal =
        typeof item === "string"
          ? item
          : item?.daily_cash_push_date ||
            item?.push_date ||
            item?.cash_push_date ||
            item?.date;
      if (dateVal && moment(dateVal).isValid()) {
        set.add(moment(dateVal).format("YYYY-MM-DD"));
      }
    });
    return { "Daily Cash Push Dates": set };
  }, [dailyCashPushDatesResponse]);

  useEffect(() => {
    const currentPage = pagination.pageIndex + 1;
    const totalPages = dailyCashData?.last_page || 1;

    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: ["daily-cash", apiSearchTerm, nextPage],
        queryFn: async () => {
          const token = Cookies.get("token");
          const params = new URLSearchParams({
            page: nextPage.toString(),
          });

          if (apiSearchTerm) {
            params.append("search", apiSearchTerm);
          }

          const response = await axios.get(
            `${BASE_URL}/api/daily-cash?${params}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
            }
          );
          return response.data.data;
        },
        staleTime: 5 * 60 * 1000,
      });
    }

    if (currentPage > 1) {
      const prevPage = currentPage - 1;

      if (!queryClient.getQueryData(["daily-cash", apiSearchTerm, prevPage])) {
        queryClient.prefetchQuery({
          queryKey: ["daily-cash", apiSearchTerm, prevPage],
          queryFn: async () => {
            const token = Cookies.get("token");
            const params = new URLSearchParams({
              page: prevPage.toString(),
            });

            if (apiSearchTerm) {
              params.append("search", apiSearchTerm);
            }

            const response = await axios.get(
              `${BASE_URL}/api/daily-cash?${params}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                },
              }
            );
            return response.data.data;
          },
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [pagination.pageIndex, apiSearchTerm, queryClient, dailyCashData?.last_page]);

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({
    "Driver Email": false,
    "Driver Mobile": false,
  });
  const [rowSelection, setRowSelection] = useState({});

  const columns = [
    {
      id: "S. No.",
      header: "S. No.",
      cell: ({ row }) => {
        const globalIndex = (pagination.pageIndex * pagination.pageSize) + row.index + 1;
        return <div className="text-xs font-medium">{globalIndex}</div>;
      },
      size: 70,
    },
    {
      accessorKey: "transaction_date",
      id: "Transaction Date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Date
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-xs">{moment(row.getValue("Transaction Date")).format("DD-MM-YYYY")}</div>,
    },
    {
      accessorKey: "transaction_time",
      id: "Transaction Time",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Time
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-xs">{row.getValue("Transaction Time")}</div>,
      // size: 120,
    },
    {
      accessorKey: "merchant_id",
      id: "Merchant ID",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Merchant ID
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        return <div className="text-xs font-medium">{row.getValue("Merchant ID")}</div>;
      },
      // size: 120,
    },
    {
      accessorKey: "amount",
      id: "Amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Amount (₹)
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("Amount"));
        return <div className="text-xs">₹{amount.toFixed(2)}</div>;
      },
      // size: 120,
    },
    {
      accessorKey: "transaction_amount",
      id: "Transaction Amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Transaction (₹)
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("Transaction Amount"));
        return <div className="text-xs">₹{amount.toFixed(2)}</div>;
      },
      // size: 80,
    },
    {
      accessorKey: "discount_amount",
      id: "Discount Amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Discount (₹)
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const rate = parseFloat(row.getValue("Discount Amount"));
        return <div className="text-xs">₹{rate.toFixed(2)}</div>;
      },
      // size: 100,
    },
    {
      accessorKey: "push_date",
      id: "Push Date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Push Date
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-xs">{moment(row.getValue("Push Date")).format("DD-MM-YYYY")}</div>,
      // size: 100,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const id = row.original;

        return (
          <div className="flex flex-row">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(id)}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Daily Cash</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      size: 80,
    },
  ];

  const rawList = dailyCashData?.data || [];
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return rawList;
    const words = debouncedSearchTerm
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length <= 1) return rawList;

    return rawList.filter((item) => {
      const searchCorpus = `${item.driver_full_name || ""} ${item.driver_name || ""} ${item.driver_surname || ""} ${item.driver_mobile || ""} ${item.driver_email || ""} ${item.vehicle_registration_no || ""}`.toLowerCase();
      return words.every((word) => searchCorpus.includes(word));
    });
  }, [rawList, debouncedSearchTerm]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: dailyCashData?.last_page || -1,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handlePageChange = (newPageIndex) => {
    const targetPage = newPageIndex + 1;
    const cachedData = queryClient.getQueryData(["daily-cash", apiSearchTerm, targetPage]);

    if (cachedData) {
      setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
    } else {
      table.setPageIndex(newPageIndex);
    }
  };

  const handlePageInput = (e) => {
    const value = e.target.value;
    setPageInput(value);

    if (value && !isNaN(value)) {
      const pageNum = parseInt(value);
      if (pageNum >= 1 && pageNum <= table.getPageCount()) {
        handlePageChange(pageNum - 1);
      }
    }
  };

  const generatePageButtons = () => {
    const currentPage = pagination.pageIndex + 1;
    const totalPages = table.getPageCount();
    const buttons = [];

    buttons.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => handlePageChange(0)}
        className="h-8 w-8 p-0 text-xs"
      >
        1
      </Button>
    );

    if (currentPage > 3) {
      buttons.push(<span key="ellipsis1" className="px-2">...</span>);
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i !== 1 && i !== totalPages) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(i - 1)}
            className="h-8 w-8 p-0 text-xs"
          >
            {i}
          </Button>
        );
      }
    }

    if (currentPage < totalPages - 2) {
      buttons.push(<span key="ellipsis2" className="px-2">...</span>);
    }

    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(totalPages - 1)}
          className="h-8 w-8 p-0 text-xs"
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  const TableShimmer = () => {
    return Array.from({ length: 10 }).map((_, index) => (
      <TableRow key={index} className="animate-pulse h-11">
        {table.getVisibleFlatColumns().map((column) => (
          <TableCell key={column.id} className="py-1">
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  if (isError) {
    return (
      <div className="w-full p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-destructive font-medium mb-2">
              Error Fetching Daily Cash Data
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full p-2">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this daily cash record.
              {selectedId && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p><span className="font-medium">Date:</span> {moment(selectedId.transaction_date).format("DD-MM-YYYY")}</p>
                  <p><span className="font-medium">Time:</span> {selectedId.transaction_time}</p>
                  <p><span className="font-medium">Merchant ID:</span> {selectedId.merchant_id}</p>
                  <p><span className="font-medium">Amount:</span> {selectedId.amount}</p>
                  <p><span className="font-medium">Transaction:</span> {selectedId.transaction_amount}</p>
                  <p><span className="font-medium">Discount:</span> {selectedId.discount_amount}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete(selectedId?.id)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin">⌛</span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between py-1">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search daily cash..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchTerm("");
              }
            }}
            className="pl-8 h-9 text-sm bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
          />
        </div>
        <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto items-center">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 border-gray-200 hover:bg-gray-50"
              >
                <CalendarIcon className="h-4 w-4 text-green-600" />
                <span className="text-xs">Calendar</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-4 max-w-[95vw] overflow-x-auto">
              <div className="flex items-center justify-between pb-2 mb-3 border-b">
                <p className="text-xs font-semibold text-gray-800">Daily Cash Push Dates</p>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-600"></span>
                  <span>Matched Date</span>
                </div>
              </div>
              {isPushDatesLoading ? (
                <div className="flex justify-center items-center py-8 min-w-[280px]">
                  <Loader className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  {Object.entries(categorizedDates).map(([category, datesSet]) => {
                    const isMatched = (date) => datesSet.has(moment(date).format("YYYY-MM-DD"));
                    const datesArray = Array.from(datesSet).sort();
                    const defaultM = datesArray.length > 0
                      ? moment(datesArray[datesArray.length - 1]).toDate()
                      : new Date();

                    return (
                      <div key={category} className="flex flex-col items-center border rounded-lg p-2 bg-gray-50/50">
                        {Object.keys(categorizedDates).length > 1 && (
                          <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-md w-full justify-center">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                              {category}
                            </span>
                          </div>
                        )}
                        <Calendar
                          mode="single"
                          defaultMonth={defaultM}
                          modifiers={{
                            matched: isMatched,
                          }}
                          modifiersClassNames={{
                            matched:
                              "!bg-green-600 !text-white font-bold hover:!bg-green-700 hover:!text-white rounded-md shadow-sm",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                Columns <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="text-xs capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <CreateDailyCash
            refetch={() => {
              refetch();
              refetchPushDates();
            }}
          />
        </div>
      </div>

      <div className="rounded-none border min-h-[31rem] grid grid-cols-1">
        <Table className="flex-1">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 px-3 bg-[var(--team-color)] text-[var(--label-color)] text-sm font-medium"
                    style={{ width: header.column.columnDef.size }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isFetching && !table.getRowModel().rows.length ? (
              <TableShimmer />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-2 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-1">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="h-12">
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm">
                  No daily cash records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-1">
        <div className="text-sm text-muted-foreground">
          Showing {dailyCashData?.from || 0} to {dailyCashData?.to || 0} of{" "}
          {dailyCashData?.total || 0} records
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.pageIndex - 1)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-1">
            {generatePageButtons()}
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <span>Go to</span>
            <Input
              type="tel"
              min="1"
              max={table.getPageCount()}
              value={pageInput}
              onChange={handlePageInput}
              onBlur={() => setPageInput("")}
              onKeyDown={keyDown}
              className="w-16 h-8 text-sm"
              placeholder="Page"
            />
            <span>of {table.getPageCount()}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.pageIndex + 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyCashList;




