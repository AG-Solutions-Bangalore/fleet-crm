import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Loader2,
  Search,
  SquarePlus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "sonner";

const AlternateVehicleList = () => {
  const queryClient = useQueryClient();
  const keyDown = useNumericInput();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [pageInput, setPageInput] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const token = Cookies.get("token");

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm) setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const {
    data: listData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [
      "alternate-rides",
      debouncedSearchTerm,
      pagination.pageIndex + 1,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
      });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);

      const response = await axios.get(
        `${BASE_URL}/api/vehicle-alternate-ride?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data?.data || { data: [], total: 0, last_page: 1 };
    },
    keepPreviousData: true,
  });

  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/vehicle-alternate-ride/${idToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.status === 200 || response.data.code === 200) {
        toast.success("Record deleted successfully");
        refetch();
      }
    } catch (error) {
      toast.error("Failed to delete record");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setIdToDelete(null);
    }
  };

  const columns = [
    {
      id: "S. No.",
      header: "S. No.",
      cell: ({ row }) => {
        const globalIndex =
          pagination.pageIndex * pagination.pageSize + row.index + 1;
        return <div className="text-gray-700">{globalIndex}</div>;
      },
      size: 60,
    },
    {
      accessorKey: "vehicle_number_plate",
      id: "Number Plate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs uppercase font-semibold px-2 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vehicle Number
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-gray-700">{row.getValue("Number Plate")}</div>
      ),
      size: 150,
    },
    {
      accessorKey: "vehicle_variant",
      id: "Variant",
      header: "Variant",
      cell: ({ row }) => (
        <div className="text-gray-700">{row.getValue("Variant")}</div>
      ),
      size: 150,
    },
    {
      accessorKey: "vehicle_product_type",
      id: "Product Type",
      header: "Running Platform",
      cell: ({ row }) => (
        <div className="text-gray-700">{row.getValue("Product Type")}</div>
      ),
      size: 150,
    },
    {
      accessorKey: "merchant_id",
      id: "Merchant id",
      header: "Merchant id",
      cell: ({ row }) => (
        <div className="text-gray-700">{row.getValue("Merchant id")}</div>
      ),
      size: 120,
    },
    {
      accessorKey: "driver_fullname",
      id: "Driver",
      header: "Driver Name",
      cell: ({ row }) => (
        <div className="text-gray-700">{row.getValue("Driver")}</div>
      ),
      size: 180,
    },
    {
      accessorKey: "vehicles_ride_date",
      id: "Ride Date",
      header: "Ride Date",
      cell: ({ row }) => {
        const date = row.original.vehicles_ride_date;
        if (!date || date === "0000-00-00") return "N/A";
        const m = moment(date);
        return (
          <div className="text-gray-700">
            {m.isValid() ? m.format("DD-MM-YYYY") : "N/A"}
          </div>
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
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      navigate(`/alternate-vehicle-ride/edit/${id}`)
                    }
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteClick(id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      size: 80,
    },
  ];

  const table = useReactTable({
    data: listData?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    manualPagination: true,
    pageCount: listData?.last_page || -1,
    onPaginationChange: setPagination,
    state: { pagination, columnVisibility, sorting },
  });

  const handlePageChange = (newPageIndex) => {
    setPagination((prev) => ({ ...prev, pageIndex: newPageIndex }));
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
            onClick={() => handlePageChange(i - 1)}
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
          onClick={() => handlePageChange(totalPages - 1)}
          className="h-8 w-8 p-0 text-xs"
        >
          {totalPages}
        </Button>,
      );
    }

    return buttons;
  };

  if (isError) {
    return (
      <div className="w-full p-4">
        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <div className="text-destructive font-medium mb-2">
              Error fetching alternate rides
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full p-2 space-y-2">
      <div className="flex items-center justify-between py-1">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search alternate rides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
          />
        </div>
        <div className="flex items-center gap-2">
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
          <Link to="/alternate-vehicle-ride/create">
            <Button variant="default" size="sm" className="h-9">
              <SquarePlus className="h-4 w-4 mr-2" /> Create Ride
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-none border min-h-[31rem] grid grid-cols-1 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-10 px-3 bg-[var(--team-color)] text-white text-xs font-bold uppercase tracking-wider"
                      style={{ width: header.column.columnDef.size }}
                    >
                      {flexRender(
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
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-muted-foreground animate-pulse">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Syncing records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="h-10 hover:bg-gray-50 transition-colors border-b last:border-0"
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
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between py-1">
        <div className="text-sm text-muted-foreground">
          Showing {listData?.from || 0} to {listData?.to || 0} of{" "}
          {listData?.total || 0} records
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
              className="w-16 h-8 text-sm px-1.5"
              placeholder="Page"
            />
            <span>of {table.getPageCount() || 1}</span>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              ride assignment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Record"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AlternateVehicleList;
