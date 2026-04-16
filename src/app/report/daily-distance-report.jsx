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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const COLUMNS = [
  { key: "sno", label: "S.No" },
  { key: "vehicle_number_plate", label: "Vehicle Number" },
  { key: "driver_name", label: "Driver Name" },
  { key: "vehicle_model", label: "Model" },
  { key: "vehicle_oem", label: "OEM" },
  { key: "vehicle_variant", label: "Variant" },
  { key: "vehicle_distance", label: "Vehicle Distance" },
  { key: "trip_distance", label: "Trip Distance" },
  { key: "distance_diff", label: "Distance Diff" },
];

const DailyDistanceReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    2,
  )
    .toISOString()
    .split("T")[0];

  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = Cookies.get("token");

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both dates");
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
        },
      );

      if (response?.data?.data) {
        setReportData(response.data.data);
        toast.success("Report fetched successfully");
      } else {
        setReportData([]);
        toast.error("No data found for the selected range");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch daily distance report",
      );
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = reportData
    ? reportData.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    : [];

  const exportToExcel = async () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Daily Distance Report");

      const exportRows = filteredData.map((row, index) => ({
        "S.No": index + 1,
        "Vehicle Number": row.vehicle_number_plate,
        Model: row.vehicle_model,
        OEM: row.vehicle_oem,
        Variant: row.vehicle_variant,
        "Vehicle Distance": row.vehicle_distance,
        "Trip Distance": row.trip_distance,
        "Distance Diff": parseFloat(row.vehicle_distance - row.trip_distance || 0).toFixed(2),
        "Driver Name": row.driver_name || "N/A",
      }));

      const headers = Object.keys(exportRows[0]);
      const maxCols = headers.length;

      // 1. Add Title
      worksheet.mergeCells(1, 1, 1, maxCols);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.value = "Daily Distance Report";
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      // 2. Add Date Range
      worksheet.mergeCells(2, 1, 2, maxCols);
      const subTitleCell = worksheet.getCell(2, 1);
      subTitleCell.value = `From: ${fromDate}  To: ${toDate}`;
      subTitleCell.alignment = { horizontal: "center", vertical: "middle" };

      // 3. Header Row (Row 4)
      const headerRow = worksheet.getRow(4);
      headerRow.values = headers;
      headerRow.font = { bold: true };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2F2F2" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // 4. Add Data Rows
      exportRows.forEach((row) => {
        const rowData = Object.values(row);
        const newRow = worksheet.addRow(rowData);
        newRow.eachCell((cell, colNumber) => {
          // Format Distance columns (6 and 7)
          if (colNumber === 6 || colNumber === 7) {
            cell.alignment = { horizontal: "right" };
            cell.numFmt = "#,##0.00";
          }
        });
      });

      // 5. Adjust Column Widths
      worksheet.columns.forEach((col, i) => {
        if (i === 0) col.width = 8;
        else col.width = 18;
      });

      // Generate and Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `daily-distance-report_${fromDate}_to_${toDate}.xlsx`);
      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    }
  };

  return (
    <div className="w-full min-w-0 py-6 pb-20 overflow-x-hidden">
      <div className="w-full min-w-0">
        <Card className="w-full min-w-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              Daily Distance Report
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
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
                <label className="text-sm font-medium mb-1 block">
                  To Date
                </label>
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

            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reportData === null ? (
              <p></p>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground italic">
                No data available for the selected range
              </div>
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
                    {filteredData.map((row, index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">
                          {row.vehicle_number_plate}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {row.driver_name || (
                            <span className="text-muted-foreground italic text-xs">
                              N/A
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{row.vehicle_model}</TableCell>
                        <TableCell>{row.vehicle_oem}</TableCell>
                        <TableCell>{row.vehicle_variant}</TableCell>
                        <TableCell className="text-right">
                          {parseFloat(row.vehicle_distance || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {parseFloat(row.trip_distance || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {parseFloat(row.vehicle_distance - row.trip_distance || 0).toFixed(2)}
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
    </div>
  );
};

export default DailyDistanceReport;
