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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BASE_URL from "@/config/base-url";
import useNumericInput from "@/hooks/use-numeric-input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Search,
  SquarePlus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ImageCell from "@/components/common/ImageCell";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";

const DriverList = () => {
  const queryClient = useQueryClient();
  const keyDown = useNumericInput();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  const pagination = {
    pageIndex: currentPage - 1,
    pageSize: 10,
  };

  const handleEditDriver = (id) => {
    navigate(
      `/driver/driver-edit/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
    );
  };
  const handleViewDriver = (id) => {
    navigate(
      `/driver/driver-view/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
    );
  };

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ driverId, newStatus }) => {
      const token = Cookies.get("token");
      const response = await axios.patch(
        `${BASE_URL}/api/drivers/${driverId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["drivers", searchQuery, currentPage],
      });
    },
    onError: (error) => {
      console.error("Failed to update driver status:", error);
    },
  });

  const handleToggleStatus = (driverId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    toggleStatusMutation.mutate({ driverId, newStatus });
  };

  // Page Restoration via URL (Previously Cookie-based) handled by searchParams init
  const [pageInput, setPageInput] = useState("");

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm !== searchQuery) {
        setSearchParams(
          (prev) => {
            const newParams = new URLSearchParams(prev);
            if (searchTerm) {
              newParams.set("search", searchTerm);
            } else {
              newParams.delete("search");
            }
            newParams.set("page", "1");
            return newParams;
          },
          { replace: true },
        );
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, searchQuery, setSearchParams]);

  const {
    data: driversPayload,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["drivers", searchQuery, currentPage],
    queryFn: async () => {
      const token = Cookies.get("token");
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await axios.get(`${BASE_URL}/api/driver?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const driversData = driversPayload?.data;
  const image_url_array = driversPayload?.image_url || [];
  const IMAGE_FOR = "Driver";
  const driverImageBaseUrl = getImageBaseUrl(image_url_array, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(image_url_array);

  useEffect(() => {
    const currentPage = pagination.pageIndex + 1;
    const totalPages = driversData?.last_page || 1;

    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: ["drivers", searchQuery, nextPage],
        queryFn: async () => {
          const token = Cookies.get("token");
          const params = new URLSearchParams({
            page: nextPage.toString(),
          });

          if (searchQuery) {
            params.append("search", searchQuery);
          }

          const response = await axios.get(`${BASE_URL}/api/driver?${params}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
      });
    }

    if (currentPage > 1) {
      const prevPage = currentPage - 1;

      if (!queryClient.getQueryData(["drivers", searchQuery, prevPage])) {
        queryClient.prefetchQuery({
          queryKey: ["drivers", searchQuery, prevPage],
          queryFn: async () => {
            const token = Cookies.get("token");
            const params = new URLSearchParams({
              page: prevPage.toString(),
            });

            if (searchQuery) {
              params.append("search", searchQuery);
            }

            const response = await axios.get(
              `${BASE_URL}/api/driver?${params}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            );
            return response.data;
          },
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [
    currentPage,
    searchQuery,
    queryClient,
    driversData?.last_page,
  ]);

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({
    UUID: false,
  });
  const [rowSelection, setRowSelection] = useState({});

  const columns = [
    {
      id: "S. No.",
      header: "S. No.",
      cell: ({ row }) => {
        const globalIndex =
          pagination.pageIndex * pagination.pageSize + row.index + 1;
        return <div className="text-xs font-medium">{globalIndex}</div>;
      },
      size: 60,
    },
    {
      id: "selfie_image",
      header: "Image",
      cell: ({ row }) => {
        const fileName = row.original.selfie_image;
        let src;
        if (fileName) {
          if (fileName.startsWith("http")) {
            src = fileName;
          } else {
            src = `${driverImageBaseUrl}${fileName}`;
          }
        } else {
          src = noImageUrl;
        }

        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt="Selfie"
            width={40}
            height={40}
            className="rounded-md w-10 h-10 object-cover"
          />
        );
      },
      size: 80,
    },
    {
      accessorKey: "name",
      id: "Name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Name
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-[13px] font-medium">
          {row.original.name} {row.original.surname}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "UUID",
      id: "UUID",
      header: "UUID",
      cell: ({ row }) => (
        <div className="text-xs font-mono">{row.getValue("UUID")}</div>
      ),
      size: 200,
    },
    {
      id: "Contact Info",
      header: "Contact Info",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="font-medium">Email:</span>{" "}
            {row.original.email || "-"}
          </div>
          <div className="text-xs">
            <span className="font-medium">Mobile:</span>{" "}
            {row.original.mobile || "-"}
          </div>
        </div>
      ),
      size: 250,
    },
    {
      id: "aadhar_no",
      header: "Aadhar No",
      cell: ({ row }) => (
        <div className="text-xs">{row.original.aadhar_no || "-"}</div>
      ),
      size: 120,
    },
    {
      id: "dl_expiry_date",
      header: "DL Expiry",
      cell: ({ row }) => (
        <div className="text-xs">{row.original.dl_expiry_date || "-"}</div>
      ),
      size: 120,
    },
    {
      id: "dl_submitted",
      header: "DL Submitted",
      cell: ({ row }) => (
        <div className="text-xs">{row.original.dl_submitted || "-"}</div>
      ),
      size: 120,
    },
    {
      id: "pcc_status",
      header: "PCC Status",
      cell: ({ row }) => (
        <div className="text-xs">{row.original.pcc_status || "-"}</div>
      ),
      size: 120,
    },
    {
      id: "doj",
      header: "DOJ",
      cell: ({ row }) => (
        <div className="text-xs">{row.original.doj || "-"}</div>
      ),
      size: 120,
    },
    {
      accessorKey: "status",
      id: "Status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Status
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("Status");
        const isActive = status === "Active";
        const driverId = row.original.id;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStatus(driverId, status)}
                  disabled={toggleStatusMutation.isLoading}
                  className="h-7 px-2"
                >
                  {isActive ? (
                    <ToggleRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-red-600" />
                  )}
                  <span
                    className={`ml-2 text-xs font-medium ${isActive ? "text-green-600" : "text-red-600"}`}
                  >
                    {status}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to toggle status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 120,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const id = row.original.id;

        return (
          <div className="flex flex-row gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewDriver(id)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Driver</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditDriver(id)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Driver</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      size: 80,
    },
  ];

  const table = useReactTable({
    data: driversData?.data || [],
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
    pageCount: driversData?.last_page || -1,
    onPaginationChange: (updater) => {
      const nextPagination =
        typeof updater === "function" ? updater(pagination) : updater;
      handlePageChange(nextPagination.pageIndex);
    },
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

  const handlePageChange = (newPage) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("page", newPage.toString());
        return newParams;
      },
      { replace: true },
    );
  };

  const handlePageInput = (e) => {
    const value = e.target.value;
    setPageInput(value);

    if (value && !isNaN(value)) {
      const pageNum = parseInt(value);
      if (pageNum >= 1 && pageNum <= table.getPageCount()) {
        handlePageChange(pageNum);
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
        onClick={() => handlePageChange(1)}
        className="h-8 w-8 p-0 text-xs"
      >
        1
      </Button>,
    );

    if (currentPage > 3) {
      buttons.push(
        <span key="ellipsis1" className="px-2">
          ...
        </span>,
      );
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i !== 1 && i !== totalPages) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(i)}
            className="h-8 w-8 p-0 text-xs"
          >
            {i}
          </Button>,
        );
      }
    }

    if (currentPage < totalPages - 2) {
      buttons.push(
        <span key="ellipsis2" className="px-2">
          ...
        </span>,
      );
    }

    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          className="h-8 w-8 p-0 text-xs"
        >
          {totalPages}
        </Button>,
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
      <div className="w-full p-4  ">
        <div className="flex items-center justify-center h-64 ">
          <div className="text-center ">
            <div className="text-destructive font-medium mb-2">
              Error Fetching Drivers List Data
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
      <div className="flex items-center justify-between py-1">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search drivers..."
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
        <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto">
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
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            to={`/driver/driver-create${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
          >
            <Button variant="default">
              <SquarePlus className="h-3 w-3 mr-2" /> Create Driver
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-none border min-h-[31rem] grid grid-cols-1">
        <Table className="flex-1">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 px-3 bg-[var(--team-color)] text-[var(--label-color)]  text-sm font-medium"
                    style={{ width: header.column.columnDef.size }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
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
                  className={`h-2 hover:bg-gray-50 ${
                    row.original.uid_match_status !== "Matched"
                      ? "bg-red-50 hover:bg-red-100/80"
                      : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-1">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="h-12">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm"
                >
                  No drivers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-1">
        <div className="text-sm text-muted-foreground">
          Showing {driversData?.from || 0} to {driversData?.to || 0} of{" "}
          {driversData?.total || 0} drivers
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
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
            onClick={() => handlePageChange(currentPage + 1)}
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

export default DriverList;
