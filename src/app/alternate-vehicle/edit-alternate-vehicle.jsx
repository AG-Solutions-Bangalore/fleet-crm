import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  Car,
  User,
  Calendar,
  Loader2,
  Search,
  Check,
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import BASE_URL from "@/config/base-url";

const EditAlternateVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = Cookies.get("token");

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [vehiclePopoverOpen, setVehiclePopoverOpen] = useState(false);
  const [driverPopoverOpen, setDriverPopoverOpen] = useState(false);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  const [driverSearchTerm, setDriverSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    vehicle_number_plate: "",
    driver_uuid: "",
    driver_fullname: "",
    vehicles_ride_date: "",
  });

  // Fetch Existing Data
  const {
    data: rideData,
    isLoading: rideLoading,
    isError: rideError,
  } = useQuery({
    queryKey: ["alternate-ride", id],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/vehicle-alternate-ride/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = response.data?.data || {};
      // Format dates for input[type="date"]
      return {
        ...data,
        vehicles_ride_date: data.vehicles_ride_date
          ? data.vehicles_ride_date.split("T")[0]
          : "",
      };
    },
    enabled: !!id,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Sync data to form state
  useEffect(() => {
    if (rideData && !isInitialized) {
      setFormData(rideData);
      setIsInitialized(true);
    }
  }, [rideData, isInitialized]);

  // Fetch Drivers
  const {
    data: drivers = [],
    isLoading: driversLoading,
    isError: driversError,
  } = useQuery({
    queryKey: ["drivers-fullname"],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/getDriverFullname`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data?.data || [];
    },
  });

  // Fetch Vehicles
  const {
    data: vehicles = [],
    isLoading: vehiclesLoading,
    isError: vehiclesError,
  } = useQuery({
    queryKey: ["vehicles-minimal"],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/vehicle?pageSize=1000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data?.data?.data || [];
    },
  });

  const filteredVehicles = vehicles.filter((v) =>
    (v.vehicle_number_plate || "")
      .toLowerCase()
      .includes(vehicleSearchTerm.toLowerCase()),
  );

  const filteredDrivers = drivers.filter(
    (d) =>
      (d.full_name || "")
        .toLowerCase()
        .includes(driverSearchTerm.toLowerCase()) ||
      (d.UUID || "").toLowerCase().includes(driverSearchTerm.toLowerCase()),
  );

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.put(
        `${BASE_URL}/api/vehicle-alternate-ride/${id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.code === 201 || data.code === 200) {
        queryClient.invalidateQueries(["alternate-rides"]);
        queryClient.invalidateQueries(["alternate-ride", id]);
        toast.success(data.message || "Alternate Ride Updated Successfully");
        navigate("/alternate-vehicle-ride");
      } else {
        toast.error(data.message || "Error updating record");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Internal Server Error");
    },
    onSettled: () => setIsButtonDisabled(false),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.vehicle_number_plate ||
      !formData.driver_uuid ||
      !formData.vehicles_ride_date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsButtonDisabled(true);
    updateMutation.mutate(formData);
  };

  if (rideLoading || driversLoading || vehiclesLoading || !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">
          Initializing form...
        </p>
      </div>
    );
  }

  if (rideError || driversError || vehiclesError) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
          <p className="text-sm font-bold uppercase tracking-widest mb-4">
            Failed to load data
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-4 max-w-4xl mx-auto">
      <Card className="border-none shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 border border-orange-100">
              <Car className="text-orange-600 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Edit Alternate Ride
              </h1>
            </div>
          </div>
          <Button
            onClick={() => navigate("/alternate-vehicle-ride")}
            variant="outline"
            size="sm"
            className="h-9 px-4 font-bold border-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </Card>

      <Card className="border-none shadow-sm ring-1 ring-gray-100">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Vehicle Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Select Vehicle *
                </Label>
                <Popover
                  open={vehiclePopoverOpen}
                  onOpenChange={setVehiclePopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={vehiclePopoverOpen}
                      className="w-full justify-between h-10 border-gray-200 font-mono text-sm"
                    >
                      {formData.vehicle_number_plate ||
                        "Select vehicle plate..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <div className="flex flex-col">
                      <div className="flex items-center border-b px-3 sticky top-0 bg-white">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Search plate..."
                          value={vehicleSearchTerm}
                          onChange={(e) => setVehicleSearchTerm(e.target.value)}
                          className="border-none focus-visible:ring-0 shadow-none h-10 px-0"
                        />
                      </div>
                      <ScrollArea className="h-[200px]">
                        <div className="p-1">
                          {vehiclesLoading ? (
                            <div className="p-4 text-center">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            </div>
                          ) : filteredVehicles.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No vehicle found.
                            </div>
                          ) : (
                            filteredVehicles.map((v) => (
                              <button
                                key={v.id}
                                type="button"
                                className={cn(
                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left transition-colors",
                                  formData.vehicle_number_plate ===
                                    v.vehicle_number_plate && "bg-accent",
                                )}
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    vehicle_number_plate:
                                      v.vehicle_number_plate,
                                  }));
                                  setVehiclePopoverOpen(false);
                                  setVehicleSearchTerm("");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-3.5 w-3.5",
                                    formData.vehicle_number_plate ===
                                      v.vehicle_number_plate
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {v.vehicle_number_plate}
                              </button>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Driver Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Select Driver *
                </Label>
                <Popover
                  open={driverPopoverOpen}
                  onOpenChange={setDriverPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={driverPopoverOpen}
                      className="w-full justify-between h-10 border-gray-200 text-sm"
                    >
                      {formData.driver_fullname || "Select driver..."}
                      <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <div className="flex flex-col">
                      <div className="flex items-center border-b px-3 sticky top-0 bg-white">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Search driver..."
                          value={driverSearchTerm}
                          onChange={(e) => setDriverSearchTerm(e.target.value)}
                          className="border-none focus-visible:ring-0 shadow-none h-10 px-0"
                        />
                      </div>
                      <ScrollArea className="h-[200px]">
                        <div className="p-1">
                          {driversLoading ? (
                            <div className="p-4 text-center">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            </div>
                          ) : filteredDrivers.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No driver found.
                            </div>
                          ) : (
                            filteredDrivers.map((d) => (
                              <button
                                key={d.id}
                                type="button"
                                className={cn(
                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left transition-colors",
                                  formData.driver_uuid === d.UUID &&
                                    "bg-accent",
                                )}
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    driver_uuid: d.UUID,
                                    driver_fullname: d.full_name,
                                  }));
                                  setDriverPopoverOpen(false);
                                  setDriverSearchTerm("");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-3.5 w-3.5",
                                    formData.driver_uuid === d.UUID
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{d.full_name}</span>
                                  <span className="text-[10px] text-gray-400 uppercase font-mono">
                                    {d.UUID}
                                  </span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Ride Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    name="vehicles_ride_date"
                    value={formData.vehicles_ride_date}
                    onChange={onInputChange}
                    className="pl-10 h-10 border-gray-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
              <Button
                type="submit"
                disabled={isButtonDisabled || updateMutation.isPending}
                className="bg-gray-900 text-white hover:bg-gray-800 h-10 px-6 font-bold"
              >
                {updateMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Syncing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/alternate-vehicle-ride")}
                className="h-10 px-6 font-bold text-gray-500"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAlternateVehicle;
