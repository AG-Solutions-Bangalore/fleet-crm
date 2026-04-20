import { Button } from "@/components/ui/button";
import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import { AlertTriangle, Download, Loader, Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import moment from "moment";
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

const MBGDetailModal = ({
  driver,
  onClose,
  fetchMBGdata,
  popupData,
  mbgLoading,
}) => {
  useEffect(() => {
    if (driver?.driver_full_name) {
      fetchMBGdata(driver?.driver_full_name);
    }
  }, [driver]);

  const popupFullData = popupData?.data;
  const mbgConditions = popupData?.condition_mbg;

  const popupRows = popupFullData || [];

  // console.log(driver);

  const getConditionStatus = (row, conditions) => {
    const category = row?.performance_type || "Uber Black";
    const filteredConditions =
      conditions?.filter((c) => c.condition_for === category) || [];

    if (!filteredConditions.length) return { allMet: false, failed: [] };

    const earnings = Number(row.total_earings || 0);
    const hours = Number(row.hours_online || 0);

    const failed = [];

    filteredConditions.forEach((cond) => {
      if (cond.condition_type !== ">=") return;

      const value = Number(cond.condition_amount);

      if (cond.condition_of === "total_earings" && earnings < value) {
        failed.push(`Earnings < ${value}`);
      }

      if (cond.condition_of === "hours_online" && hours < value) {
        failed.push(`Hours < ${value}`);
      }
    });

    return {
      allMet: failed.length === 0,
      failed,
    };
  };

  const calculateDailyMBG = (row, conditions) => {
    const category = row?.performance_type || "Uber Black";

    if (category === "Uber Green") return 0;

    const filteredConditions =
      conditions?.filter((c) => c.condition_for === category) || [];

    if (!filteredConditions.length) return 0;

    const earnings = Number(row.total_earings || 0);
    const hours = Number(row.hours_online || 0);

    const earningCond = filteredConditions.find(
      (c) => c.condition_of === "total_earings" && c.condition_type === ">=",
    );

    const hoursCond = filteredConditions.find(
      (c) => c.condition_of === "hours_online" && c.condition_type === ">=",
    );

    const perHourCond = filteredConditions.find(
      (c) => c.condition_type === "*",
    );

    const isEarningMet =
      earningCond && earnings >= Number(earningCond.condition_amount);

    const isHoursMet = hoursCond && hours >= Number(hoursCond.condition_amount);

    if (isEarningMet && isHoursMet) {
      return Number(earningCond.condition_amount_to_show);
    }

    if (perHourCond) {
      const rate = Number(perHourCond.condition_amount_to_show);
      const maxHours = Number(perHourCond.condition_amount);

      const applicableHours = Math.min(hours, maxHours);
      return applicableHours * rate;
    }

    return 0;
  };

  const totalMBG = useMemo(() => {
    return popupRows.reduce((acc, r) => {
      return acc + Number(calculateDailyMBG(r, mbgConditions) || 0);
    }, 0);
  }, [popupRows, mbgConditions]);

  const totalHrs = popupRows
    ?.reduce((acc, r) => acc + Number(r.hours_online || 0), 0)
    ?.toFixed(2);

  const totalconf = (
    (popupRows?.reduce((acc, r) => acc + Number(r.confirmation_rate || 0), 0) *
      100) /
    popupRows?.length
  ).toFixed(0);

  const totalTrips = popupRows?.reduce(
    (acc, r) => acc + Number(r.trips_taken || 0),
    0,
  );

  const totalEarnings = popupRows?.reduce(
    (acc, r) => acc + Number(r.total_earings || 0),
    0,
  );

  const totalCashCollection = popupRows?.reduce(
    (acc, r) => acc + Number(r.cash_collected || 0),
    0,
  );

  const totalCashDeposited = popupRows?.reduce(
    (acc, r) => acc + Number(r.deposit_amount || 0),
    0,
  );

  const totalQrDeposited = popupRows?.reduce(
    (acc, r) => acc + Number(r.amount || 0),
    0,
  );

  const uber = popupRows[0]?.performance_type;

  return (
    <Dialog
      open={!!driver?.driver_full_name}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-[80%] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between px-2">
            <p>Daily MBG Breakdown — {driver?.driver_full_name || ""}</p>
            <p className="text-gray-400 px-10">{uber}</p>
          </DialogTitle>
        </DialogHeader>

        {/* ✅ LOADING INSIDE MODAL */}
        {mbgLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-full">
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
                  {popupFullData && popupFullData.length > 0 ? (
                    popupFullData.map((r, i) => {
                      const hours = Number(r.hours_online || 0);

                      const { allMet, failed } = getConditionStatus(
                        r,
                        mbgConditions,
                      );

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
                            {(r.confirmation_rate * 100 || 0).toFixed(0)}%
                          </td>

                          <td className="border p-2 text-right">
                            {r.trips_taken || 0}
                          </td>

                          <td className="border p-2 text-right">
                            {Number(r.total_earings || 0).toFixed(0)}
                          </td>

                          <td className="border p-2 text-right">
                            {Number(r.cash_collected || 0).toFixed(0)}
                          </td>

                          <td className="border p-2 text-right text-green-700 font-semibold">
                            {calculateDailyMBG(r, mbgConditions).toFixed(0)}
                          </td>

                          <td className="border p-2 text-right">
                            {Number(r.deposit_amount || 0).toFixed(0)}
                          </td>

                          <td className="border p-2 text-right">
                            {Number(r.amount || 0).toFixed(0)}
                          </td>
                          <td className="border p-2">
                            {allMet ? (
                              <span className="text-green-600 font-semibold">
                                ✓ All Conditions Met
                              </span>
                            ) : (
                              <span className="text-red-500 text-xs">
                                {failed.length > 0 ? (
                                  failed.map((f, idx) => (
                                    <span key={idx} className="block">
                                      {f}
                                    </span>
                                  ))
                                ) : (r.performance_type || "Uber Black") ===
                                  "Uber Green" ? (
                                  <span className="text-gray-400 italic">
                                    Conditions not set
                                  </span>
                                ) : (
                                  "N/A"
                                )}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-4 text-gray-400"
                      >
                        No MBG data available
                      </td>
                    </tr>
                  )}
                </tbody>
                {popupFullData && popupFullData.length > 0 && (
                  <tfoot>
                    <tr className="bg-red-50 text-black">
                      <th className="border p-2 text-left">Total</th>
                      <th className="border p-2 text-right">{totalHrs}</th>
                      <th className="border p-2 text-right">{totalconf}%</th>
                      <th className="border p-2 text-right">{totalTrips}</th>
                      <th className="border p-2 text-right">
                        {totalEarnings.toFixed(0)}
                      </th>
                      <th className="border p-2 text-right">
                        {totalCashCollection.toFixed(0)}
                      </th>
                      <th className="border p-2 text-right font-bold">
                        {totalMBG.toFixed(0)}
                      </th>
                      <th className="border p-2 text-right">
                        {totalCashDeposited.toFixed(0)}
                      </th>
                      <th className="border p-2 text-right">
                        {totalQrDeposited.toFixed(0)}
                      </th>
                      <th className="border p-2"></th>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                [" MBG", `${driver?.mbg}`],
                [" Total Earning", `${driver?.totalearings}`],
                [" Revenue Incentive", `${driver?.totalrevenue}`],
                [" Additional Incentive", `${driver?.additionalIncentive}`],
                [" Cash Collection", `${driver?.totalCashCollected}`],
                [" Cash Deposited", `${driver?.totalCashDepositAmount}`],
                [" Cash Balance ", `${driver?.cashBalance}`],
                [" QR Deposited", `${driver?.totalQRDepositAmount}`],
                [" Total Payout ", `${driver?.totalPayout}`],
                [" Payout After Adj ", `${driver?.payoutAdj}`],
                [" Credit", `${driver?.totalCreditAmount}`],
                [" Debit ", `${driver?.totalDebiitAmount}`],
                [" Customer Trips ", `${driver?.totalCustomerTipsAmount}`],
                [" Final Payout ", `${driver?.finalPayout}`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between bg-gray-50 rounded p-2"
                >
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const FleetReportView = ({
  reportData,
  fetchMBGdata,
  popupData,
  mbgLoading,
}) => {
  const [selectedDriver, setSelectedDriver] = useState(null);

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
        popupData={popupData}
        mbgLoading={mbgLoading} // ✅ new prop
        onClose={() => setSelectedDriver(null)}
      />

      <div className="max-h-[500px] overflow-y-auto rounded-lg w-full">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-blue-900">
            <tr>
              <th
                className={`${colHeaderClass} sticky left-0 z-auto bg-blue-900`}
              >
                Driver Name
              </th>
              <th className={colHeaderClass} title="Opening Balance">
                Opening
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
              <th className={colHeaderClass} title="Paid Amount">
                Paid
              </th>
              <th className={`${colHeaderClass} bg-yellow-500 text-black`}>
                Closing
              </th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, i) => {
              const isEven = i % 2 === 0;
              const rowBg = isEven ? "bg-white" : "bg-gray-50";

              const calculatedClosingBalance =
                Number(row.opening_balance) +
                Number(row.finalPayout) -
                Number(row.driver_payment);

              return (
                <tr
                  key={row.driver_full_name}
                  className={`${rowBg} hover:bg-blue-50`}
                >
                  <td className={`${nameCellClass} ${rowBg}`}>
                    {row.driver_full_name}
                  </td>
                  <td className={cellClass}>{row.opening_balance}</td>
                  <td
                    className={`${cellClass} text-green-700 font-bold cursor-pointer hover:underline`}
                    onClick={() => setSelectedDriver(row)}
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
                  <td className={cellClass}>{row.driver_payment}</td>
                  <td
                    className={`${cellClass} font-bold text-sm ${
                      calculatedClosingBalance >= 0
                        ? "text-green-700 bg-green-50"
                        : "text-red-700 bg-red-50"
                    }`}
                  >
                    {calculatedClosingBalance}
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

const FinalDriverPerformanceReport = () => {
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
