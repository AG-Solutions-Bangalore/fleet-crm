import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BASE_URL from "@/config/base-url";
import moment from "moment";

const EditDriverPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = Cookies.get("token");

  const [initialPayment, setInitialPayment] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);

  const [payment, setPayment] = useState({
    driver_payment_date: "",
    driver_payment_full_name: "",
    driver_payment: "",
  });

  // Fetch specific payment record
  const { isLoading: isLoadingPayment } = useQuery({
    queryKey: ["driverPayment", id],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/driver-payment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data?.data;
      if (data) {
        const cleanedData = {
          driver_payment_date: data.driver_payment_date || "",
          driver_payment_full_name: data.driver_payment_full_name || "",
          driver_payment: data.driver_payment || "",
        };
        setPayment(cleanedData);
        setInitialPayment(cleanedData);
      }
      return data;
    },
    enabled: !!id,
  });

  // Fetch Drivers
  const { data: driversData, isLoading: isLoadingDrivers } = useQuery({
    queryKey: ["payment-drivers"],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/depositDriver`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data || [];
    },
  });

  useEffect(() => {
    const isDirty = JSON.stringify(payment) !== JSON.stringify(initialPayment);
    setIsFormDirty(isDirty);
  }, [payment, initialPayment]);

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setPayment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSelectChange = (value) => {
    setPayment((prev) => ({
      ...prev,
      driver_payment_full_name: value,
    }));
  };

  const validateForm = () => {
    if (!payment.driver_payment_date) {
      toast.error("Payment Date is required");
      return false;
    }
    if (!payment.driver_payment_full_name) {
      toast.error("Driver is required");
      return false;
    }
    if (!payment.driver_payment) {
      toast.error("Amount is required");
      return false;
    }
    return true;
  };

  const updatePaymentMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.put(
        `${BASE_URL}/api/driver-payment/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    },
    onSuccess: async (data) => {
      if (data.code === 201 || data.code === 200) {
        await queryClient.invalidateQueries(["driverPayments"]);
        await queryClient.invalidateQueries(["driverPayment", id]);
        toast.success(data.message || "Payment Updated Successfully");
        navigate("/paid-driver");
      } else {
        toast.error(data.message || "Payment Update Error");
      }
    },
    onError: (error) => {
      console.error("Payment Update Error:", error.response?.data?.message);
      toast.error(error.response?.data?.message || "Payment Update Error");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    updatePaymentMutation.mutate(payment);
  };

  if (isLoadingPayment) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1 p-4">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <CreditCard className="text-muted-foreground w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div>
                <h1 className="text-md font-semibold text-gray-900">
                  Edit Driver Payment
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Update existing driver payment record
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/paid-driver")}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center p-1 gap-2 text-sm rounded-md px-1 font-medium bg-[var(--team-color)] text-white">
                <CreditCard className="w-4 h-4" />
                Payment Details
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                {/* Payment Date */}
                <div className="space-y-1">
                  <Label
                    htmlFor="driver_payment_date"
                    className="text-xs font-medium"
                  >
                    Payment Date *
                  </Label>
                  <Input
                    id="driver_payment_date"
                    name="driver_payment_date"
                    type="date"
                    max={moment().format("YYYY-MM-DD")}
                    value={payment.driver_payment_date}
                    onChange={onInputChange}
                  />
                </div>

                {/* Driver Full Name */}
                <div className="space-y-1">
                  <Label
                    htmlFor="driver_payment_full_name"
                    className="text-xs font-medium"
                  >
                    Driver Name *
                  </Label>
                  <Select
                    value={payment.driver_payment_full_name}
                    onValueChange={onSelectChange}
                    disabled={isLoadingDrivers}
                  >
                    <SelectTrigger id="driver_payment_full_name">
                      <SelectValue
                        placeholder={
                          isLoadingDrivers
                            ? "Loading drivers..."
                            : "Select Driver"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {driversData?.map((driver, index) => (
                        <SelectItem key={index} value={driver.driver_full_name}>
                          {driver.driver_full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Amount */}
                <div className="space-y-1">
                  <Label
                    htmlFor="driver_payment"
                    className="text-xs font-medium"
                  >
                    Amount *
                  </Label>
                  <Input
                    id="driver_payment"
                    name="driver_payment"
                    type="number"
                    value={payment.driver_payment}
                    onChange={onInputChange}
                    placeholder="Enter Amount"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t font-bold">
              <Button
                type="submit"
                disabled={updatePaymentMutation.isPending || !isFormDirty}
                className="flex items-center gap-2 bg-[var(--team-color)] text-white hover:bg-[var(--team-color)]/90 h-10 px-8 shadow-md"
              >
                {updatePaymentMutation.isPending ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Update Payment
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/paid-driver")}
                className="h-10 px-6"
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

export default EditDriverPayment;
