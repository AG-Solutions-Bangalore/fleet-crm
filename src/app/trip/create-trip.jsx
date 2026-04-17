import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BASE_URL from "@/config/base-url";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import Cookies from "js-cookie";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CreateTrip = ({ refetch }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [performanceType, setPerformanceType] = useState("");

  const handleSubmit = async () => {
    if (!file) {
      toast.error("File is required");
      return;
    }
    if (!performanceType) {
      toast.error("Please select performance type");
      return;
    }

    const token = Cookies.get("token");
    const formData = new FormData();
    formData.append("upload_files", file);
    formData.append("trip_performance_type", performanceType);

    try {
      setIsLoading(true);
      const response = await axios.post(`${BASE_URL}/api/trip`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.code === 201) {
        toast.success(
          response.data.message || "Trip file uploaded successfully",
        );
        if (refetch) refetch();
        setFile(null);
        setOpen(false);
      } else {
        toast.error(response?.data?.message || "Failed to upload trip file");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload trip file",
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
            Create Trip
          </Button>
        </div>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        className="w-80 flex flex-col gap-4"
      >
        <div className="grid gap-1">
          <label htmlFor="performance_type" className="text-sm font-medium">
            Performance Type <span className="text-red-500">*</span>
          </label>
          <Select value={performanceType} onValueChange={setPerformanceType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select performance type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Uber Black">Uber Black</SelectItem>
              <SelectItem value="Uber Green">Uber Green</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Upload Trip File</h4>
            <p className="text-sm text-muted-foreground">
              Choose a trip file to upload
            </p>
          </div>
          <div className="grid gap-2">
            <div>
              <Input
                id="upload_files"
                type="file"
                accept=".csv, .xls, .xlsx, .json, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json, text/csv"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Trip File"
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CreateTrip;
