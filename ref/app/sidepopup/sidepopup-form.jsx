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
import { Textarea } from "@/components/ui/textarea";
import { COUNTRY_API, SIDE_POPUP_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/use-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const initialState = {
  side_popup_heading: "",
  side_popup_description: "",
  side_popup_link: "",
  side_popup_status: "Active",
};

const SidePopUpForm = ({ isOpen, onClose, popupId }) => {
  const isEditMode = Boolean(popupId);
  const [data, setData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const { trigger: fetchSidePopUp, loading } = useApiMutation();
  const { trigger: submitSidePopUp, loading: submitLoading } = useApiMutation();
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
        const res = await fetchSidePopUp({
          url: SIDE_POPUP_API.byId(popupId),
        });

        setData({
          side_popup_heading: res.data.side_popup_heading || "",
          side_popup_description: res.data.side_popup_description || "",
          side_popup_link: res.data.side_popup_link || "",
          side_popup_status: res.data.side_popup_status || "Active",
        });
      } catch (err) {
        toast.error("Failed to load sidepopup data");
      }
    };

    fetchData();
  }, [isOpen, popupId]);

  const validate = () => {
    const newErrors = {};

    if (!data.side_popup_heading.trim())
      newErrors.side_popup_heading = "Heading is Required";
    if (!data.side_popup_description)
      newErrors.side_popup_description = "Description is Required";
    if (!data.side_popup_link) newErrors.side_popup_link = "Link is Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    const formData = new FormData();
    formData.append("side_popup_heading", data.side_popup_heading);
    formData.append("side_popup_description", data.side_popup_description);
    formData.append("side_popup_link", data.side_popup_link);
    formData.append("side_popup_status", data.side_popup_status);

    try {
      const res = await submitSidePopUp({
        url: isEditMode
          ? `${SIDE_POPUP_API.byId(popupId)}`
          : SIDE_POPUP_API.list,
        method: isEditMode ? "put" : "post",
        data: formData,
      });

      if (res?.code === 201) {
        toast.success(res?.msg || "Saved successfully");
        onClose();

        queryClient.invalidateQueries({ queryKey: ["sidepopups"] });
      } else {
        toast.error(res?.msg || "Failed to update sidepopup");
      }
    } catch (err) {
      toast.error(err.message || "Operation failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit  Side PopUp" : "Create Side PopUp"}
          </DialogTitle>
        </DialogHeader>

        {loading && <LoadingBar />}

        <div className="space-y-2">
          <label className="text-sm font-medium">Heading *</label>

          <Input
            placeholder="Heading"
            value={data.side_popup_heading}
            onChange={(e) =>
              setData({ ...data, side_popup_heading: e.target.value })
            }
          />
          {errors.side_popup_heading && (
            <p className="text-xs text-red-500">{errors.side_popup_heading}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Description *</label>
          <Textarea
            placeholder="Enter a Description"
            value={data.side_popup_description}
            onChange={(e) =>
              setData({ ...data, side_popup_description: e.target.value })
            }
          />
          {errors.side_popup_description && (
            <p className="text-xs text-red-500">
              {errors.side_popup_description}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Link *</label>

          <Input
            placeholder="Enter a Link"
            value={data.side_popup_link}
            onChange={(e) =>
              setData({ ...data, side_popup_link: e.target.value })
            }
          />
          {errors.side_popup_link && (
            <p className="text-xs text-red-500">{errors.side_popup_link}</p>
          )}
        </div>

        {isEditMode && (
          <>
            <label className="text-sm font-medium">Status *</label>

            <GroupButton
              className="w-fit"
              value={data.side_popup_status}
              onChange={(value) =>
                setData({ ...data, side_popup_status: value })
              }
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
            {submitLoading && <Loader2 className="animate-spin" />}
            {isEditMode ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SidePopUpForm;
