import { useApiMutation } from "@/hooks/useApiMutation";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ToggleAction = ({
  initialStatus,
  apiUrl,
  payloadKey = "services_request_status",
  method = "patch",
  onSuccess,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const { trigger, loading } = useApiMutation();

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleToggle = async (action) => {
    const formData = new FormData();
    formData.append(payloadKey, action);

    try {
      const res = await trigger({
        url: apiUrl,
        method,
        data: formData,
        // headers: {
        //   "Content-Type": "multipart/form-data",
        // },
      });

      if (res?.code === 200 || res?.code === 201) {
        setStatus(action);
        onSuccess?.();

        toast.success(res.message, {
          description: `Status changed to ${action}`,
        });
      } else {
        toast.error(res?.message || "Unable to update status");
      }
    } catch (err) {
      toast.error(err?.message || "Unable to update status");
    }
  };

  const statusStyle =
    status === "Approved"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "Cancel"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-yellow-100 text-yellow-700 border-yellow-200";

  return (
    <div className={`flex items-center gap-2`}>
      {loading && <RefreshCcw className="h-4 w-4 animate-spin text-blue-500" />}

      <Select
        // value={status}
        onValueChange={(value) => handleToggle(value)}
        disabled={loading}
      >
        {status === "Pending" ? (
          <SelectTrigger
            className={`h-8 w-[150px] text-sm rounded-xl border hover:scale-[1.04] transition-all duration-200 ${statusStyle}`}
          >
            <SelectValue placeholder={status} />
          </SelectTrigger>
        ) : (
          <div
            className={`h-8 w-[150px] text-sm rounded-xl border flex px-3 justify-start items-center ${statusStyle}`}
          >
            {status}
          </div>
        )}

        <SelectContent>
          <SelectItem value="Approved" className="text-green-700">
            Approved
          </SelectItem>

          <SelectItem value="Cancel" className="text-red-700">
            Cancel
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ToggleAction;
