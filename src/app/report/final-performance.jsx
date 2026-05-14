import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import {
  AlertTriangle,
  CreditCard,
  Download,
  Loader,
  Search,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@radix-ui/react-dropdown-menu";
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
import FleetReportView from "./components/FinalDriverPerformanceReport/FleetReportView";

const FinalDriverPerformanceReport = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);
  const [mbgLoading, setMbgLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [dates, setDates] = useState({
    fromDate: moment().subtract(6, "days").format("YYYY-MM-DD"),
    toDate: moment().format("YYYY-MM-DD"),
  });

  const token = Cookies.get("token");

  const handleDateSelect = (range, selectedDay) => {
    if (!selectedDay) return;

    const fromDate = moment(selectedDay).format("YYYY-MM-DD");
    const toDate = moment(selectedDay).add(6, "days").format("YYYY-MM-DD");
    setDates({ fromDate, toDate });
  };

  const fetchMBGdata = async (driver) => {
    try {
      setMbgLoading(true); // ✅ only modal loading

      const response = await axios.post(
        `${BASE_URL}/api/driver-performance-popup-report`,
        {
          from_date: dates.fromDate,
          to_date: dates.toDate,
          driver_name: driver,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response?.data?.data) {
        setPopupData(response.data);
      } else {
        setPopupData([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch MBG Data");
      setPopupData([]);
    } finally {
      setMbgLoading(false);
    }
  };

  const deleteSyncDriverPerformanceReport = async () => {
    if (!dates.fromDate || !dates.toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    try {
      setIsSyncing(true);
      const response = await axios.post(
        `${BASE_URL}/api/delete-driver-performance-data-sync`,
        {
          from_date: dates.fromDate,
          to_date: dates.toDate,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response?.data?.code === 201) {
        toast.success(
          response?.data?.message ||
            "Driver Performance Data Deleted successfully",
        );
        fetchDriverPerformanceReport();
      } else {
        toast.error(
          response?.data?.message || "Failed to delete Driver Performance Data",
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete Driver Performance Data",
      );
    } finally {
      setIsSyncing(false);
    }
  };
  const fetchDriverPerformanceReport = async () => {
    if (!dates.fromDate || !dates.toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/driver-performance-report-after-sync`,
        {
          from_date: dates.fromDate,
          to_date: dates.toDate,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response?.data?.data) {
        setReportData(response.data.data);
        toast.success("Driver Performance Report fetched successfully");
      } else {
        setReportData([]);
        toast.error("No data found for the selected date range");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch Driver Performance Report",
      );
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!reportData) return [];
    if (!searchQuery) return reportData;

    return reportData.filter((row) =>
      row.driver_full_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [reportData, searchQuery]);

  const exportToExcel = async () => {
    if (!filteredData.length) {
      toast.error("No data to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Final Performance");

      const headers = [
        "Driver Name",
        "Opening",
        "MBG",
        "Acc%",
        "Total Earnings",
        "Revenue Incentive",
        "Additional Incentive",
        "Total Collection",
        "Total Cash Deposit",
        "Total QR Deposit",
        "Cash Balance",
        "Total Payout",
        "Payout After Adjustment",
        "Credit",
        "Debit",
        "Customer Trips",
        "Final Payout",
        "Paid",
        "Closing",
      ];

      worksheet.mergeCells(1, 1, 1, headers.length);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.value = "Final Driver Performance Report";
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.mergeCells(2, 1, 2, headers.length);
      const rangeCell = worksheet.getCell(2, 1);
      rangeCell.value = `From: ${dates.fromDate}  To: ${dates.toDate}`;
      rangeCell.alignment = { horizontal: "center", vertical: "middle" };

      const headerRow = worksheet.getRow(4);
      headerRow.values = headers;
      headerRow.font = { bold: true };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEAF2FF" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      filteredData.forEach((row) => {
        const closing =
          Number(row.opening_balance || 0) +
          Number(row.finalPayout || 0) -
          Number(row.driver_payment || 0);

        worksheet.addRow([
          row.driver_full_name,
          Number(row.opening_balance || 0),
          Number(row.mbg || 0),
          `${row.acceptence || 0}%`,
          Number(row.totalearings || 0),
          Number(row.totalrevenue || 0),
          Number(row.additionalIncentive || 0),
          Number(row.totalCashCollected || 0),
          Number(row.totalCashDepositAmount || 0),
          Number(row.totalQRDepositAmount || 0),
          Number(row.cashBalance || 0),
          Number(row.totalPayout || 0),
          Number(row.payoutAdj || 0),
          Number(row.totalCreditAmount || 0),
          Number(row.totalDebiitAmount || 0),
          Number(row.totalCustomerTipsAmount || 0),
          Number(row.finalPayout || 0),
          Number(row.driver_payment || 0),
          closing,
        ]);
      });

      worksheet.columns.forEach((column, index) => {
        column.width = index === 0 ? 28 : 16;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `final-performance-report_${dates.fromDate}_to_${dates.toDate}.xlsx`,
      );
      toast.success("Excel downloaded successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to download Excel");
    }
  };

  const handleAddDriverPayment = () => {
    if (!reportData?.length) {
      toast.error("Please generate report first");
      return;
    }

    const negativePayoutDrivers = reportData.filter(
      (row) => Number(row.finalPayout || 0) < 0,
    );

    if (!negativePayoutDrivers.length) {
      toast.error("No negative final payout drivers found");
      return;
    }

    navigate("/paid-driver/create-payment", {
      state: {
        paymentData: {
          driver_payment_date: dates.toDate,
          subs: negativePayoutDrivers.map((row) => ({
            driver_payment_full_name: row.driver_full_name,
            driver_payment: String(row.finalPayout),
            isPrefilled: true,
          })),
        },
      },
    });
  };

  return (
    <div className="w-full mx-auto py-6">
      <Card className="w-full">
        <CardHeader className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mx-0 px-0">
            <CardTitle>Driver Performance Report</CardTitle>
            {reportData?.length > 0 && (
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search driver name..."
                  className="pl-9 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium">Select Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !dates.fromDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dates.fromDate ? (
                      moment(dates.fromDate).format("DD-MM-YYYY")
                    ) : (
                      <span>Pick a start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: new Date(dates.fromDate),
                      to: new Date(dates.toDate),
                    }}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={(date) =>
                      date >
                      moment().subtract(6, "days").startOf("day").toDate()
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Selected Range:</Label>
              <div className="flex items-center px-3 bg-blue-50 border border-blue-100 rounded-md h-11">
                {dates.fromDate ? (
                  <p className="text-xs text-blue-700 font-medium truncate">
                    <span className="font-bold">
                      {moment(dates.fromDate).format("DD-MM-YY")}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold">
                      {moment(dates.toDate).format("DD-MM-YY")}
                    </span>
                  </p>
                ) : (
                  <span className="text-xs text-gray-400">
                    No range selected
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <Button
                onClick={fetchDriverPerformanceReport}
                disabled={isLoading}
                className="h-11 w-full"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </div>
            {reportData?.length > 0 && (
              <div>
                <Button
                  onClick={() => setIsSyncConfirmOpen(true)}
                  disabled={isSyncing}
                  className="h-11 w-full bg-red-700 hover:bg-red-800"
                >
                  {isSyncing ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    "Delete Synced Data"
                  )}
                </Button>

                <AlertDialog
                  open={isSyncConfirmOpen}
                  onOpenChange={setIsSyncConfirmOpen}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-600 flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        Delete Synced Data
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the synced driver
                        performance data for the period from{" "}
                        <span className="font-bold text-black">
                          {moment(dates.fromDate).format("DD-MM-YYYY")}
                        </span>{" "}
                        to{" "}
                        <span className="font-bold text-black">
                          {moment(dates.toDate).format("DD-MM-YYYY")}
                        </span>
                        ? This action will update the report with the latest
                        performance data from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          deleteSyncDriverPerformanceReport();
                          setIsSyncConfirmOpen(false);
                        }}
                        className="bg-red-700 hover:bg-red-800"
                      >
                        Confirm Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            {reportData?.length > 0 && (
              <>
                <div>
                  <Button
                    onClick={exportToExcel}
                    variant="outline"
                    className="h-11 w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Excel Download
                  </Button>
                </div>
                <div>
                  <Button
                    onClick={handleAddDriverPayment}
                    className="h-11 w-full bg-green-700 hover:bg-green-800"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Add Driver Payment
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="mt-2">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reportData && reportData.length > 0 ? (
              <FleetReportView
                reportData={filteredData}
                fetchMBGdata={fetchMBGdata}
                popupData={popupData}
                mbgLoading={mbgLoading}
              />
            ) : (
              reportData && (
                <p className="text-center text-muted-foreground py-8">
                  No data available for the selected date range
                </p>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalDriverPerformanceReport;
