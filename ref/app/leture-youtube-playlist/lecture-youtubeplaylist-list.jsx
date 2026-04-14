import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LETUREYOUTUBEPLAYLIST_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Edit } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LectureYoutubePlaylistDialog from "./lecture-youtubeplaylist-form";

const LetureYoutubePlayList = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: LETUREYOUTUBEPLAYLIST_API.list,
    queryKey: ["lecture-youtube-playlist-list"],
  });

  const columns = [
    {
      header: "Sort",
      accessorKey: "youtube_playlist_sort",
    },
    {
      header: "Playlist Name",
      accessorKey: "youtube_playlist_name",
    },
    {
      header: "Status",
      accessorKey: "youtube_playlist_status",
      cell: ({ row }) => {
        const status = row.original.youtube_playlist_status;

        const isActive = status === "Active" || status === 1;

        return (
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full inline-block
              ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            setEditData(row.original);
            setOpen(true);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];
  const handleCreate = () => {
    setEditData(null);
    setOpen(true);
  };
  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        pageSize={50}
        searchPlaceholder="Search Playlist..."
        addButton={{
          onClick: handleCreate,
          label: "Add PlayList",
        }}
      />

      <LectureYoutubePlaylistDialog
        open={open}
        onClose={() => setOpen(false)}
        editData={editData}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default LetureYoutubePlayList;
