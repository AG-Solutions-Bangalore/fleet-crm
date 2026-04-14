// import {
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   ArrowUpDown,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   ChevronUp,
//   Search,
//   SquarePlus,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Link } from "react-router-dom";

// const DataTable = ({
//   data = [],
//   columns = [],
//   pageSize = 10,
//   searchPlaceholder = "Search...",
//   addButton,
//   extraButton,
// }) => {
//   const [sorting, setSorting] = useState([]);
//   const [globalFilter, setGlobalFilter] = useState("");
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize,
//   });

//   const table = useReactTable({
//     data,
//     columns,
//     state: {
//       sorting,
//       globalFilter,
//       pagination,
//     },
//     onSortingChange: setSorting,
//     onGlobalFilterChange: setGlobalFilter,
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//   });

//   return (
//     <div className="space-y-3">
//       <div className="flex items-center justify-between py-1">
//         <div className="relative w-64">
//           <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
//           <Input
//             value={globalFilter ?? ""}
//             onChange={(e) => setGlobalFilter(e.target.value)}
//             placeholder={searchPlaceholder}
//             onKeyDown={(e) => {
//               if (e.key === "Escape") {
//                 setGlobalFilter("");
//               }
//             }}
//             className="pl-8 h-9 text-sm bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
//           />
//         </div>
//         <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="sm" className="h-9">
//                 Columns <ChevronDown className="ml-2 h-3 w-3" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-40">
//               {table
//                 .getAllColumns()
//                 .filter((column) => column.getCanHide())
//                 .map((column) => {
//                   const columnDef = columns.find(
//                     (col) =>
//                       col.accessorKey === column.id || col.id === column.id,
//                   );

//                   return (
//                     <DropdownMenuCheckboxItem
//                       key={column.id}
//                       className="text-xs capitalize"
//                       checked={column.getIsVisible()}
//                       onCheckedChange={(value) =>
//                         column.toggleVisibility(!!value)
//                       }
//                     >
//                       {columnDef?.header || column.id}
//                     </DropdownMenuCheckboxItem>
//                   );
//                 })}
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {addButton &&
//             (addButton.to ? (
//               <Link to={addButton.to}>
//                 <Button variant="default" size="sm" className="h-9">
//                   <SquarePlus className="h-3 w-3 mr-2" />
//                   {addButton.label}
//                 </Button>
//               </Link>
//             ) : (
//               <Button
//                 variant="default"
//                 size="sm"
//                 className="h-9"
//                 onClick={addButton.onClick}
//               >
//                 <SquarePlus className="h-3 w-3 mr-2" />
//                 {addButton.label}
//               </Button>
//             ))}
//           {extraButton}
//         </div>
//       </div>

//       <div className="rounded-none border min-h-[31rem] grid grid-cols-1">
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((hg) => (
//               <TableRow key={hg.id}>
//                 {/* {headerGroup.headers.map((header) => (
//                   <TableHead key={header.id}>
//                     {flexRender(
//                       header.column.columnDef.header,
//                       header.getContext(),
//                     )}
//                   </TableHead>
//                 ))} */}
//                 {hg.headers.map((header) => {
//                   const canSort = header.column.getCanSort();
//                   const sortState = header.column.getIsSorted();

//                   return (
//                     <TableHead
//                       key={header.id}
//                       onClick={
//                         canSort
//                           ? header.column.getToggleSortingHandler()
//                           : undefined
//                       }
//                       className={canSort ? "cursor-pointer select-none" : ""}
//                     >
//                       <div className="flex items-center gap-1">
//                         {flexRender(
//                           header.column.columnDef.header,
//                           header.getContext(),
//                         )}

//                         {canSort && (
//                           <>
//                             {sortState === "asc" && (
//                               <ChevronUp className="h-3 w-3" />
//                             )}
//                             {sortState === "desc" && (
//                               <ChevronDown className="h-3 w-3" />
//                             )}
//                             {!sortState && (
//                               <ArrowUpDown className="h-3 w-3 opacity-40" />
//                             )}
//                           </>
//                         )}
//                       </div>
//                     </TableHead>
//                   );
//                 })}
//               </TableRow>
//             ))}
//           </TableHeader>

//           <TableBody>
//             {table.getRowModel().rows.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow key={row.id}>
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext(),
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={columns.length} className="text-center">
//                   No data found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       <div className="flex items-center justify-between gap-2">
//         <div className="flex-1 text-sm text-muted-foreground">
//           Total Records: {table.getFilteredRowModel().rows.length}
//         </div>
//         <div className="flex items-center justify-end gap-2">
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//           >
//             <ChevronLeft className="h-4 w-4" />
//           </Button>

//           <span className="text-sm">
//             Page {table.getState().pagination.pageIndex + 1} of{" "}
//             {table.getPageCount()}
//           </span>

//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//           >
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DataTable;
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  SquarePlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

const DataTable = ({
  data = [],
  columns = [],
  pageSize = 10,
  searchPlaceholder = "Search...",
  addButton,
  extraButton,

  // backend pagination props
  backendPagination = false,
  page = 1,
  totalPages = 1,
  totalRecords = 0,
  onPageChange,
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),

    // use frontend pagination only if backendPagination = false
    ...(backendPagination
      ? {}
      : { getPaginationRowModel: getPaginationRowModel() }),
  });

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex items-center justify-between py-1">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto">
          {/* COLUMN TOGGLE */}
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
                .map((column) => {
                  const columnDef = columns.find(
                    (col) =>
                      col.accessorKey === column.id || col.id === column.id,
                  );

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      className="text-xs capitalize"
                    >
                      {columnDef?.header || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {extraButton}
          {/* ADD BUTTON */}
          {addButton &&
            (addButton.to ? (
              <Link to={addButton.to}>
                <Button size="sm" className="h-9">
                  <SquarePlus className="h-3 w-3 mr-2" />
                  {addButton.label}
                </Button>
              </Link>
            ) : (
              <Button size="sm" className="h-9" onClick={addButton.onClick}>
                <SquarePlus className="h-3 w-3 mr-2" />
                {addButton.label}
              </Button>
            ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-lg shadow-[0_0_2px_0_rgba(0,0,0,0.1)] border min-h-[31rem] grid grid-cols-1 p-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={canSort ? "cursor-pointer select-none" : ""}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}

                        {canSort && (
                          <>
                            {sortState === "asc" && (
                              <ChevronUp className="h-3 w-3" />
                            )}
                            {sortState === "desc" && (
                              <ChevronDown className="h-3 w-3" />
                            )}
                            {!sortState && (
                              <ArrowUpDown className="h-3 w-3 opacity-40" />
                            )}
                          </>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                <TableCell colSpan={columns.length} className="text-center">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Total Records:{" "}
          {backendPagination
            ? totalRecords
            : table.getFilteredRowModel().rows.length}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              backendPagination ? onPageChange(page - 1) : table.previousPage()
            }
            disabled={
              backendPagination ? page === 1 : !table.getCanPreviousPage()
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm">
            Page{" "}
            {backendPagination
              ? page
              : table.getState().pagination.pageIndex + 1}{" "}
            of {backendPagination ? totalPages : table.getPageCount()}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              backendPagination ? onPageChange(page + 1) : table.nextPage()
            }
            disabled={
              backendPagination ? page === totalPages : !table.getCanNextPage()
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
