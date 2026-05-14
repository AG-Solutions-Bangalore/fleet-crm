import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowLeft, CreditCard, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const queryClient = useQueryClient();
  const token = Cookies.get("token");
  const prefilledPaymentData = location.state?.paymentData;

  const [paymentForm, setPaymentForm] = useState({
    driver_payment_date:
      prefilledPaymentData?.driver_payment_date ||
      moment().format("YYYY-MM-DD"),
    subs:
      prefilledPaymentData?.subs?.length > 0
        ? prefilledPaymentData.subs
        : [{ driver_payment_full_name: "", driver_payment: "" }],
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

  const driverOptions = useMemo(() => {
    const optionMap = new Map();

    driversData?.forEach((driver) => {
      if (driver.driver_full_name) {
        optionMap.set(driver.driver_full_name, driver);
      }
    });

    paymentForm.subs.forEach((sub) => {
      if (
        sub.driver_payment_full_name &&
        !optionMap.has(sub.driver_payment_full_name)
      ) {
        optionMap.set(sub.driver_payment_full_name, {
          driver_full_name: sub.driver_payment_full_name,
        });
      }
    });

    return Array.from(optionMap.values());
  }, [driversData, paymentForm.subs]);

  const paymentColumns = useMemo(() => {
    const entries = paymentForm.subs.map((sub, index) => ({ sub, index }));
    const splitIndex = Math.ceil(entries.length / 2);
    return [entries.slice(0, splitIndex), entries.slice(splitIndex)].filter(
      (column) => column.length > 0,
    );
  }, [paymentForm.subs]);

  const getAmountDisplayValue = (sub) => {
    if (!sub.isPrefilled || sub.driver_payment === "") {
      return sub.driver_payment;
    }
    return Math.abs(Number(sub.driver_payment || 0));
  };

  const updateAmount = (index, value, isPrefilled) => {
    if (!isPrefilled) {
      updateSubField(index, "driver_payment", value);
      return;
    }

    updateSubField(
      index,
      "driver_payment",
      value === "" ? "" : String(-Math.abs(Number(value))),
    );
  };

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
        {
          driver_payment_full_name: "",
          driver_payment: "",
          isPrefilled: false,
        },
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

    createPaymentMutation.mutate({
      driver_payment_date: paymentForm.driver_payment_date,
      subs: paymentForm.subs.map(
        ({ driver_payment_full_name, driver_payment }) => ({
          driver_payment_full_name,
          driver_payment,
        }),
      ),
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/paid-driver")}
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-gray-100/50 rounded-full transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Add Driver Payment
            </h1>
          </div>
          <p className="text-sm text-muted-foreground sm:pl-12">
            Create multiple driver payment records for a selected date
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Top Controls Card */}
        <Card className="border-border/50 shadow-none overflow-hidden bg-gradient-to-br from-green-50 to-blue-100">
          <CardContent className="p-3 sm:p-5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
              <div className="w-full md:w-72 space-y-1 sm:space-y-2">
                <Label
                  htmlFor="driver_payment_date"
                  className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  Payment Date
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="driver_payment_date"
                    type="date"
                    max={moment().format("YYYY-MM-DD")}
                    value={paymentForm.driver_payment_date}
                    onChange={onDateChange}
                    className="h-10 sm:h-11 px-3 sm:px-4 text-xs sm:text-sm bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[var(--team-color)]/20 transition-all rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                <div className="flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-10 sm:h-11 bg-blue-50 text-blue-700 rounded-lg text-[11px] sm:text-sm font-medium border border-blue-100">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">{paymentForm.subs.length} Entries</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRow}
                  className="flex-1 md:flex-none h-10 sm:h-11 px-2 sm:px-5 text-[11px] sm:text-sm shadow-none border-gray-300 transition-all rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="whitespace-nowrap">Add New Row</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entries Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {paymentColumns.map((column, columnIndex) => (
            <Card key={columnIndex} className="border-border/50 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-gray-50/80 px-2 sm:px-4 py-3 border-b border-gray-100 grid grid-cols-[28px_minmax(0,1fr)_90px_36px] sm:grid-cols-[40px_minmax(0,1fr)_140px_48px] gap-2 sm:gap-4 items-center">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">No</span>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver Details</span>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</span>
                <span></span>
              </div>
              <div className="divide-y divide-gray-100 flex-1">
                {column.map(({ sub, index }) => (
                  <div
                    key={index}
                    className="grid grid-cols-[28px_minmax(0,1fr)_90px_36px] sm:grid-cols-[40px_minmax(0,1fr)_140px_48px] items-center gap-2 sm:gap-4 p-2 sm:p-3 hover:bg-gray-50/50 transition-colors group"
                  >
                    <div className="flex items-center justify-center">
                      <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100/80 text-[10px] sm:text-xs font-semibold text-gray-600 group-hover:bg-[var(--team-color)]/10 group-hover:text-[var(--team-color)] transition-colors">
                        {index + 1}
                      </span>
                    </div>

                    <div className="relative min-w-0">
                      {sub.isPrefilled ? (
                        <Input
                          value={sub.driver_payment_full_name}
                          onChange={(e) => updateSubField(index, "driver_payment_full_name", e.target.value)}
                          className="h-9 sm:h-10 bg-gray-50/50 text-xs sm:text-sm font-medium focus:bg-white transition-colors px-2 sm:px-3"
                        />
                      ) : (
                        <Select
                          value={sub.driver_payment_full_name}
                          onValueChange={(value) => updateSubField(index, "driver_payment_full_name", value)}
                          disabled={isLoadingDrivers}
                        >
                          <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm font-medium bg-white border-gray-200 focus:ring-[var(--team-color)]/20 transition-all px-2 sm:px-3 w-full">
                            <SelectValue placeholder={isLoadingDrivers ? "Loading drivers..." : "Select Driver"} />
                          </SelectTrigger>
                          <SelectContent>
                            {driverOptions.map((driver, idx) => (
                              <SelectItem key={idx} value={driver.driver_full_name}>
                                {driver.driver_full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="relative min-w-0">
                      <Input
                        type="number"
                        value={getAmountDisplayValue(sub)}
                        onChange={(e) => updateAmount(index, e.target.value, sub.isPrefilled)}
                        placeholder="0.00"
                        className="h-9 sm:h-10 text-right text-xs sm:text-sm font-semibold text-gray-900 bg-white border-gray-200 focus:ring-[var(--team-color)]/20 transition-all px-2 sm:px-3"
                      />
                    </div>

                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(index)}
                        disabled={paymentForm.subs.length === 1}
                        className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all flex-shrink-0 ${
                          paymentForm.subs.length === 1
                            ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400"
                            : "text-gray-400 hover:text-red-600 hover:bg-red-50 group-hover:text-red-500 bg-white shadow-sm border border-gray-100 hover:border-red-100"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/paid-driver")}
            className="h-11 px-6 font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createPaymentMutation.isPending}
            className="h-11 px-8 bg-[var(--team-color)] hover:bg-[var(--team-color)]/90 text-white shadow-lg shadow-[var(--team-color)]/20 font-medium flex items-center gap-2 transition-all active:scale-[0.98] rounded-lg"
          >
            {createPaymentMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Submit Payments
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateDriverPayment;
