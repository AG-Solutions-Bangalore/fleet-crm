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
import { useEffect } from "react";

const NA = () => <span className="text-muted-foreground text-xs">-</span>;

const fmt = (val) => (val !== null && val !== undefined ? val : null);

const VehicleDetailsReport = () => {
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = Cookies.get("token");

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/vehicle-details-report`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response?.data?.data) {
        setReportData(response.data.data);
        toast.success("Report fetched successfully");
      } else {
        setReportData([]);
        toast.error("No data found");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch vehicle details report",
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
      const worksheet = workbook.addWorksheet("Vehicle Details");

      // Get columns from data keys
      const dataKeys = Object.keys(filteredData[0]);
      const maxCols = dataKeys.length;

      // 1. Add Title
      worksheet.mergeCells(1, 1, 1, maxCols);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.value = "Vehicle Details Report";
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      // 2. Add Generation Date
      worksheet.mergeCells(2, 1, 2, maxCols);
      const subTitleCell = worksheet.getCell(2, 1);
      subTitleCell.value = `Generated on: ${new Date().toLocaleDateString()}`;
      subTitleCell.alignment = { horizontal: "center", vertical: "middle" };

      // 3. Header Row (Row 4)
      const headerRow = worksheet.getRow(4);
      headerRow.values = dataKeys.map((key) =>
        key
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      );
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
      filteredData.forEach((row) => {
        const rowData = dataKeys.map((key) => row[key]);
        const newRow = worksheet.addRow(rowData);
        newRow.eachCell((cell) => {
          cell.alignment = { vertical: "middle" };
        });
      });

      // 5. Adjust Column Widths
      worksheet.columns.forEach((col) => {
        col.width = 20;
      });

      // Generate and Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `vehicle-details-report_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    }
  };

  const getHeaders = (data) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  };

  const formatHeader = (header) => {
    return header
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const cell = (val) => (fmt(val) !== null ? val : <NA />);

  return (
    <div className="w-full min-w-0 py-6 pb-20 overflow-x-hidden">
      <div className="w-full min-w-0">
        <Card className="w-full min-w-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              Vehicle Details Report
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-between">
              <div>
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
              <div className="flex gap-2">
                {reportData && reportData.length > 0 && (
                  <Button onClick={exportToExcel} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reportData === null ? (
              <p className="text-center text-muted-foreground py-20 italic">
                Click generate to load report
              </p>
            ) : filteredData.length === 0 ? (
              <p className="text-center text-muted-foreground py-20 italic">
                No matching records found
              </p>
            ) : (
              <div className="w-full border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          {getHeaders(reportData).map((header) => (
                            <TableHead
                              key={header}
                              className="whitespace-pre-wrap"
                            >
                              {formatHeader(header)}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((row, index) => (
                          <TableRow key={index}>
                            {getHeaders(reportData).map((header) => (
                              <TableCell
                                key={header}
                                className="whitespace-pre-wrap"
                              >
                                {cell(row[header])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleDetailsReport;
