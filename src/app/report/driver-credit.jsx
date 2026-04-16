import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import { Download, Loader, Search } from "lucide-react";
import { useState, useMemo } from "react";
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

const NA = () => <span className="text-muted-foreground text-xs">N/A</span>;

const fmt = (val) => (val !== null && val !== undefined ? val : null);

const DriverCreditReport = () => {
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
  const [penaltyTypes, setPenaltyTypes] = useState([]);
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
        `${BASE_URL}/api/driver-credit-report`,
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
        if (response.data.penaltyType) {
          setPenaltyTypes(response.data.penaltyType);
        }
        toast.success("Report fetched successfully");
      } else {
        setReportData([]);
        toast.error("No data found for the selected range");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch driver credit report",
      );
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedData = useMemo(() => {
    if (!reportData) return [];

    const driverMap = {};

    reportData.forEach((row) => {
      const key = `${row.full_name}_${row.mobile || ""}`;
      if (!driverMap[key]) {
        driverMap[key] = {
          full_name: row.full_name,
          mobile: row.mobile || "-",
          vehicle_number_plate: row.vehicle_number_plate || "-",
          vehicle_product_type: row.vehicle_product_type || "-",
          penalties: {},
          total: 0,
        };
      }

      const type = row.penalty_for;
      const amount = parseFloat(row.penalty_amount || 0);

      driverMap[key].penalties[type] =
        (driverMap[key].penalties[type] || 0) + amount;
      driverMap[key].total += amount;
    });

    return Object.values(driverMap);
  }, [reportData]);

  const filteredData = groupedData.filter((row) =>
    Object.values(row).some((val) =>
      typeof val === "string"
        ? val.toLowerCase().includes(searchTerm.toLowerCase())
        : false,
    ),
  );

  const exportToExcel = async () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Driver Credits");

      // Calculate total columns
      const penaltyCols = penaltyTypes.map((pt) => pt.penalty_type);
      const maxCols = 5 + penaltyCols.length + 1;

      // 1. Add Title
      worksheet.mergeCells(1, 1, 1, maxCols);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.value = "Driver Credit Report";
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      // 2. Add Date Range
      worksheet.mergeCells(2, 1, 2, maxCols);
      const subTitleCell = worksheet.getCell(2, 1);
      subTitleCell.value = `From: ${fromDate}  To: ${toDate}`;
      subTitleCell.alignment = { horizontal: "center", vertical: "middle" };

      // 3. Header Row (Row 4)
      const headerRow = worksheet.getRow(4);
      const headers = [
        "S.No",
        "Driver Name",
        "Mobile",
        "Vehicle Plate",
        "Product Type",
        ...penaltyCols,
        "Total",
      ];
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
      filteredData.forEach((row, index) => {
        const rowData = [
          index + 1,
          row.full_name,
          row.mobile,
          row.vehicle_number_plate,
          row.vehicle_product_type,
          ...penaltyCols.map((pt) => row.penalties[pt] || 0),
          row.total,
        ];
        const newRow = worksheet.addRow(rowData);
        newRow.eachCell((cell, colNumber) => {
          // Alignment for specific columns
          if (colNumber > 5) {
            cell.alignment = { horizontal: "right" };
            cell.numFmt = "#,##0.00";
          }
        });
      });

      // Set column widths
      worksheet.columns.forEach((col, i) => {
        if (i === 0) col.width = 8;
        else if (i === 1) col.width = 25;
        else if (i === 2) col.width = 15;
        else if (i === 3) col.width = 15;
        else if (i === 4) col.width = 20;
        else col.width = 15;
      });

      // Generate Buffer and Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `driver-credit-report_${fromDate}_to_${toDate}.xlsx`);
      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    }
  };

  const cell = (val) => (fmt(val) !== null ? val : <NA />);

  return (
    <div className="w-full flex justify-center py-6 pb-20 overflow-x-hidden">
      <div className="min-w-full w-fit max-w-[1150px]">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              Driver Credit Summary Report
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="min-w-[180px]">
                <label className="text-sm font-medium mb-1 block">
                  From Date
                </label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="min-w-[180px]">
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
              <div className="flex justify-center items-center py-20">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reportData === null ? (
              <p></p>
            ) : filteredData.length === 0 ? (
              <p className="text-center text-muted-foreground py-20 italic">
                No matching records found
              </p>
            ) : (
              <div className="w-full border rounded-lg">
                <div className="overflow-x-auto">
                  <div
                    style={{
                      minWidth: `${Math.max(1200, 800 + penaltyTypes.length * 150)}px`,
                    }}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-16 text-center">
                            S.No
                          </TableHead>
                          <TableHead>Driver Name</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Running Platform</TableHead>
                          {penaltyTypes.map((pt) => (
                            <TableHead
                              key={pt.penalty_type}
                              className="text-right whitespace-nowrap px-4"
                            >
                              {pt.penalty_type}
                            </TableHead>
                          ))}
                          <TableHead className="text-right px-6 font-bold bg-blue-50/50">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-center text-muted-foreground font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-semibold uppercase whitespace-nowrap">
                              {cell(row.full_name)}
                            </TableCell>
                            <TableCell>{cell(row.mobile)}</TableCell>
                            <TableCell className="">
                              {cell(row.vehicle_number_plate)}
                            </TableCell>
                            <TableCell>
                              {cell(row.vehicle_product_type)}
                            </TableCell>
                            {penaltyTypes.map((pt) => (
                              <TableCell
                                key={pt.penalty_type}
                                className="text-right tabular-nums"
                              >
                                {(row.penalties[pt.penalty_type] || 0) > 0 ? (
                                  <span className="font-medium">
                                    {row.penalties[
                                      pt.penalty_type
                                    ].toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground/30 text-xs">
                                    0.00
                                  </span>
                                )}
                              </TableCell>
                            ))}
                            <TableCell className="text-right px-6 font-bold text-blue-700 bg-blue-50/20 tabular-nums">
                              {row.total.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
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

export default DriverCreditReport;
