import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { AlertCircle, ArrowLeft, Car } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BASE_URL from "@/config/base-url";
import { VEHICLE_PRODUCT_TYPES } from "@/config/vehicle-config";
import { Label } from "@radix-ui/react-label";

const CreateVehicle = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = Cookies.get("token");

  const [isDuplicate, setIsDuplicate] = useState(false);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [vehicle, setVehicle] = useState({
    vehicle_uuid: "",
    vehicle_number_plate: "",
    vehicle_product_type: "",
  });

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkDuplicateVehicle = async () => {
    if (vehicle.vehicle_uuid && vehicle.vehicle_number_plate) {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/check-vehicle-duplicate`,
          {
            vehicle_uuid: vehicle.vehicle_uuid,
            vehicle_number_plate: vehicle.vehicle_number_plate,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data.code === 422) {
          toast.error(response.data.message);
          return false;
        }
        return true;
      } catch (error) {
        console.error(
          "Error checking duplicate vehicle",
          error.response?.data?.message,
        );
        return true;
      }
    }
    return true;
  };

  useEffect(() => {
    if (vehicle.vehicle_uuid && vehicle.vehicle_number_plate) {
      const timer = setTimeout(async () => {
        const isNotDuplicate = await checkDuplicateVehicle();
        setIsDuplicate(!isNotDuplicate);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsDuplicate(false);
    }
  }, [vehicle.vehicle_uuid, vehicle.vehicle_number_plate]);

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

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  };

  const createVehicleMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(`${BASE_URL}/api/vehicle`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.code === 201) {
        queryClient.invalidateQueries(["vehicles"]);
        toast.success(data.message || "Vehicle Created Successfully");

        setVehicle({
          vehicle_uuid: "",
          vehicle_number_plate: "",
          vehicle_product_type: "",
        });

        navigate("/vehicle");
      } else {
        toast.error(data.message || "Vehicle Creation Error");
      }
    },
    onError: (error) => {
      console.error("Vehicle Creation Error:", error.response?.data?.message);
      toast.error(error.response?.data?.message || "Vehicle Creation Error");
    },
    onSettled: () => {
      setIsButtonDisabled(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateForm();

    if (!isValid) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      const isNotDuplicate = await checkDuplicateVehicle();
      if (!isNotDuplicate) {
        return;
      }

      const formData = new FormData();
      formData.append("vehicle_uuid", vehicle.vehicle_uuid || "");
      formData.append(
        "vehicle_number_plate",
        vehicle.vehicle_number_plate || "",
      );
      formData.append(
        "vehicle_product_type",
        vehicle.vehicle_product_type || "",
      );

      setIsButtonDisabled(true);
      createVehicleMutation.mutate(formData);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred during submission");
      setIsButtonDisabled(false);
    }
  };

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
                    Add Vehicle
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Create a new vehicle record
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="">
                  <Label htmlFor="vehicle_uuid" className="text-xs font-medium">
                    Vehicle UUID *
                  </Label>
                  <Input
                    id="vehicle_uuid"
                    name="vehicle_uuid"
                    value={vehicle.vehicle_uuid}
                    onChange={onInputChange}
                    className={isDuplicate ? "border-red-500" : ""}
                    placeholder="Enter vehicle UUID"
                  />
                  {errors?.vehicle_uuid && (
                    <p className="text-red-500 text-xs">
                      {errors.vehicle_uuid}
                    </p>
                  )}
                  {isDuplicate && (
                    <div className="flex items-center gap-1 text-red-500 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      Duplicate vehicle: UUID already exists
                    </div>
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
                    value={vehicle.vehicle_number_plate}
                    onChange={onInputChange}
                    className={isDuplicate ? "border-red-500" : ""}
                    placeholder="Enter vehicle number plate"
                  />
                  {errors?.vehicle_number_plate && (
                    <p className="text-red-500 text-xs">
                      {errors.vehicle_number_plate}
                    </p>
                  )}
                  {isDuplicate && (
                    <div className="flex items-center gap-1 text-red-500 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      Duplicate vehicle: Number plate already exists
                    </div>
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
                    value={vehicle.vehicle_product_type}
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
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="submit"
                disabled={isButtonDisabled || createVehicleMutation.isPending}
                className="flex items-center gap-2"
              >
                {createVehicleMutation.isPending ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Car className="w-4 h-4" />
                    Create Vehicle
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateVehicle;
