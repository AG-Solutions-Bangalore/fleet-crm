import { Button } from "@/components/ui/button";
import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import { Download, Loader } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import moment from "moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-dropdown-menu";

const fetchMBGdata = async () => {
  const response = await axios.post(
    `${BASE_URL}/api/driver-performance-popup-report`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

const MBGDetailModal = ({
  driver,
  onClose,
  fetchMBGdata,
  mbgData,
  mbgLoading,
}) => {
  useEffect(() => {
    if (driver) {
      fetchMBGdata(driver);
    }
  }, [driver]);

  return (
    <Dialog open={!!driver} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Daily MBG Breakdown — {driver || ""}</DialogTitle>
        </DialogHeader>

        {/* ✅ LOADING INSIDE MODAL */}
        {mbgLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-yellow-400 text-black">
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-right">Hours Online</th>
                  <th className="border p-2 text-right">Confirmation %</th>
                  <th className="border p-2 text-right">Trips Taken</th>
                  <th className="border p-2 text-right">Daily Earning</th>
                  <th className="border p-2 text-right">Cash Collection</th>
                  <th className="border p-2 text-right">Daily MBG</th>
                  <th className="border p-2 text-right">Cash D</th>
                  <th className="border p-2 text-right">QR D</th>
                  <th className="border p-2 text-left">Conditions Met</th>
                </tr>
              </thead>

              <tbody>
                {mbgData && mbgData.length > 0 ? (
                  mbgData.map((r, i) => {
                    const hours = Number(r.hours_online || 0);
                    const allMet = r.all_conditions_met;
                    const failedRules = r.failed_rules || [];

                    return (
                      <tr key={i}>
                        <td className="border p-2">
                          {r.performance_date
                            ? moment(r.performance_date).format("DD-MM-YYYY")
                            : "—"}
                        </td>
                        <td className="border p-2 text-right">
                          {hours.toFixed(2)}
                        </td>
                        <td className="border p-2 text-right">
                          {r.confirmation_percentage ?? 0}%
                        </td>
                        <td className="border p-2 text-right">
                          {r.daily_earning ?? 0}
                        </td>
                        <td className="border p-2 text-right">
                          {r.cash_collected ?? 0}
                        </td>
                        <td className="border p-2 text-right text-green-700 font-semibold">
                          {r.mbg ?? 0}
                        </td>
                        <td className="border p-2 text-right">
                          {r.cash_deposit ?? 0}
                        </td>
                        <td className="border p-2 text-right">
                          {r.qr_deposit ?? 0}
                        </td>
                        <td className="border p-2">
                          {allMet ? (
                            <span className="text-green-600">
                              ✓ All Conditions Met
                            </span>
                          ) : failedRules.length > 0 ? (
                            <span className="text-red-500 text-xs">
                              {failedRules.map((fr, idx) => (
                                <span key={idx} className="block">
                                  {fr.condition_of.replace("_", " ")} &lt;{" "}
                                  {fr.condition_amount}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              Rate Applied
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-gray-400">
                      No MBG data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const FleetReportView = ({ reportData, fetchMBGdata, mbgData, mbgLoading }) => {
  const [selectedDriver, setSelectedDriver] = useState("");

  if (!reportData || reportData.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No data available for the selected date range
      </p>
    );
  }

  const colHeaderClass =
    "border border-gray-300 p-2 text-center text-xs font-bold whitespace-nowrap bg-blue-900 text-white";
  const cellClass =
    "border border-gray-300 p-2 text-right text-xs whitespace-nowrap";
  const nameCellClass =
    "border border-gray-300 p-2 text-left text-xs font-semibold whitespace-nowrap sticky left-0 bg-white";

  return (
    <>
      <MBGDetailModal
        driver={selectedDriver}
        fetchMBGdata={fetchMBGdata}
        mbgData={mbgData}
        mbgLoading={mbgLoading} // ✅ new prop
        onClose={() => setSelectedDriver(null)}
      />

      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th
                className={`${colHeaderClass} sticky left-0 z-auto bg-blue-900`}
              >
                Driver Name
              </th>
              <th
                className={`${colHeaderClass} bg-green-700`}
                title="Sum of MBG — click driver row to expand"
              >
                MBG
              </th>
              <th
                className={colHeaderClass}
                title="Weekly Acceptance Percentage"
              >
                Acc%
              </th>
              <th className={colHeaderClass} title="Total Earnings">
                Tot Earn
              </th>
              <th className={colHeaderClass} title="Revenue Incentive">
                Rev Inc
              </th>
              <th className={colHeaderClass} title="Additional Incentive">
                Add Inc
              </th>
              <th className={colHeaderClass} title="Total Collection">
                Tot Coll
              </th>
              <th className={colHeaderClass} title="Total Deposit">
                Tot CD
              </th>
              <th className={colHeaderClass} title="Total Deposit">
                Tot QD
              </th>
              <th
                className={`${colHeaderClass} bg-red-700`}
                title="Cash Balance"
              >
                Cash Bal
              </th>
              <th
                className={`${colHeaderClass} bg-orange-500`}
                title="Total Payout"
              >
                Tot Payout
              </th>
              <th className={colHeaderClass} title="Payout After Adjustments">
                Payout Adj
              </th>
              <th className={colHeaderClass}>Credit</th>
              <th className={colHeaderClass}>Debit</th>
              <th className={colHeaderClass} title="Customer Trips Completed">
                Cust Trips
              </th>
              <th className={`${colHeaderClass} bg-yellow-500 text-black`}>
                Final Payout
              </th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, i) => {
              const isEven = i % 2 === 0;
              const rowBg = isEven ? "bg-white" : "bg-gray-50";

              return (
                <tr
                  key={row.driver_full_name}
                  className={`${rowBg} hover:bg-blue-50`}
                >
                  <td className={`${nameCellClass} ${rowBg}`}>
                    {row.driver_full_name}
                  </td>
                  <td
                    className={`${cellClass} text-green-700 font-bold cursor-pointer hover:underline`}
                    onClick={() => setSelectedDriver(row.driver_full_name)}
                    title="Click to see daily breakdown"
                  >
                    {row.mbg}
                  </td>
                  <td className={cellClass}>{row.acceptence}%</td>
                  <td className={cellClass}>{row.totalearings}</td>
                  <td className={cellClass}>{row.totalrevenue}</td>
                  <td className={cellClass}>{row.additionalIncentive}</td>
                  <td className={cellClass}>{row.totalCashCollected}</td>
                  <td className={cellClass}>{row.totalCashDepositAmount}</td>
                  <td className={cellClass}>{row.totalQRDepositAmount}</td>
                  <td
                    className={`${cellClass} bg-red-100 text-red-700 font-semibold`}
                  >
                    {row.cashBalance}
                  </td>
                  <td
                    className={`${cellClass} bg-orange-100 text-orange-700 font-semibold`}
                  >
                    {row.totalPayout}
                  </td>
                  <td className={cellClass}>{row.payoutAdj}</td>
                  <td className={cellClass}>{row.totalCreditAmount}</td>
                  <td className={cellClass}>{row.totalDebiitAmount}</td>
                  <td className={cellClass}>{row.totalCustomerTipsAmount}</td>
                  <td
                    className={`${cellClass} font-bold text-sm ${
                      row.finalPayout >= 0
                        ? "text-green-700 bg-green-50"
                        : "text-red-700 bg-red-50"
                    }`}
                  >
                    {row.finalPayout}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

const DriverPerformanceReport = () => {
  const [reportData, setReportData] = useState(null);
  const [mbgData, setMbgData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mbgLoading, setMbgLoading] = useState(false);
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
        setMbgData(response.data.data);
      } else {
        setMbgData([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch MBG Data");
      setMbgData([]);
    } finally {
      setMbgLoading(false);
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
        `${BASE_URL}/api/driver-performance-report-new`,
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

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Driver Performance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full flex-row gap-4 mb-6 items-end">
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
          </div>
          <div className="mt-2">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reportData && reportData.length > 0 ? (
              <FleetReportView
                reportData={reportData}
                fetchMBGdata={fetchMBGdata}
                mbgData={mbgData}
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

export default DriverPerformanceReport;
