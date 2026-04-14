import { REQUEST_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Request_service() {
  const { trigger, loading, error } = useApiMutation();
  const [reportData, setReportData] = useState([]);

  const [fromDate, setFromDate] = useState(moment().startOf("month").toDate());
  const [toDate, setToDate] = useState(moment().toDate());
  const [status, setStatus] = useState("all");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReport = async () => {
    try {
      const response = await trigger({
        url: REQUEST_API.report,
        method: "post",
        data: {
          from_date: moment(fromDate).format("YYYY-MM-DD"),
          to_date: moment(toDate).format("YYYY-MM-DD"),
        },
      });
      setReportData(response?.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch service request report:", err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const filteredData = reportData.filter((item) => {
    if (status === "all") return true;
    return item.services_request_status?.toLowerCase() === status;
  });

  // pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleExportExcel = () => {
    if (filteredData.length === 0) return;

    const exportData = filteredData.map((item) => ({
      "Request Date": item.services_request_date
        ? moment(item.services_request_date).format("YYYY-MM-DD")
        : "-",
      "User M_ID": item.user_m_id || "-",
      "User Name": item.name || "-",
      "Service ID": item.service_id || "-",
      "Service Name": item.service_name || "-",
      Status: item.services_request_status || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Service Requests");

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
    ];

    XLSX.writeFile(workbook, "Service_Request_Report.xlsx");
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Service Request Report
        </h2>

        <Button
          onClick={handleExportExcel}
          disabled={loading || filteredData.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Requests</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex justify-between items-center gap-10">
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-none">
                  From Date
                </label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {moment(fromDate).format("ll")}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      disabled={(date) => date > toDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-none">
                  To Date
                </label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !toDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {moment(toDate).format("ll")}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      disabled={(date) => date < fromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button onClick={fetchReport} disabled={loading}>
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" /> Search
                  </>
                )}
              </Button>
            </div>

            <div className="w-full flex">
              <div className="flex flex-col gap-2 w-1/3">
                <label className="text-sm font-medium leading-none">
                  Status
                </label>

                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="cancel">Cancel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Data</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="text-red-500 py-4 text-center">
              Failed to load service request data.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request Date</TableHead>
                      <TableHead>User M_ID</TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            {request.services_request_date
                              ? moment(request.services_request_date).format(
                                  "DD-MM-YYYY",
                                )
                              : "-"}
                          </TableCell>

                          <TableCell>{request.user_m_id || "-"}</TableCell>
                          <TableCell>{request.name || "-"}</TableCell>
                          <TableCell>{request.service_name || "-"}</TableCell>

                          <TableCell
                            className={`${
                              request.services_request_status === "Pending"
                                ? "text-yellow-500"
                                : request.services_request_status === "Approved"
                                  ? "text-green-500"
                                  : "text-red-500"
                            }`}
                          >
                            {request.services_request_status || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No service requests found for this date range.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}

              <div className="flex justify-end items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Request_service;
