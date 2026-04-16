import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import BASE_URL from "@/config/base-url";
import Cookies from "js-cookie";
import moment from "moment";
import {
  Users,
  Car,
  Route,
  Calendar as CalendarIcon,
  TrendingUp,
  ArrowUpRight,
  ClipboardCheck,
  Ban,
  Search,
  ArrowRight,
  Wallet,
  Banknote,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const Home = () => {
  const currentYear = moment().year();
  const currentMonthName = moment().format("MMMM");

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [searchTerm, setSearchTerm] = useState("");

  const token = Cookies.get("token");

  // Helper for color mapping
  const getTypeColor = (type) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("green")) return "text-emerald-500 bg-emerald-50";
    if (t.includes("black")) return "text-slate-900 bg-slate-100";
    if (t.includes("comfort")) return "text-blue-500 bg-blue-50";
    if (t.includes("hourly")) return "text-purple-500 bg-purple-50";
    return "text-slate-500 bg-slate-50";
  };

  // Generate years from 2025 to current year
  const years = useMemo(() => {
    const startYear = 2025;
    const yearList = [];
    for (let y = startYear; y <= currentYear; y++) {
      yearList.push(y.toString());
    }
    return yearList;
  }, [currentYear]);

  // Generate months based on selected year
  const months = useMemo(() => {
    const allMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    if (parseInt(selectedYear) === currentYear) {
      const currentMonthIndex = moment().month(); // 0-indexed
      return allMonths.slice(0, currentMonthIndex + 1);
    }

    return allMonths;
  }, [selectedYear, currentYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear, selectedMonth]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const yearMonthString = `${selectedYear} ${selectedMonth}`;
      const response = await axios.post(
        `${BASE_URL}/api/dashboard`,
        { year_month: yearMonthString },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  const topStats = [
    {
      title: "Total Trips",
      value: dashboardData?.data?.totalTrips || 0,
      icon: Route,
      color: "bg-blue-500",
      link: "/trip",
    },
    {
      title: "Total Drivers",
      value: dashboardData?.data?.totalDrivers || 0,
      icon: Users,
      color: "bg-purple-500",
      link: "/driver",
    },
    {
      title: "Total Vehicles",
      value: dashboardData?.data?.totalVehicles || 0,
      icon: Car,
      color: "bg-emerald-500",
      link: "/vehicle",
    },
    {
      title: "Pending QR",
      value: dashboardData?.data?.pendingDriverQR || 0,
      icon: ClipboardCheck,
      color: "bg-amber-500",
      link: "/vehicle",
    },
  ];

  // Financial calculations
  const totalPenalty = useMemo(() => {
    const items = dashboardData?.data?.totalDriverPenalty || [];
    return items.reduce(
      (acc, curr) => acc + parseFloat(curr.totalPenalty || 0),
      0,
    );
  }, [dashboardData]);

  // Grouped penalty for granular display
  const groupedPenalties = useMemo(() => {
    const rawPenalties = dashboardData?.data?.totalDriverPenalty || [];
    const groups = {};

    rawPenalties.forEach((item) => {
      const type = item.performance_type;
      if (!groups[type]) {
        groups[type] = {
          performance_type: type,
          credit: 0,
          debit: 0,
          total: 0,
        };
      }
      const amt = parseFloat(item.totalPenalty || 0);
      if (item.penalty_type === "Credit") {
        groups[type].credit += amt;
      } else if (item.penalty_type === "Debit") {
        groups[type].debit += amt;
      }
      groups[type].total += amt;
    });

    return Object.values(groups);
  }, [dashboardData]);

  const totalDeposit = useMemo(() => {
    const items = dashboardData?.data?.totalDriverDeposit || [];
    // Note: API uses 'totalDeposity'
    return items.reduce(
      (acc, curr) => acc + parseFloat(curr.totalDeposity || 0),
      0,
    );
  }, [dashboardData]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const graphData = dashboardData?.data?.graph1 || [];
    return {
      labels: graphData.map((item) => item.trip_product_type),
      datasets: [
        {
          label: "Total Trips",
          data: graphData.map((item) => item.totalTrips),
          backgroundColor: "rgba(59, 130, 246, 0.8)", // blue-500
          borderRadius: 6,
        },
        {
          label: "Completed Trips",
          data: graphData.map((item) => parseInt(item.completedTrips)),
          backgroundColor: "rgba(16, 185, 129, 0.8)", // emerald-500
          borderRadius: 6,
        },
      ],
    };
  }, [dashboardData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: "500" },
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1e293b",
        bodyColor: "#64748b",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: { font: { size: 11 } },
      },
    },
  };

  // Table Data Filtering
  const filteredTrips = useMemo(() => {
    const trips = dashboardData?.data?.tripsDetails || [];
    if (!searchTerm) return trips;
    return trips.filter(
      (trip) =>
        trip.trip_driver_full_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        trip.trip_product_type.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [dashboardData, searchTerm]);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-5 bg-[#f8f9fa] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="w-1/1 md:w-1/2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Fleet Analytics
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Comprehensive overview of operations and financial vitals
          </p>
        </div>
        <div className=" w-1/1 md:w-1/2 flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500 whitespace-nowrap">
              <CalendarIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-bold">Analysis Period:</span>
            </div>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-100">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] h-9 border-none bg-slate-50 hover:bg-slate-100 transition-colors focus:ring-0 font-medium">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[130px] h-9 border-none bg-slate-50 hover:bg-slate-100 transition-colors focus:ring-0 font-medium">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* TOP SECTION: 4 Stat Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {topStats.map((stat, index) => (
          <Card
            key={index}
            onClick={() => stat.link && navigate(stat.link)}
            className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group bg-white cursor-pointer"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-slate-900 transition-colors">
                {stat.title}
              </CardTitle>
              <div
                className={`${stat.color} p-2 rounded-lg text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold tracking-tight text-slate-900">
                    {stat.value.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </>
              )}
            </CardContent>
            <div className={`h-1 w-full ${stat.color} opacity-20`} />
          </Card>
        ))}
      </div>

      {/* FINANCIAL BREAKDOWN SECTION: 2 Specific Cards */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Deposit Card */}
        <Card
          onClick={() => navigate("/deposit")}
          className="border-none shadow-md bg-white overflow-hidden group cursor-pointer"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-emerald-50/30">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-slate-900">
                Driver Deposits
                <div className="text-4xl font-extrabold text-emerald-600">
                  ₹
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 inline-block" />
                  ) : (
                    totalDeposit.toLocaleString()
                  )}
                </div>
              </CardTitle>
            </div>
            <div className="bg-emerald-500 p-3 rounded-xl text-white shadow-lg transform group-hover:rotate-12 transition-transform">
              <Wallet className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {isLoading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))
                : dashboardData?.data?.totalDriverDeposit?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTypeColor(item.performance_type)}`}
                        >
                          {item.performance_type}
                        </div>
                      </div>
                      <span className="font-bold text-slate-700">
                        ₹{parseFloat(item.totalDeposity).toLocaleString()}
                      </span>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        {/* Penalty Card */}
        <Card
          onClick={() => navigate("/penalty")}
          className="border-none shadow-md bg-white overflow-hidden group cursor-pointer"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-rose-50/30">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-slate-900">
                Total Penalties
                <div className="text-4xl font-extrabold text-rose-600">
                  ₹
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 inline-block" />
                  ) : (
                    totalPenalty.toLocaleString()
                  )}
                </div>
              </CardTitle>
            </div>
            <div className="bg-rose-500 p-3 rounded-xl text-white shadow-lg transform group-hover:-rotate-12 transition-transform">
              <Ban className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {isLoading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))
                : groupedPenalties.map((group, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-rose-100 hover:bg-rose-50/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTypeColor(group.performance_type)}`}
                        >
                          {group.performance_type}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        {group.credit > 0 && (
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                              Credit
                            </span>
                            <span className="font-bold text-emerald-600 text-sm">
                              ₹{group.credit.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {group.debit > 0 && (
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                              Debit
                            </span>
                            <span className="font-bold text-rose-600 text-sm">
                              ₹{group.debit.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {group.credit === 0 && group.debit === 0 && (
                          <span className="font-bold text-slate-700">
                            ₹{group.total.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ANALYTICS SECTION: Chart & Table */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Chart Section */}
        <Card className="lg:col-span-4 border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle>Trip Performance Trends</CardTitle>
            <CardDescription>
              Total vs Completed trips by product type
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : dashboardData?.data?.graph1?.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
                No data available for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card className="lg:col-span-3 border-none shadow-md bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Driver Trip Details</CardTitle>
              <CardDescription>Performance by individuals</CardDescription>
            </div>
            <div className="relative w-40">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-xs border-slate-100 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow>
                    <TableHead className="text-xs font-bold font-mono">
                      Driver
                    </TableHead>
                    <TableHead className="text-xs font-bold font-mono">
                      Type
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold font-mono">
                      Completed/Trips
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredTrips.length > 0 ? (
                    filteredTrips.map((trip, i) => (
                      <TableRow
                        key={i}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <TableCell className="font-medium text-slate-900 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs">
                              {trip.trip_driver_full_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono uppercase">
                              {trip.trip_driver_uuid.slice(0, 8)}...
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold group-hover:bg-slate-200 transition-colors">
                            {trip.trip_product_type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-900">
                              {trip.completedTrips} / {trip.totalTrips}
                            </span>
                            <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{
                                  width: `${(parseInt(trip.completedTrips) / trip.totalTrips) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center h-24 text-slate-400 italic text-sm"
                      >
                        No results found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
