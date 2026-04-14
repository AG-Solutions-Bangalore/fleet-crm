import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LETUREYOUTUBE_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const LetureYoutubeList = () => {
  const navigate = useNavigate();
  const IMAGE_FOR = "Lecture Youtube";

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: LETUREYOUTUBE_API.list,
    queryKey: ["lecture-youtube-list"],
  });

  const list = data?.data || [];
  const imageBaseUrl = getImageBaseUrl(data?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(data?.image_url);

  const activeList = useMemo(
    () => list.filter((i) => i.youtube_status === "Active"),
    [list],
  );
  const inactiveList = useMemo(
    () => list.filter((i) => i.youtube_status !== "Active"),
    [list],
  );
  const getPages = (data) =>
    [...new Set(data.map((i) => i.page_one_name))].filter(Boolean);
  const groupByPage = (data, page) =>
    data.filter((i) => i.page_one_name === page);
  const columns = [
    {
      header: "Image",
      accessorKey: "youtube_image",
      cell: ({ row }) => {
        const fileName = row.original.youtube_image;
        const src = fileName ? `${imageBaseUrl}${fileName}` : noImageUrl;
        return (
          <ImageCell src={src} fallback={noImageUrl} alt="Youtube Image" />
        );
      },
      enableSorting: false,
    },
    { header: "Page", accessorKey: "page_one_name", enableSorting: false },
    { header: "Sort", accessorKey: "youtube_sort"},
    { header: "Course", accessorKey: "youtube_course" },
    { header: "Title", accessorKey: "youtube_title" },
    { header: "PlayList", accessorKey: "youtube_language" },
    {
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="outline"
          onClick={() => navigate(`/lecture-youtube/${row.original.id}/edit`)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  const renderGroupedTabs = (data) => {
    const pages = getPages(data);

    return (
      <Tabs defaultValue="ALL">
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          {pages.map((page) => (
            <TabsTrigger key={page} value={page}>
              {page}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="ALL">
          <DataTable
            data={data}
            columns={columns}
            pageSize={50}
            searchPlaceholder="Search Lecture Youtube..."
            addButton={{
              to: "/lecture-youtube/create",
              label: "Add Lecture Youtube",
            }}
          />
        </TabsContent>

        {pages.map((page) => (
          <TabsContent key={page} value={page}>
            <DataTable
              data={groupByPage(data, page)}
              columns={columns}
              pageSize={50}
              searchPlaceholder={`Search ${page}...`}
              addButton={{
                to: "/lecture-youtube/create",
                label: "Add Lecture Youtube",
              }}
            />
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="ACTIVE">
        <TabsList>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="INACTIVE">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="ACTIVE">
          {renderGroupedTabs(activeList)}
        </TabsContent>
        <TabsContent value="INACTIVE">
          {renderGroupedTabs(inactiveList)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LetureYoutubeList;
