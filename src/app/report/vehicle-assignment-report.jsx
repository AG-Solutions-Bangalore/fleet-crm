import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import { Download, Loader, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as XLSX from "xlsx";

const NA = () => <span className="text-muted-foreground text-xs">N/A</span>;

const fmt = (val) => (val !== null && val !== undefined ? val : null);

const VehicleAssignmentReport = () => {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = Cookies.get("token");

  const fetchReport = async () => {
    if (!fromDate) {
      toast.error("Please select a date");
      return;
    }

    const formData = new FormData();
    formData.append("from_date", fromDate);

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/vehicle-assignment-report`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response?.data?.data) {
        setReportData(response.data.data);
        toast.success("Report fetched successfully");
      } else {
        setReportData([]);
        toast.error("No data found for the selected date");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch vehicle assignment report",
      );
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = reportData
    ? reportData.filter((row) => {
        const search = searchTerm.toLowerCase();
        return (
          row.vehicle_number_plate?.toLowerCase().includes(search) ||
          row.driver_fullname?.toLowerCase().includes(search) ||
          row.mobile?.toLowerCase().includes(search) ||
          row.vehicle_variant?.toLowerCase().includes(search)
        );
      })
    : [];

  const exportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportRows = filteredData.map((row, index) => ({
      "S.No": index + 1,
      "Vehicle Number": row.vehicle_number_plate,
      Variant: row.vehicle_variant ?? "N/A",
      "Product Type": row.vehicle_product_type ?? "N/A",
      Status: row.vehicle_status,
      DOJ: row.doj ?? "N/A",
      "Driver Name": row.driver_fullname ?? "N/A",
      Mobile: row.mobile ?? "N/A",
      "Alternate Mobile": row.alternate_mobile_no ?? "N/A",
      "DL Submitted": row.dl_submitted ?? "N/A",
      "PCC Status": row.pcc_status ?? "N/A",
      Umbrella: row.vehicle_umbrella ?? "N/A",
      "Tissue Box": row.vehicle_tissue_box ?? "N/A",
      "Refer By": row.referby ?? "N/A",
      "Refer By Mobile": row.referby_mobile ?? "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vehicle Assignment");
    XLSX.writeFile(workbook, `vehicle-assignment-report_${fromDate}.xlsx`);
    toast.success("Report exported successfully");
  };

  const cell = (val) => (fmt(val) !== null ? val : <NA />);

  return (
    <div className="w-full flex justify-center py-6 pb-20 overflow-x-hidden">
      <div className="w-full max-w-[1250px]">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              Vehicle Assignment Report
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="min-w-[180px]">
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={fetchReport} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Generate Report"
                  )}
                </Button>

                {reportData && reportData.length > 0 && (
                  <Button onClick={exportToExcel} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                )}
              </div>

              {reportData && reportData.length > 0 && (
                <div className="relative w-64 ml-auto">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search in report..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9 text-sm bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex justify-center items-center py-6">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reportData === null ? (
              <p className="text-center text-muted-foreground py-6">
                Select a date and click "Generate Report"
              </p>
            ) : reportData.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No data available
              </p>
            ) : (
              <div className="w-full border rounded-lg">
                {/* ONLY THIS SCROLLS */}
                <div className="overflow-x-auto">
                  <div className="min-w-[1800px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>S.No</TableHead>
                          <TableHead>Vehicle Number</TableHead>
                          <TableHead>Variant</TableHead>
                          <TableHead>Running Platform</TableHead>
                          <TableHead>Vehicle Status</TableHead>
                          <TableHead>DOJ</TableHead>
                          <TableHead>Driver Name</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Alternate Mobile</TableHead>
                          <TableHead>DL Submitted</TableHead>
                          <TableHead>PCC Status</TableHead>
                          <TableHead>Umbrella</TableHead>
                          <TableHead>Tissue Box</TableHead>
                          <TableHead>Refer By</TableHead>
                          <TableHead>Refer By Mobile</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredData.length > 0 ? (
                          filteredData.map((row, index) => (
                            <TableRow key={index}>
                              {/* ... row cells ... */}
                              <TableCell>{index + 1}</TableCell>
                              <TableCell className="whitespace-nowrap font-medium">
                                {row.vehicle_number_plate}
                              </TableCell>
                              <TableCell>{cell(row.vehicle_variant)}</TableCell>
                              <TableCell>
                                {cell(row.vehicle_product_type)}
                              </TableCell>
                              <TableCell>{row.vehicle_status}</TableCell>
                              <TableCell>{cell(row.doj)}</TableCell>
                              <TableCell>{cell(row.driver_fullname)}</TableCell>
                              <TableCell>{cell(row.mobile)}</TableCell>
                              <TableCell>
                                {cell(row.alternate_mobile_no)}
                              </TableCell>
                              <TableCell>{cell(row.dl_submitted)}</TableCell>
                              <TableCell>{cell(row.pcc_status)}</TableCell>
                              <TableCell>{cell(row.vehicle_umbrella)}</TableCell>
                              <TableCell>
                                {cell(row.vehicle_tissue_box)}
                              </TableCell>
                              <TableCell>{cell(row.referby)}</TableCell>
                              <TableCell>{cell(row.referby_mobile)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={15}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No matching records found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleAssignmentReport;
