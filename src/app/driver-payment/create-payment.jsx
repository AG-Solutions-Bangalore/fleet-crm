import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowLeft, CreditCard, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import moment from "moment";

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

const CreateDriverPayment = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = Cookies.get("token");

  const [paymentForm, setPaymentForm] = useState({
    driver_payment_date: moment().format("YYYY-MM-DD"),
    subs: [{ driver_payment_full_name: "", driver_payment: "" }],
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

  const onDateChange = (e) => {
    setPaymentForm((prev) => ({
      ...prev,
      driver_payment_date: e.target.value,
    }));
  };

  const addRow = () => {
    setPaymentForm((prev) => ({
      ...prev,
      subs: [
        ...prev.subs,
        { driver_payment_full_name: "", driver_payment: "" },
      ],
    }));
  };

  const removeRow = (index) => {
    if (paymentForm.subs.length === 1) {
      toast.error("At least one payment entry is required");
      return;
    }
    setPaymentForm((prev) => ({
      ...prev,
      subs: prev.subs.filter((_, i) => i !== index),
    }));
  };

  const updateSubField = (index, field, value) => {
    const updatedSubs = [...paymentForm.subs];
    updatedSubs[index] = {
      ...updatedSubs[index],
      [field]: value,
    };
    setPaymentForm((prev) => ({
      ...prev,
      subs: updatedSubs,
    }));
  };

  const validateForm = () => {
    if (!paymentForm.driver_payment_date) {
      toast.error("Payment Date is required");
      return false;
    }
    for (let i = 0; i < paymentForm.subs.length; i++) {
      const sub = paymentForm.subs[i];
      if (!sub.driver_payment_full_name) {
        toast.error(`Please select a driver for entry #${i + 1}`);
        return false;
      }
      if (!sub.driver_payment) {
        toast.error(`Please enter an amount for entry #${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const createPaymentMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        `${BASE_URL}/api/driver-payment`,
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
        await queryClient.invalidateQueries({ queryKey: ["driverPayments"] });
        toast.success(data.message || "Payments Created Successfully");
        navigate("/paid-driver", { replace: true });
      } else {
        toast.error(data.message || "Payment Creation Error");
      }
    },
    onError: (error) => {
      console.error("Payment Creation Error:", error.response?.data?.message);
      toast.error(error.response?.data?.message || "Payment Creation Error");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    createPaymentMutation.mutate(paymentForm);
  };

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
                  Add Driver Payment
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Create multiple driver payment records for a selected date
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="driver_payment_date"
                  className="text-xs font-medium"
                >
                  Payment Date *
                </Label>
                <Input
                  id="driver_payment_date"
                  type="date"
                  max={moment().format("YYYY-MM-DD")}
                  value={paymentForm.driver_payment_date}
                  onChange={onDateChange}
                  className="h-10"
                />
              </div>

              {/* Subs Section */}
              <div className="space-y-4 col-span-3">
                <div className="flex items-center justify-between p-1 bg-gray-100 rounded-md px-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CreditCard className="w-4 h-4" />
                    Payment Entries
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRow}
                    className="h-8 text-xs bg-white"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Row
                  </Button>
                </div>

                <div className="space-y-3">
                  {paymentForm.subs.map((sub, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row gap-4 items-end bg-white border rounded-lg p-3 shadow-sm relative group"
                    >
                      <div className="absolute -left-2 -top-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold border border-gray-200">
                        {index + 1}
                      </div>

                      {/* Driver Select */}
                      <div className="flex-1 space-y-1.5 w-full">
                        <Label className="text-[11px] font-medium text-gray-500">
                          Select Driver *
                        </Label>
                        <Select
                          value={sub.driver_payment_full_name}
                          onValueChange={(value) =>
                            updateSubField(
                              index,
                              "driver_payment_full_name",
                              value,
                            )
                          }
                          disabled={isLoadingDrivers}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue
                              placeholder={
                                isLoadingDrivers
                                  ? "Loading drivers..."
                                  : "Select Driver"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {driversData?.map((driver, idx) => (
                              <SelectItem
                                key={idx}
                                value={driver.driver_full_name}
                              >
                                {driver.driver_full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Amount Input */}
                      <div className="w-full md:w-48 space-y-1.5">
                        <Label className="text-[11px] font-medium text-gray-500">
                          Amount *
                        </Label>
                        <Input
                          type="number"
                          value={sub.driver_payment}
                          onChange={(e) =>
                            updateSubField(
                              index,
                              "driver_payment",
                              e.target.value,
                            )
                          }
                          placeholder="0.00"
                          className="h-9"
                        />
                      </div>

                      {/* Action */}
                      <div className="flex-shrink-0 pb-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(index)}
                          className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={paymentForm.subs.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t font-bold mt-10">
              <Button
                type="submit"
                disabled={createPaymentMutation.isPending}
                className="flex items-center gap-2 bg-[var(--team-color)] text-white hover:bg-[var(--team-color)]/90 h-10 px-8 shadow-md"
              >
                {createPaymentMutation.isPending ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Submit Payments
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

export default CreateDriverPayment;
