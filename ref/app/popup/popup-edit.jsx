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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { POPUP_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/use-mutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
const IMAGE_FOR = "Popup";
const PopupEdit = ({ isOpen, onClose, popupId, refetch }) => {
  const [data, setData] = useState({
    heading: "",
    alt: "",
    required: "Yes",
    popup_image: null,
  });

  const [preview, setPreview] = useState({
    popup_image: "",
  });
  const [errors, setErrors] = useState({});
  const resetState = () => {
    setErrors({});
    setPreview({ popup_image: "" });
    setData({
      heading: "",
      alt: "",
      required: "Yes",
      popup_image: null,
    });
  };

  const { trigger: fetchPopup, loading } = useApiMutation();
  const { trigger: SubmitPopup, loading: submitloading } = useApiMutation();

  useEffect(() => {
    if (!isOpen || !popupId) return;

    const fetchData = async () => {
      try {
        const res = await fetchPopup({ url: POPUP_API.byId(popupId) });
        const popup = res.data;
        const imageBaseUrl = getImageBaseUrl(res?.image_url, IMAGE_FOR);

        const noImageUrl = getNoImageUrl(res?.image_url);
        setData({
          heading: popup?.popup_heading || "",
          alt: popup?.popup_image_alt || "",
          required: popup?.popup_required || "Yes",
          popup_image: null,
        });
        const imagepath = res?.data?.popup_image
          ? `${imageBaseUrl}${res?.data?.popup_image}`
          : noImageUrl;
        console.log(imagepath, "imagepath");
        setPreview({
          popup_image: imagepath,
        });
      } catch (err) {
        toast.error(err.message || "Failed to load data");
      }
    };

    fetchData();
  }, [isOpen, popupId]);

  const validate = () => {
    const newErrors = {};
    if (!data.alt.trim()) newErrors.alt = "Required";
    if (!preview.popup_image && !data.popup_image)
      newErrors.popup_image = "Image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      const formData = new FormData();

      formData.append("popup_heading", data.heading);
      formData.append("popup_image_alt", data.alt);
      formData.append("popup_required", data.required);

      if (data.popup_image instanceof File) {
        formData.append("popup_image", data.popup_image);
      }

      const res = await SubmitPopup({
        url: `${POPUP_API.updateById(popupId)}`,
        method: "post",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code == 200) {
        toast.success(res?.msg || "Popup updated successfully ");
        onClose();
        refetch();
      } else {
        toast.error(res?.msg || "Failed to update popup");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong. Please try again.");
    }
  };
  const handleImageChange = (fieldName, file) => {
    if (file) {
      setData({ ...data, [fieldName]: file });
      const url = URL.createObjectURL(file);
      setPreview({ ...preview, [fieldName]: url });
      setErrors({ ...errors, [fieldName]: "" });
    }
  };

  const handleRemoveImage = (fieldName) => {
    setData({ ...data, [fieldName]: null });
    setPreview({ ...preview, [fieldName]: "" });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetState();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Popup</DialogTitle>
        </DialogHeader>

        {loading && <LoadingBar />}
        <div className="space-y-4">
          <div>
            <ImageUpload
              id="popup_image"
              label="PopUp Image"
              required
              selectedFile={data.popup_image}
              previewImage={preview.popup_image}
              onFileChange={(e) =>
                handleImageChange("popup_image", e.target.files?.[0])
              }
              onRemove={() => handleRemoveImage("popup_image")}
              error={errors.popup_image}
              format="WEBP"
              allowedExtensions={["webp"]}
              dimensions="600x350"
              maxSize={5}
              requiredDimensions={[600, 350]}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Alt Text *</label>
            <Textarea
              value={data.alt}
              onChange={(e) => setData({ ...data, alt: e.target.value })}
              className="mt-1 text-sm h-16"
              placeholder="Image description"
            />
            {errors.alt && (
              <p className="text-red-500 text-xs mt-1">{errors.alt}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Heading </label>
            <Textarea
              value={data.heading}
              onChange={(e) => setData({ ...data, heading: e.target.value })}
              className="mt-1 text-sm h-16"
              placeholder="Popup heading"
            />
        
          </div>

          <div>
            <label className="text-sm font-medium mr-3">Required *</label>

            <GroupButton
              value={data.required}
              onChange={(value) => setData({ ...data, required: value })}
              options={[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ]}
            />
          </div>
        </div>

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={submitloading}
            loading={submitloading}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PopupEdit;
