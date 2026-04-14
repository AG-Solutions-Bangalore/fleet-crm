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
import { NOTIFICATION_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { getImageBaseUrl } from "@/utils/imageUtils";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
const initialState = {
  notification_heading: "",
  notification_date: "",
  notification_status: "Active",
  notification_image: null,
};
const NotificationDialog = ({ open, onClose, Id }) => {
  const isEdit = Boolean(Id);
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialState);
  const { trigger: fetchCompany } = useApiMutation();
  const { trigger, loading } = useApiMutation();

  const [preview, setPreview] = useState({
    notification_image: "",
  });

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      setFormData(initialState);
      setErrors({});
      return;
    }
    const fetchData = async () => {
      try {
        const res = await fetchCompany({
          url: NOTIFICATION_API.byId(Id),
        });
        const data = res.data;
        setFormData({
          notification_heading: data.notification_heading,
          notification_date: data.notification_date,
          notification_status: data.notification_status,
          notification_image: null,
        });
        const IMAGE_FOR = "Notification";
        const baseUrl = getImageBaseUrl(res?.image_url, IMAGE_FOR);

        setPreview({
          notification_image: `${baseUrl}${data.notification_image}`,
        });
      } catch (err) {
        toast.error(err.message || "Failed to load Notification data");
      }
    };
    fetchData();
  }, [open, Id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const err = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = formData.notification_date
      ? new Date(formData.notification_date)
      : null;

    if (!formData.notification_heading) err.notification_heading = "Required";
    if (!formData.notification_date) {
      err.notification_date = "Required";
    } else if (selectedDate && selectedDate < today) {
      err.notification_date = "Date cannot be in the past";
    }
    if (!preview.notification_image) err.notification_image = "Required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const formDataObj = new FormData();

    formDataObj.append("notification_heading", formData.notification_heading);
    formDataObj.append("notification_date", formData.notification_date);
    formDataObj.append("notification_status", formData.notification_status);

    if (formData.notification_image instanceof File) {
      formDataObj.append("notification_image", formData.notification_image);
    }
    try {
      const res = await trigger({
        url: isEdit ? NOTIFICATION_API.updateById(Id) : NOTIFICATION_API.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 200 || res?.code === 201) {
        toast.success(res.message);
        queryClient.invalidateQueries(["notification-list"]);
        queryClient.invalidateQueries(["notification-dropdown"]);
        onClose();
      } else {
        toast.error(res?.message || "Failed");
      }
    } catch (error) {
      const errors = error?.response?.data?.message;
      toast.error(errors || "Something went wrong");
    }
  };
  const handleImageChange = (fieldName, file) => {
    if (file) {
      setFormData({ ...formData, [fieldName]: file });
      const url = URL.createObjectURL(file);
      setPreview({ ...preview, [fieldName]: url });
      setErrors({ ...errors, [fieldName]: "" });
    }
  };

  const handleRemoveImage = (fieldName) => {
    setFormData({ ...formData, [fieldName]: null });
    setPreview({ ...preview, [fieldName]: "" });
  };

  const todayStr = new Date().toLocaleDateString("en-CA");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Notification" : "Create Notification"}
          </DialogTitle>
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
              min={todayStr}
            />
            <div className="flex justify-between">
              {errors.notification_date && (
                <p className="text-sm text-red-500">
                  {errors.notification_date}
                </p>
              )}
            </div>
          </div>

          <div>
            <ImageUpload
              id="notification_image"
              label="Notification Image"
              previewImage={preview.notification_image}
              onFileChange={(e) =>
                handleImageChange("notification_image", e.target.files?.[0])
              }
              onRemove={() => handleRemoveImage("notification_image")}
              error={errors.notification_image}
              format="WEBP"
              maxSize={5}
              allowedExtensions={["webp"]}
              // requiredDimensions={[150, 150]}
            />
          </div>
          {isEdit && (
            <div className="flex flex-col">
              <Label>Status</Label>
              <GroupButton
                value={formData.notification_status}
                onChange={(v) =>
                  setFormData((p) => ({
                    ...p,
                    notification_status: v,
                  }))
                }
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;
