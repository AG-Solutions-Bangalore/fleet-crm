import { GroupButton } from "@/components/group-button";
import ImageUpload from "@/components/image-upload/image-upload";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GALLERYAPI } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const GalleryEdit = ({ galleryId }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    gallery_status: "",
    gallery_image: null,
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({
    gallery_image: "",
  });
  const { trigger: fetchGallery, loading: isFetchingData } = useApiMutation();
  const { trigger: UpdateGallery, loading: isLoading } = useApiMutation();

  const queryClient = useQueryClient();

  const fetchGalleryData = async () => {
    if (!galleryId) return;

    try {
      const res = await fetchGallery({
        url: GALLERYAPI.byId(galleryId),
      });
      const IMAGE_FOR = "Link Gallery";
      const data = res.data;
      const imageBaseUrl = getImageBaseUrl(res?.image_url, IMAGE_FOR);
      const noImageUrl = getNoImageUrl(res?.image_url);
      setFormData({
        gallery_status: data.gallery_status || "Active",
        gallery_image: null,
      });
      const imagepath = data?.gallery_image
        ? `${imageBaseUrl}${data.gallery_image}?t=${Date.now()}`
        : noImageUrl;

      setPreview({
        gallery_image: imagepath,
      });
    } catch (error) {
      toast.error("Failed to fetch gallery data");
    }
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (isOpen && galleryId) {
      fetchGalleryData();
    } else {
      setFormData({
        gallery_status: "",
        gallery_image: "",
      });
    }
  };

  const handleImageChange = (fieldName, file) => {
    if (!file) return;

    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    setPreview((prev) => ({
      ...prev,
      [fieldName]: URL.createObjectURL(file),
    }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleRemoveImage = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    setPreview((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!preview.gallery_image && !formData.gallery_image)
      newErrors.gallery_image = "Image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!galleryId) {
      toast.error("Gallery ID is required");
      return;
    }
    if (!validate()) {
      return;
    }
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("gallery_status", formData.gallery_status);

      if (formData.gallery_image instanceof File) {
        formDataToSend.append("gallery_image", formData.gallery_image);
      }

      const response = await UpdateGallery({
        url: `${GALLERYAPI.updateById(galleryId)}`,
        method: "post",
        data: formDataToSend,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response?.code === 201) {
        toast.success(response.msg || "Gallery Updated Successfully");

        await queryClient.invalidateQueries(["gallery-list"]);
        setPreview({ gallery_image: "" });

        setOpen(false);
      } else {
        toast.error(response.data.message || "Error while updating Gallery");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update Gallery"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-gray-100"
          onClick={() => setOpen(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Gallery</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isFetchingData ? (
            <LoadingBar />
          ) : (
            <>
              <ImageUpload
                id="gallery_image"
                label="Gallery Image"
                required
                selectedFile={formData.gallery_image}
                previewImage={preview.gallery_image}
                onFileChange={(e) =>
                  handleImageChange("gallery_image", e.target.files?.[0])
                }
                onRemove={() => handleRemoveImage("gallery_image")}
                error={errors.gallery_image}
                format="WEBP"
                allowedExtensions={["webp"]}
                maxSize={5}
              />

              <div className="flex items-center h-full ml-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Status *</label>

                  <GroupButton
                    className="w-fit"
                    value={formData.gallery_status}
                    onChange={(value) =>
                      setFormData({ ...formData, gallery_status: value })
                    }
                    options={[
                      { label: "Active", value: "Active" },
                      { label: "Inactive", value: "Inactive" },
                    ]}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter className="mt-6 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.gallery_status}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Gallery"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryEdit;
