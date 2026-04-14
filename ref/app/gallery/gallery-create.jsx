import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, SquarePlus } from "lucide-react";

import ImageUpload from "@/components/image-upload/image-upload";
import { GALLERYAPI } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { toast } from "sonner";

const GalleryCreate = () => {
  const [open, setOpen] = useState(false);

  const [data, setData] = useState({
    gallery_image: null,
  });
  const { trigger: SubmitGallery, loading: isLoading } = useApiMutation();

  const [preview, setPreview] = useState({
    gallery_image: "",
  });

  const [errors, setErrors] = useState({
    gallery_image: "",
  });

  const queryClient = useQueryClient();

  const handleImageChange = (fieldName, file) => {
    if (!file) return;

    setData((prev) => ({ ...prev, [fieldName]: file }));
    setPreview((prev) => ({
      ...prev,
      [fieldName]: URL.createObjectURL(file),
    }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleRemoveImage = (fieldName) => {
    setData((prev) => ({ ...prev, [fieldName]: null }));
    setPreview((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleSubmit = async () => {
    if (!data.gallery_image) {
      setErrors({ gallery_image: "Image is required" });
      toast.error("Image is required");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("gallery_image", data.gallery_image);

    try {
      const response = await SubmitGallery({
        url: GALLERYAPI.gallery,
        method: "post",
        data: formDataToSend,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response?.code === 201) {
        toast.success(response.msg || "Gallery Created Successfully");
        await queryClient.invalidateQueries(["gallery-list"]);
        setOpen(false);

        setData({ gallery_image: null });
        setPreview({ gallery_image: "" });
      } else {
        toast.error(response.data.message || "Failed to create Gallery");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create Gallery");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="default">
          <SquarePlus className="h-4 w-4 mr-2" />
          Gallery
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div>
            <h4 className="font-medium">Create New Gallery</h4>
            <p className="text-sm text-muted-foreground">
              Upload a gallery image
            </p>
          </div>

          <ImageUpload
            id="gallery_image"
            label="Gallery Image"
            required
            selectedFile={data.gallery_image}
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

          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Gallery"
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default GalleryCreate;
