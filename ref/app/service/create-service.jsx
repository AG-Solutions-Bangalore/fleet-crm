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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import ServiceSubForm from "./service-sub-form";

const CreateService = () => {
  const { trigger, loading: isSubmitting } = useApiMutation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    service_name: "",
    service_url: "",
    service_description: "",
    service_other: "",
    service_logo: null,
  });

  const [preview, setPreview] = useState({
    service_logo: "",
  });

  const [subs, setSubs] = useState([
    {
      id: "",
      service_sub_banner: null,
      service_sub_link: "",
      preview_banner: "",
    },
  ]);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.service_name || !formData.service_name.trim()) {
      newErrors.service_name = "Service Name is required";
      isValid = false;
    }

    if (!formData.service_logo) {
      newErrors.service_logo = "Service Logo is required";
      isValid = false;
    }

    const newSubErrors = [];

    subs.forEach((sub) => {
      const subError = {};

      if (!sub.service_sub_banner) {
        subError.service_sub_banner = "Sub banner is required";
        isValid = false;
      }

      newSubErrors.push(subError);
    });

    setErrors({
      ...newErrors,
      subs: newSubErrors,
    });

    // 🔴 Show toast if validation fails
    if (!isValid) {
      toast.error("Please fill all required fields");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataObj = new FormData();
    formDataObj.append("service_name", formData.service_name);
    if (formData.service_url)
      formDataObj.append("service_url", formData.service_url);
    if (formData.service_description)
      formDataObj.append("service_description", formData.service_description);
    if (formData.service_other)
      formDataObj.append("service_other", formData.service_other);

    if (formData.service_logo instanceof File) {
      formDataObj.append("service_logo", formData.service_logo);
    }

    // Append Subs
    subs.forEach((sub, index) => {
      formDataObj.append(
        `subs[${index}][service_sub_link]`,
        sub.service_sub_link,
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
        url: SERVICE_API.create,
        method: "post",
        data: formDataObj,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.code === 200 || res?.code === 201 || res?.status === true) {
        queryClient.invalidateQueries({ queryKey: ["service-list"] });
        toast.success(
          res?.msg || res?.message || "Service created successfully",
        );
        navigate(-1);
      } else {
        toast.error(res?.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const errorBorder = (field) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  return (
    <div className="max-w-full mx-auto">
      <PageHeader
        icon={Image}
        title="Add New Service"
        description="Fill in the service details below"
      />

      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="create-service-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label className="flex">Service Other</Label>
                <Textarea
                  name="service_other"
                  value={formData.service_other}
                  onChange={handleInputChange}
                  placeholder="Enter Other details"
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

              <div className="space-y-2">
                <ImageUpload
                  id="service_logo"
                  label="Service Logo"
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
              isEdit={false}
              handleAddSub={handleAddSub}
              handleRemoveSub={handleRemoveSub}
              handleSubChange={handleSubChange}
              handleSubImageChange={handleSubImageChange}
              handleRemoveSubImage={handleRemoveSubImage}
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Service"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateService;
