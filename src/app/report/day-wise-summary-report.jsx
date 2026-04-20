import { Button } from "@/components/ui/button";
import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import { Loader, CalendarIcon, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import moment from "moment";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ReportTable = ({ data, type }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No {type} data available
      </div>
    );
  }

  const totals = data.reduce(
    (acc, row) => {
      acc.earnings += Number(row.total_earings || 0);
      acc.cashCollected += Number(row.cash_collected || 0);
      acc.deposit += Number(row.deposit_amount || 0);
      acc.qr += Number(row.qr_amount || 0);
      return acc;
    },
    { earnings: 0, cashCollected: 0, deposit: 0, qr: 0 },
  );

  const calculateBalance = (row) => {
    return (
      Number(row.cash_collected || 0) -
      Number(row.deposit_amount || 0) -
      Number(row.qr_amount || 0)
    );
  };

  const totalBalance = totals.cashCollected - totals.deposit - totals.qr;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="border p-2 text-left uppercase whitespace-nowrap">
              Date
            </th>
            <th className="border p-2 text-right uppercase whitespace-nowrap">
              Total Earnings
            </th>
            <th className="border p-2 text-right uppercase whitespace-nowrap">
              Cash Collected
            </th>
            <th className="border p-2 text-right uppercase whitespace-nowrap">
              Cash Deposit
            </th>
            <th className="border p-2 text-right uppercase whitespace-nowrap">
              QR Deposit
            </th>
            <th className="border p-2 text-right uppercase whitespace-nowrap bg-red-800">
              Cash Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={
                i % 2 === 0
                  ? "bg-white text-black hover:bg-blue-50"
                  : "bg-gray-50 text-black hover:bg-blue-50"
              }
            >
              <td className="border p-2 whitespace-nowrap font-medium">
                {moment(row.performance_date).format("DD-MM-YYYY")}
              </td>
              <td className="border p-2 text-right whitespace-nowrap">
                {Number(row.total_earings).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="border p-2 text-right whitespace-nowrap">
                {Number(row.cash_collected).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="border p-2 text-right whitespace-nowrap">
                {Number(row.deposit_amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="border p-2 text-right whitespace-nowrap">
                {Number(row.qr_amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="border p-2 text-right whitespace-nowrap font-semibold text-red-600">
                {calculateBalance(row).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
            <td className="border p-2">TOTAL</td>
            <td className="border p-2 text-right">
              {totals.earnings.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
            <td className="border p-2 text-right">
              {totals.cashCollected.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
            <td className="border p-2 text-right">
              {totals.deposit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
            <td className="border p-2 text-right">
              {totals.qr.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
            <td className="border p-2 text-right text-red-700">
              {totalBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const DayWiseSummaryReport = () => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("uber_black");
  const [dates, setDates] = useState({
    fromDate: moment().subtract(7, "days").format("YYYY-MM-DD"),
    toDate: moment().format("YYYY-MM-DD"),
  });

  const token = Cookies.get("token");

  const handleDateSelect = (range) => {
    if (!range?.from) return;

    const fromDate = moment(range.from).format("YYYY-MM-DD");
    let toDate = range.to ? moment(range.to).format("YYYY-MM-DD") : fromDate;

    // Check 30 days limit
    const diff = moment(toDate).diff(moment(fromDate), "days");
    if (diff > 30) {
      toast.warning("Maximum range is 30 days. Adjusting to 30 days.");
      toDate = moment(fromDate).add(30, "days").format("YYYY-MM-DD");
    }

    setDates({ fromDate, toDate });
  };

  const fetchReport = async () => {
    if (!dates.fromDate || !dates.toDate) {
      toast.error("Please select a date range");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/day-wise-summary-report`,
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

      if (response?.data?.data && response.data.data.length > 0) {
        setReportData(response.data.data);
        toast.success("Report generated successfully");
      } else {
        setReportData([]);
        toast.error("No data found for the selected range");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch report");
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered data based on search and tab
  const filteredData = useMemo(() => {
    if (!reportData) return { uber_black: [], uber_green: [] };

    const allData = reportData || [];
    const black = allData.filter(
      (item) => item.performance_type === "Uber Black",
    );
    const green = allData.filter(
      (item) => item.performance_type === "Uber Green",
    );

    const filterFn = (item) => {
      if (!searchQuery) return true;
      return Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase()),
      );
    };

    return {
      uber_black: black.filter(filterFn),
      uber_green: green.filter(filterFn),
    };
  }, [reportData, searchQuery]);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Day-wise Summary Report</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Date Range</label>
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
                      rangeText(dates.fromDate, dates.toDate)
                    ) : (
                      <span>Pick a date range</span>
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
                  />
                </PopoverContent>
              </Popover>
            </div>

            {dates.fromDate && (
              <div className="flex flex-col gap-1.5">
                <Label>Selected Date Range</Label>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md inline-block">
                  <p className="text-xs text-blue-700 font-medium">
                    <span className="font-bold">
                      {moment(dates.fromDate).format("DD MMM YYYY")}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold">
                      {moment(dates.toDate).format("DD MMM YYYY")}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={fetchReport}
              disabled={isLoading}
              className="h-11 w-full"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>

            {reportData?.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results Section with Tabs */}
          {reportData?.length > 0 && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="uber_black" className="px-8">
                  Uber Black
                </TabsTrigger>
                <TabsTrigger value="uber_green" className="px-8">
                  Uber Green
                </TabsTrigger>
              </TabsList>
              <TabsContent value="uber_black">
                <ReportTable data={filteredData.uber_black} type="Uber Black" />
              </TabsContent>
              <TabsContent value="uber_green">
                <ReportTable data={filteredData.uber_green} type="Uber Green" />
              </TabsContent>
            </Tabs>
          )}

          {reportData?.length === 0 && !isLoading && (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                <Search className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg">
                No data found in the date range
              </p>
              <p className="text-gray-500">
                {moment(dates.fromDate).format("DD MMM YYYY")} to{" "}
                {moment(dates.toDate).format("DD MMM YYYY")}
              </p>
            </div>
          )}

          {!reportData && !isLoading && (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Pick a date range and click Generate Report to see data
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const rangeText = (from, to) => {
  if (!from) return "Pick a date";
  if (!to || from === to) return moment(from).format("DD-MM-YYYY");
  return `${moment(from).format("DD-MM-YYYY")} - ${moment(to).format("DD-MM-YYYY")}`;
};

export default DayWiseSummaryReport;
