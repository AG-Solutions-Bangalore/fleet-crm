import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { Loader2, Plus, Search, X, Check, ChevronsUpDown, Edit } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import BASE_URL from "@/config/base-url";
import { cn } from "@/lib/utils";

const CreateDriverQr = ({ refetch, editData = null }) => {
  const [open, setOpen] = useState(false);
  const isEdit = !!editData;
  const queryClient = useQueryClient();
  const token = Cookies.get("token");

  const [formData, setFormData] = useState({
    merchant_id: "",
    driver_qr_fullname: "",
    driver_qr_UUID: "",
    driver_qr_status: "Active",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        merchant_id: editData.merchant_id || "",
        driver_qr_fullname: editData.driver_qr_fullname || "",
        driver_qr_UUID: editData.driver_qr_UUID || "",
        driver_qr_status: editData.driver_qr_status || "Active",
      });
    } else {
      setFormData({
        merchant_id: "",
        driver_qr_fullname: "",
        driver_qr_UUID: "",
        driver_qr_status: "Active",
      });
    }
  }, [editData, open]);

  // Fetch full names for dropdown
  const { data: drivers = [], isLoading: driversLoading, isError: driversError } = useQuery({
    queryKey: ["pending-driver-qr-fullname"],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/pending-driver-qr-fullname`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle different possible response structures
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: open,
  });

  const filteredDrivers = useMemo(() => {
    if (!searchTerm) return drivers;
    const lowerSearch = searchTerm.toLowerCase();
    return drivers.filter((d) => {
      const name = (d.full_name || d.driver_qr_fullname || d.fullname || "").toLowerCase();
      return name.includes(lowerSearch);
    });
  }, [drivers, searchTerm]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const url = isEdit
        ? `${BASE_URL}/api/driver-qr/${editData.id}`
        : `${BASE_URL}/api/driver-qr`;
      const method = isEdit ? "put" : "post";

      const response = await axios[method](url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.code === 201 || data.code === 200) {
        toast.success(data.message || (isEdit ? "Updated successfully" : "Created successfully"));
        if (refetch) refetch();
        queryClient.invalidateQueries(["assignlist"]);
        queryClient.invalidateQueries(["non-assignlist"]);
        setOpen(false);
      } else {
        toast.error(data.message || "Something went wrong");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Operation failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEdit && !formData.merchant_id) {
      toast.error("Merchant ID is required");
      return;
    }
    mutation.mutate(formData);
  };

  const handleDriverSelect = (driver) => {
    const name = driver.driver_qr_fullname || driver.full_name || driver.fullname;
    const uuid = driver.driver_qr_UUID || driver.UUID || driver.uuid;

    setFormData((prev) => ({
      ...prev,
      driver_qr_fullname: name,
      driver_qr_UUID: uuid,
    }));
    setPopoverOpen(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit QR</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DialogTrigger asChild>
          <Button variant="default" size="sm" className="h-9">
            <Plus className="mr-2 h-4 w-4" /> Create Driver QR
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Driver QR" : "Create Driver QR"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="merchant_id">Merchant ID {!isEdit && <span className="text-red-500">*</span>}</Label>
            <Input
              id="merchant_id"
              value={formData.merchant_id}
              onChange={(e) => setFormData({ ...formData, merchant_id: e.target.value })}
              placeholder="Enter Merchant ID"
              disabled={isEdit}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="driver_qr_fullname">Driver Name</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal h-10 border-muted-foreground/20"
                >
                  <span className="truncate">
                    {formData.driver_qr_fullname || "Select driver..."}
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                          No drivers matching "{searchTerm}"
                        </div>
                      ) : (
                        filteredDrivers.map((driver) => (
                          <button
                            key={driver.UUID || driver.driver_qr_UUID || driver.id}
                            type="button"
                            className={cn(
                              "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left transition-colors",
                              formData.driver_qr_fullname === (driver.full_name || driver.driver_qr_fullname || driver.fullname) && "bg-accent"
                            )}
                            onClick={() => handleDriverSelect(driver)}
                          >
                            <div className="flex flex-col flex-1 truncate">
                              <span className="font-medium">
                                {driver.full_name || driver.driver_qr_fullname || driver.fullname || "Unnamed Driver"}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                UUID: {driver.UUID || driver.driver_qr_UUID || driver.uuid}
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
            {formData.driver_qr_UUID && (
              <p className="text-[11px] text-muted-foreground mt-0.5 ml-1 flex items-center gap-1">
                <span className="font-medium text-blue-600">UUID:</span> {formData.driver_qr_UUID}
              </p>
            )}
          </div>

          {isEdit && (
            <div className="grid gap-2">
              <Label htmlFor="driver_qr_status">Status</Label>
              <Select
                value={formData.driver_qr_status}
                onValueChange={(value) => setFormData({ ...formData, driver_qr_status: value })}
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

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDriverQr;
