import { useState } from "react";
import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import { GALLERYAPI } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Copy } from "lucide-react";
import GalleryEdit from "./gallery-edit";
import { toast } from "sonner";
import GalleryCreate from "./gallery-create";

const GalleryList = () => {
  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: GALLERYAPI.gallery,
    queryKey: ["gallery"],
  });
  const [open, setOpen] = useState(false);

  const IMAGE_FOR = "Link Gallery";
  const galleryBaseUrl = getImageBaseUrl(data?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(data?.image_url);

  const [copiedId, setCopiedId] = useState(null);

  const handleCopyClipboard = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Link copied");

      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const columns = [
    {
      id: "S. No.",
      header: "S. No.",
      cell: ({ row }) => (
        <div className="text-xs font-medium">{row.index + 1}</div>
      ),
      size: 60,
    },

    {
      header: "Image",
      accessorKey: "gallery_image",
      cell: ({ row }) => {
        const fileName = row.original.gallery_image;

        const src = fileName
          ? `${galleryBaseUrl}${fileName}?t=${Date.now()}`
          : `${noImageUrl}?t=${Date.now()}`;

        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt={`${IMAGE_FOR} Image`}
          />
        );
      },
      enableSorting: false,
      size: 120,
    },

    {
      accessorKey: "gallery_url",
      header: "Gallery Url",
      cell: ({ row }) => {
        const baseUrl = row.original.gallery_url;
        const fileName = row.original.gallery_image;
        const fullUrl = `${baseUrl}${fileName}`;
        const id = row.original.id;

        return (
          <div className="text-xs flex items-center gap-3">
            <span className="truncate"></span>
            <Copy
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCopyClipboard(id, fullUrl);
              }}
              className={`w-4 h-4 cursor-pointer transition-all ${
                copiedId === id ? "text-green-600" : "text-red-600"
              }`}
            />
          </div>
        );
      },
      enableSorting: false,
    },

    {
      header: "Status",
      accessorKey: "gallery_status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.gallery_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.gallery_status}
        </span>
      ),
    },

    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => <GalleryEdit galleryId={row.original.id} />,
      size: 120,
      enableSorting: false,
    },
  ];

  if (isError) {
    return <ApiErrorPage onRetry={refetch} />;
  }
  const handleCreate = () => {
    setOpen(true);
  };
  return (
    <>
      {isLoading && <LoadingBar />}

      <DataTable
        data={data?.data || []}
        columns={columns}
        pageSize={20}
        searchPlaceholder="Search gallery..."
        extraButton={<GalleryCreate />}
      />
    </>
  );
};

export default GalleryList;
