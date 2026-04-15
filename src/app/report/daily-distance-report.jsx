import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import { Download, Loader } from "lucide-react";
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

const COLUMNS = [
  { key: "sno", label: "S.No" },
  { key: "vehicle_number_plate", label: "Vehicle Number" },
  { key: "vehicle_oem", label: "OEM" },
  { key: "vehicle_model", label: "Model" },
  { key: "vehicle_variant", label: "Variant" },
  { key: "driver_name", label: "Driver Name" },
  { key: "vehicle_distance", label: "Vehicle Distance (km)" },
  { key: "trip_distance", label: "Trip Distance (km)" },
];

const DailyDistanceReport = () => {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = Cookies.get("token");

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both From Date and To Date");
      return;
    }

    const formData = new FormData();
    formData.append("from_date", fromDate);
    formData.append("to_date", toDate);

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/daily-distance-report`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.data) {
        setReportData(response.data.data);
        toast.success("Report fetched successfully");
      } else {
        setReportData([]);
        toast.error("No data found for the selected date range");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch daily distance report"
      );
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportRows = reportData.map((row, index) => ({
      "S.No": index + 1,
      "Vehicle Number": row.vehicle_number_plate,
      OEM: row.vehicle_oem,
      Model: row.vehicle_model,
      Variant: row.vehicle_variant,
      "Driver Name": row.driver_name ?? "N/A",
      "Vehicle Distance (km)": parseFloat(row.vehicle_distance),
      "Trip Distance (km)": row.trip_distance,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Distance Report");
    XLSX.writeFile(
      workbook,
      `daily-distance-report_${fromDate}_to_${toDate}.xlsx`
    );
    toast.success("Report exported successfully");
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">
            Daily Distance Report
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[160px]">
              <label className="text-sm font-medium mb-1 block">
                From Date
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="text-sm font-medium mb-1 block">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
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
          </div>

          {/* Table Area */}
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reportData === null ? (
            <p className="text-center text-muted-foreground py-16">
              Select a date range and click &quot;Generate Report&quot; to view
              data.
            </p>
          ) : reportData.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              No data available for the selected date range.
            </p>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {COLUMNS.map((col) => (
                      <TableHead
                        key={col.key}
                        className="whitespace-nowrap font-semibold"
                      >
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {row.vehicle_number_plate}
                      </TableCell>
                      <TableCell>{row.vehicle_oem}</TableCell>
                      <TableCell>{row.vehicle_model}</TableCell>
                      <TableCell>{row.vehicle_variant}</TableCell>
                      <TableCell>
                        {row.driver_name ?? (
                          <span className="text-muted-foreground text-xs">
                            N/A
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {parseFloat(row.vehicle_distance).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {parseFloat(row.trip_distance).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}


                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyDistanceReport;
