import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  Car,
  Loader2,
  Settings,
  Info,
  History,
  Building2,
  ShieldCheck,
  Package,
  Users,
  AlertCircle,
  Printer,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BASE_URL from "@/config/base-url";
import moment from "moment";

const ViewVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/vehicle/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!id,
  });

  const vehicle = response?.data || {};
  const assignmentHistory = vehicle.vehicleSub || [];

  const DisplayField = ({ label, value, icon: Icon }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider doc-field-label">
        {Icon && <Icon className="w-3 h-3" />}
        <span>{label}</span>
      </div>
      <div className="text-sm font-semibold text-gray-900 break-all doc-field-value min-h-[1.5rem] flex items-center border-b border-gray-50 pb-0.5">
        {value || (
          <span className="text-muted-foreground/50 font-normal italic text-xs">
            N/A
          </span>
        )}
      </div>
    </div>
  );

  const MetadataRow = ({ label, value, subValue }) => (
    <div className="flex justify-between items-center py-2 px-1">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <div className="text-right">
        <div className="text-sm font-bold">{value || "N/A"}</div>
        {subValue && (
          <div className="text-[10px] text-muted-foreground font-mono">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Loading Data...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-6">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-destructive">
                Record Not Found
              </h2>
              <p className="text-sm text-muted-foreground">
                {error?.response?.data?.message ||
                  "There was a problem retrieving the vehicle information."}
              </p>
            </div>
            <Button onClick={() => navigate("/vehicle")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Vehicles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto print:mx-0 space-y-4 p-2 md:p-4 animate-in fade-in duration-500 printable-document bg-white">
      {/* Report Header (Visible on Screen & Print) */}
      <div className="text-center border-b-2 border-[var(--team-color)] pb-4 mb-6 print:mb-2 print:pb-2">
        <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900">
          Vehicle Information
        </h1>
      </div>

      <div className="flex items-center justify-between no-print mb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Vehicle Profile
        </h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.print()}
            variant="default"
            size="sm"
            className="font-bold bg-gray-900 text-white hover:bg-gray-800"
          >
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
          <Button
            onClick={() => navigate("/vehicle")}
            variant="outline"
            size="sm"
            className="font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </div>
      </div>

      {/* Card 1: Vehicle Overview */}
      <Card className="shadow-none border-none print:shadow-none print:ring-0">
        <CardHeader className="p-0">
          <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white border shadow-sm flex items-center justify-center print:border-gray-300">
                <Car className="w-7 h-7 text-gray-900" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-col items-start font-black text-2xl tracking-tight uppercase">
                  {vehicle.vehicle_number_plate}
                  <Badge
                    className={`font-bold ${
                      vehicle.vehicle_status === "Active"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {vehicle.vehicle_status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-6 space-y-8 print:p-0 pt-2">
          <div className="flex items-center p-2.5 gap-2 text-sm rounded-lg font-bold bg-[var(--team-color)] text-white uppercase tracking-widest doc-section-header">
            <Car className="w-4 h-4" />
            Vehicle Details
          </div>
          <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DisplayField
              label="Number Plate"
              value={vehicle.vehicle_number_plate}
              icon={ShieldCheck}
            />
            <DisplayField
              label="Variant"
              value={vehicle.vehicle_variant}
              icon={Package}
            />
            <DisplayField
              label="Product Type"
              value={vehicle.vehicle_product_type}
              icon={Building2}
            />
            <DisplayField
              label="Merchant ID"
              value={vehicle.merchant_id}
              icon={Building2}
            />
            <DisplayField
              label="Vehicle Umbrella"
              value={vehicle.vehicle_umbrella}
            />
            <DisplayField
              label="Vehicle Tissue Box"
              value={vehicle.vehicle_tissue_box}
            />
            <div className="md:col-span-2">
              <DisplayField
                label="Current Fleet Status"
                value={vehicle.vehicle_status}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Assignment History */}
      <Card className="shadow-none border-none print:shadow-none print:ring-0 p-0 mt-6 border-t border-gray-100 pt-6">
        <CardHeader className="doc-section-header bg-[var(--team-color)] text-white rounded-lg mb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
            <Users className="w-5 h-5 text-white" />
            Driver Assignment History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[80px] font-bold text-xs uppercase tracking-widest text-muted-foreground">
                    S.No
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                    Driver Information
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground text-center">
                    Assignment Period
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground text-right">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground italic font-medium"
                    >
                      No assignments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  assignmentHistory.map((sub, idx) => (
                    <TableRow
                      key={sub.id}
                      className="group hover:bg-primary/5 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">
                            {sub.driver_fullname}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">
                            {sub.driver_uuid}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-xs text-gray-700">
                        {(() => {
                          const date = sub.vehicles_sub_start_date;
                          if (!date || date === "0000-00-00") return "N/A";
                          const m = moment(date);
                          return m.isValid() ? m.format("DD MMM YYYY") : "N/A";
                        })()}
                        <span className="mx-2 text-muted-foreground/50">→</span>
                        {(() => {
                          const date = sub.vehicles_sub_end_date;
                          if (!date || date === "0000-00-00") return "Active Assignment";
                          const m = moment(date);
                          return m.isValid() ? m.format("DD MMM YYYY") : "Active Assignment";
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className={
                            sub.vehicles_sub_status === "Active"
                              ? "bg-green-500/10 text-green-600 border-green-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }
                        >
                          {sub.vehicles_sub_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewVehicle;
