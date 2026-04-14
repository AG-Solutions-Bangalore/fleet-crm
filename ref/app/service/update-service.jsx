import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image, Loader2, Plus, Trash2 } from "lucide-react";
import ImageUpload from "@/components/image-upload/image-upload";
import RedStar from "@/components/RedStar";
import { SERVICE_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getImageBaseUrl } from "@/utils/imageUtils";
import LoadingBar from "@/components/loader/loading-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ServiceSubForm from "./service-sub-form";

const UpdateService = () => {
  const { id } = useParams();
  const { trigger, loading: isSubmitting } = useApiMutation();
  const { trigger: fetchService, loading: isFetching } = useApiMutation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    service_name: "",
    service_url: "",
    service_description: "",
    service_other: "",
    service_status: "Active",
    service_logo: null,
  });

  const [preview, setPreview] = useState({
    service_logo: "",
  });

  const [subs, setSubs] = useState([]);
  const [errors, setErrors] = useState({});
  const [initialState, setInitialState] = useState(null);

  const fetchServiceData = async () => {
    if (!id) return;
    try {
      const res = await fetchService({
        url: SERVICE_API.byId(id),
        method: "get",
      });
      const data = res?.data;
      if (data) {
        setFormData({
          service_name: data.service_name || "",
          service_url: data.service_url || "",
          service_description: data.service_description || "",
          service_other: data.service_other || "",
          service_status: data.service_status || "Active",
          service_logo: null,
        });

        const IMAGE_FOR = "Service";
        const baseUrl = getImageBaseUrl(res?.image_url, IMAGE_FOR);

        if (data.service_logo) {
          setPreview({
            service_logo: `${baseUrl}${data.service_logo}`,
          });
        }

        if (data.subs && Array.isArray(data.subs)) {
          const mappedSubs = data.subs.map((sub) => ({
            id: Number(sub.id),
            service_sub_link: sub.service_sub_link || "",
            service_sub_status: sub.service_sub_status || "Active",
            service_sub_banner: null,
            preview_banner: sub.service_sub_banner
              ? `${baseUrl}${sub.service_sub_banner}`
              : "",
          }));
          setSubs(mappedSubs);
          setInitialState({
            formData: {
              service_name: data.service_name || "",
              service_url: data.service_url || "",
              service_description: data.service_description || "",
              service_other: data.service_other || "",
              service_status: data.service_status || "Active",
            },
            subs: mappedSubs.map((sub) => ({
              id: sub.id,
              service_sub_link: sub.service_sub_link,
              service_sub_status: sub.service_sub_status,
            })),
          });
        }
      }
    } catch (error) {
      toast.error("Failed to fetch service details");
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (fieldName, file) => {
    if (file) {
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
      const url = URL.createObjectURL(file);
      setPreview((prev) => ({ ...prev, [fieldName]: url }));
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleRemoveImage = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    setPreview((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleAddSub = () => {
    setSubs((prev) => [
      ...prev,
      {
        service_sub_link: "",
        service_sub_status: "Active",
        service_sub_banner: null,
        preview_banner: "",
      },
    ]);
  };

  const handleRemoveSub = (index) => {
    if (subs.length <= 1) {
      toast.error("At least one sub-service is required");
      return;
    }
    setSubs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteSubApi = async (index, subId) => {
    if (subs.length <= 1) {
      toast.error("At least one sub-service is required");
      return;
    }

    try {
      const res = await trigger({
        url: SERVICE_API.delete(subId),
        method: "delete",
      });

      if (res?.code === 200 || res?.code === 201 || res?.status === true) {
        toast.success(res?.message || "Sub service deleted successfully");
        fetchServiceData();
        queryClient.invalidateQueries({ queryKey: ["service-list"] });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const handleSubChange = (index, fieldName, value) => {
    setSubs((prev) =>
      prev.map((sub, i) =>
        i === index ? { ...sub, [fieldName]: value } : sub,
      ),
    );
  };

  const handleSubImageChange = (index, file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSubs((prev) =>
        prev.map((sub, i) =>
          i === index
            ? { ...sub, service_sub_banner: file, preview_banner: previewUrl }
            : sub,
        ),
      );
    }
  };

  const handleRemoveSubImage = (index) => {
    setSubs((prev) =>
      prev.map((sub, i) =>
        i === index
          ? { ...sub, service_sub_banner: null, preview_banner: "" }
          : sub,
      ),
    );
  };

  const isDirty = useMemo(() => {
    if (!initialState) return false;

    // Check main form fields
    if (formData.service_name !== initialState.formData.service_name)
      return true;
    if (formData.service_url !== initialState.formData.service_url) return true;
    if (
      formData.service_description !== initialState.formData.service_description
    )
      return true;
    if (formData.service_other !== initialState.formData.service_other)
      return true;
    if (formData.service_status !== initialState.formData.service_status)
      return true;
    if (formData.service_logo instanceof File) return true;

    // Check subs length
    if (subs.length !== initialState.subs.length) return true;

    // Check individual subs
    for (let i = 0; i < subs.length; i++) {
      const sub = subs[i];
      const initialSub = initialState.subs[i];

      if (sub.service_sub_link !== initialSub.service_sub_link) return true;
      if (sub.service_sub_status !== initialSub.service_sub_status) return true;
      if (sub.service_sub_banner instanceof File) return true;
    }

    return false;
  }, [formData, subs, initialState]);

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Service Name
    if (!formData.service_name || !formData.service_name.trim()) {
      newErrors.service_name = "Service Name is required";
      isValid = false;
    }

    // Service Logo (required only if no existing image)
    if (!formData.service_logo && !preview.service_logo) {
      newErrors.service_logo = "Service Logo is required";
      isValid = false;
    }

    const newSubErrors = [];

    subs.forEach((sub, index) => {
      const subError = {};

      // Sub banner validation
      if (!sub.service_sub_banner && !sub.preview_banner) {
        subError.service_sub_banner = "Sub banner is required";
        isValid = false;
      }

      newSubErrors.push(subError);
    });

    setErrors({
      ...newErrors,
      subs: newSubErrors,
    });
    if (!isValid) {
      toast.error("Please fill all required fields");
    }
    return isValid;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataObj = new FormData();

    // 1. Standard Fields
    formDataObj.append("service_name", formData.service_name);
    formDataObj.append("service_url", formData.service_url);
    formDataObj.append("service_status", formData.service_status);

    if (formData.service_description)
      formDataObj.append("service_description", formData.service_description);
    if (formData.service_other)
      formDataObj.append("service_other", formData.service_other);

    // 2. Main Logo
    if (formData.service_logo instanceof File) {
      formDataObj.append("service_logo", formData.service_logo);
    }

    // 3. Append Subs Array
    subs.forEach((sub, index) => {
      if (sub.id) {
        formDataObj.append(`subs[${index}][id]`, sub.id);
      }

      formDataObj.append(
        `subs[${index}][service_sub_link]`,
        sub.service_sub_link || "",
      );
      formDataObj.append(
        `subs[${index}][service_sub_status]`,
        sub.service_sub_status || "Active",
      );
      if (sub.service_sub_banner instanceof File) {
        formDataObj.append(
          `subs[${index}][service_sub_banner]`,
          sub.service_sub_banner,
        );
      }
    });

    try {
      const res = await trigger({
        url: SERVICE_API.updateById(id),
        method: "post",
        data: formDataObj,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.code === 201 || res?.status === true) {
        queryClient.invalidateQueries({ queryKey: ["service-list"] });
        toast.success(res?.message || "Updated successfully");
        navigate(-1);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  const errorBorder = (field) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  if (isFetching) return <LoadingBar />;

  return (
    <div className="max-w-full mx-auto">
      <PageHeader
        icon={Image}
        title="Edit Service"
        description="Update the service details below"
      />

      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="update-service-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex">
                  Service Name <RedStar />
                </Label>
                <Input
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleInputChange}
                  className={errorBorder("service_name")}
                  placeholder="Enter Service Name"
                />
                {errors.service_name && (
                  <p className="text-red-500 text-sm">{errors.service_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex">Service URL</Label>
                <Input
                  name="service_url"
                  value={formData.service_url}
                  onChange={handleInputChange}
                  className={errorBorder("service_url")}
                  placeholder="Enter Service URL"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex">Status</Label>
                <Select
                  value={formData.service_status}
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: "service_status", value },
                    })
                  }
                >
                  <SelectTrigger
                    className={`h-10 w-full ${
                      formData.service_status === "Active"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active" className="text-green-700">
                      Active
                    </SelectItem>
                    <SelectItem value="Inactive" className="text-red-700">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex">Service Other</Label>
                <Textarea
                  name="service_other"
                  value={formData.service_other}
                  onChange={handleInputChange}
                  placeholder="Enter Other details..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex">Service Description</Label>
                <Textarea
                  name="service_description"
                  value={formData.service_description}
                  onChange={handleInputChange}
                  placeholder="Type Your Description Here..."
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <ImageUpload
                  id="service_logo"
                  label="Service Logo *"
                  previewImage={preview.service_logo}
                  onFileChange={(e) =>
                    handleImageChange("service_logo", e.target.files?.[0])
                  }
                  onRemove={() => handleRemoveImage("service_logo")}
                  error={errors.service_logo}
                  format="WEBP"
                  maxSize={5}
                  allowedExtensions={["webp", "png", "jpg", "jpeg"]}
                />
              </div>
            </div>

            <ServiceSubForm
              subs={subs}
              isEdit={true}
              handleAddSub={handleAddSub}
              handleRemoveSub={handleRemoveSub}
              handleSubChange={handleSubChange}
              handleSubImageChange={handleSubImageChange}
              handleRemoveSubImage={handleRemoveSubImage}
              handleDeleteSubApi={handleDeleteSubApi}
              errors={errors}
            />

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Service"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateService;
