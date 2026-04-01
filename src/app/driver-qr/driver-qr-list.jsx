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
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Search, QrCode, UserPlus, ToggleLeft, ToggleRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import CreateDriverQr from "./create-driver-qr";

const DriverQrTable = ({ apiEndpoint, queryKey, searchTerm, onSearchChange, columns }) => {
  const queryClient = useQueryClient();
  const keyDown = useNumericInput();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageInput, setPageInput] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const {
    data: listData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [queryKey, searchTerm, pagination.pageIndex + 1],
    queryFn: async () => {
      const token = Cookies.get("token");
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
      });
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      const response = await axios.get(`${BASE_URL}/api/${apiEndpoint}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data.data;
    },
    keepPreviousData: true,
    staleTime: 1000, // Reduced staleTime for faster updates
  });

  const table = useReactTable({
    data: listData?.data || [],
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
    pageCount: listData?.last_page || -1,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const handlePageChange = (newPageIndex) => {
    table.setPageIndex(newPageIndex);
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

    if (currentPage > 3) buttons.push(<span key="ellipsis1" className="px-2">...</span>);

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

    if (currentPage < totalPages - 2) buttons.push(<span key="ellipsis2" className="px-2">...</span>);

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

  const TableShimmer = () => (
    Array.from({ length: 10 }).map((_, index) => (
      <TableRow key={index} className="animate-pulse h-11">
        {table.getVisibleFlatColumns().map((column) => (
          <TableCell key={column.id} className="py-1">
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </TableCell>
        ))}
      </TableRow>
    ))
  );

  if (isError) {
    return (
      <div className="w-full p-4 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-destructive font-medium mb-2">Error Fetching Data</div>
          <Button onClick={() => refetch()} variant="outline" size="sm">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-1">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                Columns <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table.getAllColumns().filter(c => c.getCanHide()).map(c => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  className="text-xs capitalize"
                  checked={c.getIsVisible()}
                  onCheckedChange={(v) => c.toggleVisibility(!!v)}
                >
                  {c.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <CreateDriverQr refetch={refetch} />
        </div>
      </div>

      <div className="rounded-none border min-h-[31rem]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(h => (
                  <TableHead key={h.id} className="h-10 px-3 bg-[var(--team-color)] text-[var(--label-color)] text-sm font-medium">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFetching && !table.getRowModel().rows.length ? (
              <TableShimmer />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="h-2 hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="px-3 py-1">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">No records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-1">
        <div className="text-sm text-muted-foreground">
          Showing {listData?.from || 0} to {listData?.to || 0} of {listData?.total || 0} records
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.pageIndex - 1)} disabled={!table.getCanPreviousPage()} className="h-8 px-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-1">{generatePageButtons()}</div>
          <div className="flex items-center space-x-2 text-sm">
            <span>Go to</span>
            <input
              type="tel"
              value={pageInput}
              onChange={handlePageInput}
              onKeyDown={keyDown}
              className="w-16 h-8 rounded-md border px-2 text-sm"
              placeholder="Page"
            />
            <span>of {table.getPageCount()}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.pageIndex + 1)} disabled={!table.getCanNextPage()} className="h-8 px-2">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const DriverQrList = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      const token = Cookies.get("token");
      const response = await axios.patch(
        `${BASE_URL}/api/driver-qrs/${id}/status`,
        { driver_qr_status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.code === 200 || data.code === 201 || data.status === "success") {
        toast.success(data.message || "Status updated successfully");
        queryClient.invalidateQueries({ queryKey: ["assignlist"], exact: false });
        queryClient.invalidateQueries({ queryKey: ["non-assignlist"], exact: false });
      } else {
        toast.error(data.message || "Failed to update status");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    toggleStatusMutation.mutate({ id, newStatus });
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const assignedColumns = useMemo(() => [
    {
      id: "S. No.",
      header: "S. No.",
      cell: ({ row }) => row.index + 1,
      size: 70,
    },
    {
      accessorKey: "merchant_id",
      id: "Merchant ID",
      header: "Merchant ID",
      cell: ({ row }) => <div className="text-xs font-medium">{row.original.merchant_id || "-"}</div>,
    },
    {
      accessorKey: "driver_qr_fullname",
      id: "Driver Name",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-2 h-8 text-xs">
          Driver Name <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-xs font-medium">{row.original.driver_qr_fullname || "-"}</div>,
    },
    {
      accessorKey: "driver_qr_UUID",
      id: "QR UUID",
      header: "QR UUID",
      cell: ({ row }) => <div className="text-xs font-mono">{row.original.driver_qr_UUID || "-"}</div>,
    },
    {
      accessorKey: "driver_qr_status",
      id: "Status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.driver_qr_status;
        const isActive = status === "Active";
        const id = row.original.id;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStatus(id, status)}
                  disabled={toggleStatusMutation.isLoading}
                  className="h-7 px-2 hover:bg-muted transition-colors rounded-md"
                >
                  {isActive ? (
                    <ToggleRight className="h-6 w-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-red-600" />
                  )}
                  <span className={`ml-2 text-xs font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {status || "-"}
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
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <CreateDriverQr editData={row.original} refetch={() => queryClient.invalidateQueries({ queryKey: ["assignlist"], exact: false })} />
        </div>
      ),
      size: 80,
    },
  ], []);

  const pendingColumns = useMemo(() => [
    {
      id: "S. No.",
      header: "S. No.",
      cell: ({ row }) => row.index + 1,
      size: 70,
    },
    {
      accessorKey: "merchant_id",
      id: "Merchant ID",
      header: "Merchant ID",
      cell: ({ row }) => <div className="text-xs font-medium">{row.original.merchant_id || "-"}</div>,
    },
    {
      accessorKey: "driver_qr_fullname",
      id: "Driver Name",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-2 h-8 text-xs">
          Driver Name <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-xs font-medium">{row.original.driver_qr_fullname || "-"}</div>,
    },
    {
      accessorKey: "driver_qr_UUID",
      id: "QR UUID",
      header: "QR UUID",
      cell: ({ row }) => <div className="text-xs font-mono">{row.original.driver_qr_UUID || "-"}</div>,
    },
    {
      accessorKey: "driver_qr_status",
      id: "Status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.driver_qr_status;
        const isActive = status === "Active";
        const id = row.original.id;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStatus(id, status)}
                  disabled={toggleStatusMutation.isLoading}
                  className="h-7 px-2 hover:bg-muted transition-colors rounded-md"
                >
                  {isActive ? (
                    <ToggleRight className="h-6 w-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-red-600" />
                  )}
                  <span className={`ml-2 text-xs font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {status || "-"}
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
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <CreateDriverQr editData={row.original} refetch={() => queryClient.invalidateQueries({ queryKey: ["non-assignlist"], exact: false })} />
        </div>
      ),
      size: 80,
    },
  ], []);

  return (
    <div className="p-4 bg-white min-h-screen">

      <Tabs defaultValue="assignlist" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="assignlist" className="py-2">Assigned List</TabsTrigger>
          <TabsTrigger value="non-assignlist" className="py-2">Pending Assign</TabsTrigger>
        </TabsList>

        <TabsContent value="assignlist">
          <DriverQrTable
            apiEndpoint="driver-qr"
            queryKey="assignlist"
            searchTerm={debouncedSearchTerm}
            onSearchChange={setSearchTerm}
            columns={assignedColumns}
          />
        </TabsContent>
        <TabsContent value="non-assignlist">
          <DriverQrTable
            apiEndpoint="pending-driver-qr-assign-list"
            queryKey="non-assignlist"
            searchTerm={debouncedSearchTerm}
            onSearchChange={setSearchTerm}
            columns={pendingColumns}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverQrList;
