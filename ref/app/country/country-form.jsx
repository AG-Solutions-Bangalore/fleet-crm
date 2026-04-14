import { GroupButton } from "@/components/group-button";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { COUNTRY_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/use-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const initialState = {
  country_name: "",
  country_latitude: "",
  country_longitude: "",
  country_city: "",
  country_status: "Active",
};

const CountryForm = ({ isOpen, onClose, countryId }) => {
  const isEditMode = Boolean(countryId);
  const [data, setData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const { trigger: fetchCountry, loading } = useApiMutation();
  const { trigger: submitCountry, loading: submitLoading } = useApiMutation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOpen) return;

    if (!isEditMode) {
      setData(initialState);
      setErrors({});
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetchCountry({
          url: COUNTRY_API.byId(countryId),
        });

        setData({
          country_name: res.data.country_name || "",
          country_latitude: res.data.country_latitude || "",
          country_longitude: res.data.country_longitude || "",
          country_city: res.data.country_city || "",
          country_status: res.data.country_status || "Active",
        });
      } catch (err) {
        toast.error("Failed to load country data");
      }
    };

    fetchData();
  }, [isOpen, countryId]);

  const validate = () => {
    const newErrors = {};

    if (!data.country_name.trim()) newErrors.country_name = "Required";
    if (!data.country_latitude) newErrors.country_latitude = "Required";
    if (!data.country_longitude) newErrors.country_longitude = "Required";
    if (!data.country_city) newErrors.country_city = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    const formData = new FormData();
    formData.append("country_name", data.country_name);
    formData.append("country_latitude", data.country_latitude);
    formData.append("country_longitude", data.country_longitude);
    formData.append("country_city", data.country_city);
    formData.append("country_status", data.country_status);

    try {
      const res = await submitCountry({
        url: isEditMode ? `${COUNTRY_API.byId(countryId)}` : COUNTRY_API.list,
        method: isEditMode ? "put" : "post",
        data: formData,
      });

      if (
        (isEditMode && res?.code === 200) ||
        (!isEditMode && res?.code === 201)
      ) {
        toast.success(res?.msg || "Saved successfully");
        onClose();

        queryClient.invalidateQueries({ queryKey: ["countrylist"] });
        queryClient.invalidateQueries({ queryKey: ["countries-dropdown"] });
      } else {
        toast.error(res?.msg || "Failed to update country");
      }
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Country" : "Create Country"}
          </DialogTitle>
        </DialogHeader>

        {loading && <LoadingBar />}

        <div className="space-y-2">
          <label className="text-sm font-medium">Country Name *</label>

          <Input
            placeholder="Country name"
            value={data.country_name}
            onChange={(e) => setData({ ...data, country_name: e.target.value })}
          />
          {errors.country_name && (
            <p className="text-xs text-red-500">{errors.country_name}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">City *</label>

          <Input
            placeholder="City"
            value={data.country_city}
            onChange={(e) => setData({ ...data, country_city: e.target.value })}
          />
          {errors.country_city && (
            <p className="text-xs text-red-500">{errors.country_city}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium">Latitude *</label>
            <Input
              placeholder="Latitude"
              value={data.country_latitude}
              onChange={(e) =>
                setData({ ...data, country_latitude: e.target.value })
              }
            />
            {errors.country_latitude && (
              <p className="text-xs text-red-500">{errors.country_latitude}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Longitude *</label>

            <Input
              placeholder="Longitude"
              value={data.country_longitude}
              onChange={(e) =>
                setData({ ...data, country_longitude: e.target.value })
              }
            />
            {errors.country_longitude && (
              <p className="text-xs text-red-500">{errors.country_longitude}</p>
            )}
          </div>
        </div>

        {isEditMode && (
          <>
            <label className="text-sm font-medium">Status *</label>

            <GroupButton
              className="w-fit"
              value={data.country_status}
              onChange={(value) => setData({ ...data, country_status: value })}
              options={[
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
            />
          </>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitLoading}>
            {isEditMode ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CountryForm;
