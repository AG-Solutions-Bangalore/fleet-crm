import React from "react";
import Page from "../layout/page";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { DASHBOARD_API } from "@/constants/apiConstants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Briefcase, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();

  const {
    data: DData,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: DASHBOARD_API.list,
    queryKey: ["dashboard-list"],
    staleTime: 0,
  });

  const dashboardData = DData?.data || {};
  const latestRequests = dashboardData?.latest_service_requests || [];
  const usersServiceData = (dashboardData?.users_service || []).filter(
    (service) => service.users_count > 0,
  );

  return (
    <Page>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-red-500">Failed to load dashboard data.</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
              <Card
                onClick={() => navigate("/client-list")}
                className="hover:scale-105 duration-300 cursor-pointer"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-md font-medium">
                    Total Clients
                  </CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.users_count || 0}
                  </div>
                </CardContent>
              </Card>
              <Card
                onClick={() => navigate("/service-list")}
                className="hover:scale-105 duration-300 cursor-pointer"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-md font-medium">
                    Total Services
                  </CardTitle>
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.services_count || 0}
                  </div>
                </CardContent>
              </Card>
              <Card
                onClick={() => navigate("/service-request")}
                className="hover:scale-105 duration-300 cursor-pointer"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-md font-medium">
                    Pending Requests
                  </CardTitle>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.service_requests_pending_count || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Client Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={usersServiceData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="5 3" vertical={false} />
                        <XAxis
                          dataKey="service_name"
                          stroke="#888888"
                          fontSize={14}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={14}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                          cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] text-muted-foreground">
                                      Service -{" "}
                                      {payload[0].payload.service_name}
                                    </span>
                                    <span className="font-semibold text-sm">
                                      Clients - {payload[0].value}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey="users_count"
                          fill="currentColor"
                          radius={[4, 4, 0, 0]}
                          className="fill-primary"
                          barSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Latest Service Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User Name</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {latestRequests.length > 0 ? (
                        latestRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              {request.services_request_date
                                ? moment(request.services_request_date).format(
                                    "DD-MM-YYYY",
                                  )
                                : "-"}
                            </TableCell>
                            <TableCell className="font-medium">
                              {request.name}
                            </TableCell>
                            <TableCell>{request.mobile}</TableCell>
                            <TableCell>{request.service_name}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                                  request.services_request_status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : request.services_request_status ===
                                        "Approved"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                }`}
                              >
                                {request.services_request_status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No recent requests found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Page>
  );
};

export default Dashboard;
