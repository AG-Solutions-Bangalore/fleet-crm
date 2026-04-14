import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { useState } from "react";
import RedStar from "../RedStar";

const ImageUpload = ({
  id = "image_upload",
  label = "Upload Image",
  required = false,
  selectedFile,
  previewImage,
  onFileChange,
  onRemove,
  accept = "image/*",
  maxSize = 5,
  format = "Any format",
  dimensions = null,
  requiredDimensions = null,
  className = "",
  allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"],
  error,
}) => {
  const [fileerror, setError] = useState("");

  const handleFileValidation = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError("");
      return;
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      const errorMsg = `Invalid file type. Allowed: ${allowedExtensions.join(
        ", ",
      )}`;
      setError(errorMsg);
      e.target.value = "";
      return;
    }

    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      const errorMsg = `File size exceeds ${maxSize}MB limit. Your file is ${fileSizeInMB.toFixed(
        2,
      )}MB`;
      setError(errorMsg);
      e.target.value = "";
      return;
    }

    if (requiredDimensions) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const [reqWidth, reqHeight] = requiredDimensions;
          if (img.width !== reqWidth || img.height !== reqHeight) {
            const errorMsg = `Image dimensions must be exactly ${reqWidth}x${reqHeight} pixels. Your image: ${img.width}x${img.height}px`;
            setError(errorMsg);
            e.target.value = "";
            return;
          }
          setError("");
          onFileChange(e);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      setError("");
      onFileChange(e);
    }
  };

  const handleRemove = () => {
    setError("");
    onRemove();
  };

  const displayDimensions = requiredDimensions
    ? `${requiredDimensions[0]}x${requiredDimensions[1]}px`
    : dimensions || "Any size";

  return (
    <div className={`${className}`}>
      <label className="text-sm font-medium flex" htmlFor={id}>
        {" "}
        {label}
        {required && <RedStar />}
      </label>

      {selectedFile || previewImage ? (
        <div className="relative group rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:border-gray-300 transition-all">
          <div className="w-full h-28 flex items-center justify-center bg-white">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-contain p-1"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {selectedFile && (
            <div className="px-2 py-1.5 bg-gray-100 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-600 font-medium truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <label
          htmlFor={id}
          className="block border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-accent hover:bg-blue-50/50 transition-all"
        >
          <Input
            id={id}
            name={id}
            type="file"
            accept={accept}
            onChange={handleFileValidation}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-1.5">
            <Upload className="h-4 w-4 text-gray-400" />
            <p className="text-xs font-medium text-gray-700">Upload image</p>
            <p className="text-xs text-gray-500">
              {format} • {displayDimensions} • {maxSize}MB
            </p>
          </div>
        </label>
      )}

      {fileerror ? (
        <p className="text-xs text-red-500 font-medium whitespace-pre-line">
          {fileerror}
        </p>
      ) : (
        <p className="text-xs text-red-500 font-medium whitespace-pre-line">
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
