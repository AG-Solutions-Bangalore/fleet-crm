import { useApiMutation } from "@/hooks/useApiMutation";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ToggleStatus = ({
  initialStatus,
  apiUrl,
  payloadKey = "status",
  activeValue = "Active",
  inactiveValue = "Inactive",
  method = "PUT",
  onSuccess,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const { trigger, loading } = useApiMutation();
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);
  const handleToggle = async () => {
    const newStatus = status === activeValue ? inactiveValue : activeValue;

    try {
      const res = await trigger({
        url: apiUrl,
        method,
        data: {
          [payloadKey]: newStatus,
        },
      });

      if (res?.code === 200 || res?.code === 201) {
        setStatus(newStatus);
        onSuccess?.();

        toast.success(res.message, {
          description: `Status changed to ${newStatus}`,
        });
      } else {
        toast.error(res?.message || "Unable to update status");
      }
    } catch (err) {
      toast.error(err?.message || "Unable to update status");
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 px-2 py-2 rounded transition-colors
        ${
          status === activeValue
            ? "text-green-800 hover:bg-green-100"
            : "text-red-800 hover:bg-red-100"
        }`}
    >
      <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      <span className="text-sm font-medium">{status}</span>
    </button>
  );
};

export default ToggleStatus;
