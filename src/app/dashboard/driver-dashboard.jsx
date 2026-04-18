import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import { Download, Loader, Search, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const NA = () => <span className="text-muted-foreground text-xs">-</span>;
const fmt = (val) => (val !== null && val !== undefined ? val : null);

const DriverDashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = Cookies.get("token");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/getDriverDashboard`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response?.data?.data) {
        setReportData(response.data.data);
      } else {
        setReportData([]);
        toast.error("No data found");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch driver dashboard",
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
      const worksheet = workbook.addWorksheet("Driver Dashboard");

      const dataKeys = Object.keys(filteredData[0]);
      const maxCols = dataKeys.length;

      // 1. Add Title
      worksheet.mergeCells(1, 1, 1, maxCols);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.value = "Driver Dashboard Report";
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      // 2. Add Generation Date
      worksheet.mergeCells(2, 1, 2, maxCols);
      const subTitleCell = worksheet.getCell(2, 1);
      subTitleCell.value = `Generated on: ${new Date().toLocaleDateString()}`;
      subTitleCell.alignment = { horizontal: "center", vertical: "middle" };

      // 3. Header Row
      const headerRow = worksheet.getRow(4);
      headerRow.values = dataKeys.map((key) => formatHeader(key));
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
        const rowData = dataKeys.map((key) => {
          const val = row[key];
          // Treat specifically as text
          if (key === "driver_full_name" || key === "vehicle_number_plate") {
            return val !== null && val !== undefined ? String(val) : "N/A";
          }
          // If it's in our financial/numeric lists or looks like a number, cast it
          if (val === null || val === undefined || val === "") return 0;
          const num = Number(val);
          return isNaN(num) ? String(val) : num;
        });
        const newRow = worksheet.addRow(rowData);
        newRow.eachCell((cell) => {
          cell.alignment = { vertical: "middle" };
        });
      });

      // 5. Adjust Column Widths
      worksheet.columns.forEach((col) => {
        col.width = 20;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `driver_dashboard_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success("Excel exported successfully");
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
    // Specific mappings for misspelled or special keys
    const mappings = {
      totalearings: "Total Earnings",
      totalrevenue: "Total Revenue",
      additionalIncentive: "Additional Incentive",
      totalCashCollected: "Total Cash Collected",
      totalCashDepositAmount: "Cash Deposit",
      totalQRDepositAmount: "QR Deposit",
      totalCreditAmount: "Credit Amount",
      totalDebiitAmount: "Debit Amount",
      totalCustomerTipsAmount: "Customer Tips",
      driver_payment: "Driver Payment",
      total_completed_trips: "Completed Trips",
      total_trips: "Total Trips",
      finalPayout: "Final Payout",
      driver_full_name: "Driver Name",
    };

    if (mappings[header]) return mappings[header];

    return header
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .split(/_|\s/) // Split by underscore or space
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  };

  const isFinancial = (key) => {
    const financialKeys = [
      "totalearings",
      "totalrevenue",
      "additionalIncentive",
      "totalCashCollected",
      "totalCashDepositAmount",
      "totalQRDepositAmount",
      "totalCreditAmount",
      "totalDebiitAmount",
      "totalCustomerTipsAmount",
      "driver_payment",
      "finalPayout",
    ];
    return financialKeys.includes(key);
  };

  const cellValue = (key, val) => {
    const value = fmt(val);
    if (value === null) return <NA />;

    if (isFinancial(key)) {
      return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return value;
  };

  return (
    <div className="w-full min-w-0 py-6 pb-20">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl font-bold text-gray-800">
              Driver Dashboard
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            {reportData && reportData.length > 0 && (
              <>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search drivers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 border-gray-200 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="h-10 border-green-600 text-green-700 hover:bg-green-50 hover:text-black"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <Loader className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-gray-500 animate-pulse font-medium">
                Fetching dashboard data...
              </p>
            </div>
          ) : reportData === null ? (
            <div className="py-20 text-center">
              <p className="text-gray-500 italic">Initializing dashboard...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                <Search className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-lg">
                No driver data found
              </p>
              <p className="text-gray-400 text-sm">
                Try a different search term or refresh the page
              </p>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto overflow-y-auto max-h-[650px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow>
                      {getHeaders(reportData).map((header) => (
                        <TableHead
                          key={header}
                          className={cn(
                            "whitespace-nowrap font-bold text-gray-700 px-2 py-2",
                            isFinancial(header) && "text-right",
                          )}
                        >
                          {formatHeader(header)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((row, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        {getHeaders(reportData).map((header) => (
                          <TableCell
                            key={header}
                            className={cn(
                              "whitespace-nowrap font-medium text-gray-600 px-2 py-2",
                              isFinancial(header) && "text-right",
                            )}
                          >
                            {cellValue(header, row[header])}
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
      <div className="mt-4 flex items-center justify-end">
        <p className="text-xs text-gray-400 font-medium italic">
          Total Records: {filteredData.length}
        </p>
      </div>
    </div>
  );
};

export default DriverDashboard;
