import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowLeft, Car, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Loader2,
  Search,
  ChevronsUpDown,
  Edit as EditIcon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import BASE_URL from "@/config/base-url";
import { VEHICLE_PRODUCT_TYPES } from "@/config/vehicle-config";
import moment from "moment";

const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = Cookies.get("token");

  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [initialVehicle, setInitialVehicle] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);

  const [vehicle, setVehicle] = useState({
    vehicle_uuid: "",
    vehicle_number_plate: "",
    vehicle_product_type: "",
    vehicle_status: "",
    vehicle_variant: "",
    merchant_id: "",
    vehicle_umbrella: "",
    vehicle_tissue_box: "",
  });

  // Assign Driver State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [driverSearchTerm, setDriverSearchTerm] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState(null);
  const [subFormData, setSubFormData] = useState({
    vehicles_id: id,
    driver_uuid: "",
    driver_fullname: "",
    vehicles_sub_start_date: "",
    vehicles_sub_end_date: "",
    vehicles_sub_variant: "",
    merchant_id: "",
    vehicle_umbrella: "",
    vehicle_tissue_box: "",
    vehicles_sub_status: "Active",
  });

  const {
    data: vehicleData,
    isLoading,
    refetch: refetchVehicle,
  } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/vehicle/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const vehicleData = response.data?.data;
      const cleanedData = {};

      Object.keys(vehicleData).forEach((key) => {
        cleanedData[key] = vehicleData[key] === null ? "" : vehicleData[key];
      });

      setVehicle((prev) => ({
        ...prev,
        ...cleanedData,
      }));
      setInitialVehicle((prev) => ({
        ...prev,
        ...cleanedData,
      }));
      return response.data;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  // Fetch Drivers for dropdown
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
    enabled: isDialogOpen,
  });

  const filteredDrivers = drivers.filter((d) => {
    const name = (d.full_name || "").toLowerCase();
    return (
      name.includes(driverSearchTerm.toLowerCase()) ||
      (d.UUID || "").toLowerCase().includes(driverSearchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    const isDirty =
      vehicle.vehicle_product_type !== initialVehicle.vehicle_product_type ||
      vehicle.vehicle_status !== initialVehicle.vehicle_status;
    setIsFormDirty(isDirty);
  }, [vehicle.vehicle_product_type, vehicle.vehicle_status, initialVehicle]);

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!vehicle.vehicle_uuid?.trim()) {
      newErrors.vehicle_uuid = "Vehicle UUID is required";
      isValid = false;
    }

    if (!vehicle.vehicle_number_plate?.trim()) {
      newErrors.vehicle_number_plate = "Vehicle Number Plate is required";
      isValid = false;
    }

    if (!vehicle.vehicle_status) {
      newErrors.vehicle_status = "Vehicle Status is required";
      isValid = false;
    }

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  };

  const updateVehicleMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.put(
        `${BASE_URL}/api/vehicle/${id}`,
        formData,
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
      if (data.code === 201) {
        queryClient.invalidateQueries(["vehicles"]);
        toast.success(data.message || "Vehicle Updated Successfully");
        navigate("/vehicle");
      } else {
        toast.error(data.message || "Vehicle Update Error");
      }
    },
    onError: (error) => {
      console.error("Vehicle Update Error:", error.response?.data?.message);
      toast.error(error.response?.data?.message || "Vehicle Update Error");
    },
    onSettled: () => {
      setIsButtonDisabled(false);
    },
  });

  const vehicleSubMutation = useMutation({
    mutationFn: async (data) => {
      const url = isEditMode
        ? `${BASE_URL}/api/vehiclesub/${editingSubId}`
        : `${BASE_URL}/api/vehiclesub`;
      const method = isEditMode ? "put" : "post";

      const response = await axios[method](url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (
        data.code == 201 ||
        data.code == 200 ||
        data.message?.toLowerCase().includes("successfully")
      ) {
        toast.success(
          data.message ||
            (isEditMode
              ? "Subscription Updated"
              : "Driver Assigned Successfully"),
        );
        refetchVehicle();
        queryClient.invalidateQueries(["vehicle", id]);
        setIsDialogOpen(false);
        resetSubForm();
      } else {
        toast.error(data.message || "Error processing subscription");
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error processing subscription",
      );
    },
  });

  const deleteSubMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`${BASE_URL}/api/vehiclesub/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      // API might return code as 200 or status as 200, or just a message.
      if (
        data.code == 200 ||
        data.code == 204 ||
        data.message?.toLowerCase().includes("successfully")
      ) {
        toast.success(data.message || "Subscription Deleted Successfully");
        refetchVehicle();
        queryClient.invalidateQueries(["vehicle", id]);
        setIsDeleteDialogOpen(false);
        setSubToDelete(null);
      } else {
        toast.error(data.message || "Error deleting subscription");
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error deleting subscription",
      );
    },
  });

  const resetSubForm = () => {
    setSubFormData({
      vehicles_id: id,
      driver_uuid: "",
      driver_fullname: "",
      vehicles_sub_start_date: "",
      vehicles_sub_end_date: "",
    });
    setDriverSearchTerm("");
    setIsEditMode(false);
    setEditingSubId(null);
  };

  const handleSubSubmit = (e) => {
    e.preventDefault();
    if (!subFormData.driver_uuid) {
      toast.error("Please select a driver");
      return;
    }
    if (!subFormData.vehicles_sub_start_date) {
      toast.error("Start date is required");
      return;
    }
    if (isEditMode && subFormData.vehicles_sub_status === "Inactive") {
      if (!subFormData.vehicles_sub_end_date) {
        toast.error("End date is required");
        return;
      }
    }
    vehicleSubMutation.mutate(subFormData);
  };

  const handleEditSub = (sub) => {
    setIsEditMode(true);
    setEditingSubId(sub.id);
    setSubFormData({
      vehicles_id: id,
      driver_uuid: sub.driver_uuid,
      driver_fullname: sub.driver_fullname,
      vehicles_sub_start_date: sub.vehicles_sub_start_date
        ? sub.vehicles_sub_start_date.split("T")[0]
        : "",
      vehicles_sub_end_date: sub.vehicles_sub_end_date
        ? sub.vehicles_sub_end_date.split("T")[0]
        : "",
      vehicles_sub_status: sub.vehicles_sub_status,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteSub = (sub) => {
    setSubToDelete(sub);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateForm();

    if (!isValid) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    const formData = new FormData();
    formData.append("vehicle_uuid", vehicle.vehicle_uuid || "");
    formData.append("vehicle_number_plate", vehicle.vehicle_number_plate || "");
    formData.append("vehicle_product_type", vehicle.vehicle_product_type || "");
    formData.append("vehicle_status", vehicle.vehicle_status || "");
    formData.append("vehicle_variant", vehicle.vehicle_variant || "");
    formData.append("merchant_id", vehicle.merchant_id || "");
    formData.append("vehicle_umbrella", vehicle.vehicle_umbrella || "");
    formData.append("vehicle_tissue_box", vehicle.vehicle_tissue_box || "");

    setIsButtonDisabled(true);
    updateVehicleMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const activeCount = (vehicleData?.vehicleSub || []).filter(
    (item) => item.vehicles_sub_status === "Active",
  ).length;

  return (
    <div className="w-full space-y-1 p-4">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Car className="text-muted-foreground w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-md font-semibold text-gray-900">
                    Edit Vehicle
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Update vehicle information and details
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/vehicle")}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 flex-shrink-0 mt-2 sm:mt-0"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </Button>
        </div>
      </Card>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center p-1 gap-2 text-sm rounded-md px-1 font-medium bg-[var(--team-color)] text-white">
                <Car className="w-4 h-4" />
                Vehicle Details
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
                <div className="">
                  <Label htmlFor="vehicle_uuid" className="text-xs font-medium">
                    Vehicle UUID *
                  </Label>
                  <Input
                    id="vehicle_uuid"
                    name="vehicle_uuid"
                    disabled
                    value={vehicle.vehicle_uuid}
                    onChange={onInputChange}
                    placeholder="Enter vehicle UUID"
                  />
                  {errors?.vehicle_uuid && (
                    <p className="text-red-500 text-xs">
                      {errors.vehicle_uuid}
                    </p>
                  )}
                </div>

                <div className="">
                  <Label
                    htmlFor="vehicle_number_plate"
                    className="text-xs font-medium"
                  >
                    Number Plate *
                  </Label>
                  <Input
                    id="vehicle_number_plate"
                    name="vehicle_number_plate"
                    disabled
                    value={vehicle.vehicle_number_plate}
                    onChange={onInputChange}
                    placeholder="Enter vehicle number plate"
                  />
                  {errors?.vehicle_number_plate && (
                    <p className="text-red-500 text-xs">
                      {errors.vehicle_number_plate}
                    </p>
                  )}
                </div>

                <div className="">
                  <Label
                    htmlFor="vehicle_product_type"
                    className="text-xs font-medium"
                  >
                    Vehicle Type
                  </Label>
                  <Select
                    value={vehicle.vehicle_product_type || ""}
                    onValueChange={(value) =>
                      setVehicle((prev) => ({
                        ...prev,
                        vehicle_product_type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="">
                  <Label
                    htmlFor="vehicle_status"
                    className="text-xs font-medium"
                  >
                    Status *
                  </Label>
                  <Select
                    value={vehicle.vehicle_status || ""}
                    onValueChange={(value) =>
                      setVehicle((prev) => ({ ...prev, vehicle_status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Under Maintenance">
                        Under Maintenance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors?.vehicle_status && (
                    <p className="text-red-500 text-xs">
                      {errors.vehicle_status}
                    </p>
                  )}
                </div>

                <div className="">
                  <Label
                    htmlFor="vehicle_variant"
                    className="text-xs font-medium"
                  >
                    Vehicle Variant
                  </Label>
                  <Input
                    id="vehicle_variant"
                    type="text"
                    value={vehicle.vehicle_variant || ""}
                    onChange={(e) =>
                      setVehicle((prev) => ({
                        ...prev,
                        vehicle_variant: e.target.value,
                      }))
                    }
                  />
                  {errors?.vehicle_variant && (
                    <p className="text-red-500 text-xs">
                      {errors.vehicle_variant}
                    </p>
                  )}
                </div>

                <div className="">
                  <Label htmlFor="merchant_id" className="text-xs font-medium">
                    Merchant ID
                  </Label>
                  <Input
                    id="merchant_id"
                    type="text"
                    placeholder="Merchant ID"
                    value={vehicle.merchant_id || ""}
                    onChange={(e) =>
                      setVehicle((prev) => ({
                        ...prev,
                        merchant_id: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="">
                  <Label
                    htmlFor="vehicle_umbrella"
                    className="text-xs font-medium"
                  >
                    Vehicle Umbrella
                  </Label>
                  <Select
                    id="vehicle_umbrella"
                    value={vehicle.vehicle_umbrella || ""}
                    onValueChange={(value) =>
                      setVehicle((prev) => ({
                        ...prev,
                        vehicle_umbrella: value,
                      }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select umbrella" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="">
                  <Label
                    htmlFor="vehicle_tissue_box"
                    className="text-xs font-medium"
                  >
                    Vehicle Tissue Box
                  </Label>
                  <Select
                    id="vehicle_tissue_box"
                    value={vehicle.vehicle_tissue_box || ""}
                    onValueChange={(value) =>
                      setVehicle((prev) => ({
                        ...prev,
                        vehicle_tissue_box: value,
                      }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tissue box" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={
                    isButtonDisabled ||
                    updateVehicleMutation.isPending ||
                    !isFormDirty
                  }
                  className="flex items-center gap-2"
                >
                  {updateVehicleMutation.isPending ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Car className="w-4 h-4" />
                      Update Vehicle
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/vehicle")}
                >
                  Cancel
                </Button>
              </div>
              <Button
                type="button"
                disabled={
                  activeCount != 0 || vehicle.vehicle_status == "Inactive"
                }
                onClick={() => {
                  resetSubForm();
                  setIsDialogOpen(true);
                }}
              >
                Assign Driver
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between p-2 border-b">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assigned Drivers
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-16">S.No</TableHead>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !vehicleData?.vehicleSub ||
                  vehicleData.vehicleSub.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No drivers assigned to this vehicle yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicleData.vehicleSub.map((sub, index) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {sub.driver_fullname}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono uppercase">
                            {sub.driver_uuid}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.vehicles_sub_start_date
                          ? moment(sub.vehicles_sub_start_date).format(
                              "DD-MM-YYYY",
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.vehicles_sub_end_date
                          ? moment(sub.vehicles_sub_end_date).format(
                              "DD-MM-YYYY",
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.vehicles_sub_status
                          ? sub.vehicles_sub_status
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={
                            activeCount != 0 &&
                            sub.vehicles_sub_status == "Inactive"
                          }
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEditSub(sub)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteSub(sub)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Driver Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetSubForm();
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Assignment" : "Assign Driver to Vehicle"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubSubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="driver">Driver Name</Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal h-10 border-muted-foreground/20"
                  >
                    <span className="truncate">
                      {subFormData.driver_fullname || "Select driver..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                  side="bottom"
                  avoidCollisions={true}
                  style={{ zIndex: 1000 }}
                >
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
                    <ScrollArea
                      className="h-[250px]"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <div className="p-1">
                        {driversLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="ml-2 text-xs">Loading...</span>
                          </div>
                        ) : driversError ? (
                          <div className="py-6 text-center text-xs text-destructive">
                            Failed to load drivers.
                          </div>
                        ) : filteredDrivers.length === 0 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground font-medium px-2">
                            No drivers matching "{driverSearchTerm}"
                          </div>
                        ) : (
                          filteredDrivers.map((driver) => (
                            <button
                              key={driver.UUID || driver.id}
                              type="button"
                              className={cn(
                                "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left transition-colors",
                                subFormData.driver_uuid === driver.UUID &&
                                  "bg-accent",
                              )}
                              onClick={() => {
                                setSubFormData({
                                  ...subFormData,
                                  driver_uuid: driver.UUID,
                                  driver_fullname: driver.full_name,
                                });
                                setPopoverOpen(false);
                                setDriverSearchTerm("");
                              }}
                            >
                              <div className="flex flex-col flex-1 truncate">
                                <span className="font-medium">
                                  {driver.full_name || "Unnamed Driver"}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate">
                                  UUID: {driver.UUID}
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
              {subFormData.driver_uuid && (
                <p className="text-[11px] text-muted-foreground mt-0.5 ml-1 flex items-center gap-1">
                  <span className="font-medium text-blue-600">UUID:</span>{" "}
                  {subFormData.driver_uuid}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vehicles_sub_start_date">Start Date *</Label>
                <Input
                  id="vehicles_sub_start_date"
                  type="date"
                  value={subFormData.vehicles_sub_start_date}
                  onChange={(e) =>
                    setSubFormData({
                      ...subFormData,
                      vehicles_sub_start_date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vehicles_sub_end_date">End Date</Label>
                <Input
                  id="vehicles_sub_end_date"
                  type="date"
                  value={subFormData.vehicles_sub_end_date}
                  onChange={(e) =>
                    setSubFormData({
                      ...subFormData,
                      vehicles_sub_end_date: e.target.value,
                    })
                  }
                />
              </div>
              {isEditMode && (
                <div className="grid gap-2">
                  <Label htmlFor="vehicles_sub_status">Status</Label>
                  <Select
                    value={subFormData.vehicles_sub_status}
                    onValueChange={(value) =>
                      setSubFormData({
                        ...subFormData,
                        vehicles_sub_status: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={vehicleSubMutation.isPending}>
                {vehicleSubMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Update Assignment" : "Assign Driver"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subscription for{" "}
              <span className="font-semibold text-gray-900">
                {subToDelete?.driver_fullname}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSubToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteSubMutation.mutate(subToDelete.id)}
            >
              {deleteSubMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditVehicle;
