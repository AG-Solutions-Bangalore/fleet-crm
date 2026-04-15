import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CreateVehicleTravel = ({ refetch }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please upload a file");
      return;
    }

    const token = Cookies.get("token");
    const formData = new FormData();
    formData.append("upload_files", file);

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/vehicle-travel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response?.data?.code === 201 || response?.status === 201) {
        toast.success(
          response.data.message || "Vehicle travel uploaded successfully",
        );
        if (refetch) refetch();
        setFile(null);
        setOpen(false);
      } else {
        toast.error(response?.data?.message || "Failed to upload vehicle travel");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload vehicle travel",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="inline-block">
          <Button variant="default" size="sm">
            Create Vehicle Travel
          </Button>
        </div>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="start" className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Upload Vehicle Travel</h4>
            <p className="text-sm text-muted-foreground">
              Upload the vehicle travel CSV file
            </p>
          </div>

          <div className="grid gap-3">
            {/* File Upload Field */}
            <div className="grid gap-1">
              <label htmlFor="upload_files" className="text-sm font-medium">
                Upload File
              </label>
              <Input
                id="upload_files"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported format: CSV only
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="mt-2"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Vehicle Travel"
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CreateVehicleTravel;
