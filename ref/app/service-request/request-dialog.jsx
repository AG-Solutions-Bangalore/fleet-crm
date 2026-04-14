import { GroupButton } from "@/components/group-button";
import ImageUpload from "@/components/image-upload/image-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REQUEST_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const RequestDialog = ({ open, onClose, Id }) => {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState([]);
  const { trigger: fetchCompany } = useApiMutation();
  const { trigger, loading } = useApiMutation();

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const res = await fetchCompany({
          url: REQUEST_API.byId(Id),
        });
        const data = res.data;
        setFormData({
          services_request_status: data.services_request_status,
        });
      } catch (err) {
        toast.error(err.message || "Failed to load status");
      }
    };
    fetchData();
  }, [open, Id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async () => {
    const formDataObj = new FormData();
    formDataObj.append(
      "services_request_status",
      formData.services_request_status,
    );

    try {
      const res = await trigger({
        url: REQUEST_API.updateById(Id),
        method: "patch",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 200 || res?.code === 201) {
        toast.success(res.msg);
        queryClient.invalidateQueries(["request-list"]);
        onClose();
      } else {
        toast.error(res?.msg || "Failed");
      }
    } catch (error) {
      const errors = error?.response?.data?.msg;
      toast.error(errors || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Update</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1  gap-4">
          <div>
            <Label>Notification Heading *</Label>
            <Input
              name="notification_heading"
              value={formData.notification_heading}
              onChange={handleChange}
            />
            <div className="flex justify-between">
              {errors.notification_heading && (
                <p className="text-sm text-red-500">
                  {errors.notification_heading}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Notification Date*</Label>
            <Input
              type="date"
              name="notification_date"
              value={formData.notification_date}
              onChange={handleChange}
            />
            <div className="flex justify-between">
              {errors.notification_date && (
                <p className="text-sm text-red-500">
                  {errors.notification_date}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <Label>Status</Label>
            <GroupButton
              value={formData.services_request_status}
              onChange={(v) =>
                setFormData((p) => ({
                  ...p,
                }))
              }
              options={[
                { label: "Pending", value: "Pending" },
                { label: "Cancel", value: "Cancel" },
                { label: "Approved", value: "Approved" },
              ]}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDialog;
