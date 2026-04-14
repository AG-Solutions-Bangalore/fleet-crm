import { useState, useMemo } from "react";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import { BLOG_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useApiMutation } from "@/hooks/useApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import moment from "moment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BlogList = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: BLOG_API.list,
    queryKey: ["blog-list"],
  });

  const { trigger: deleteTrigger, loading: isDeleting } = useApiMutation();

  const list = data?.data || [];
  const IMAGE_FOR = "Blog";
  const blogBaseUrl = getImageBaseUrl(data?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(data?.image_url);

  const courses = useMemo(
    () => [...new Set(list.map((blog) => blog.blog_course))],
    [list],
  );

  const handleDeleteClick = (blog) => {
    setSelectedBlog(blog);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBlog) return;
    try {
      const res = await deleteTrigger({
        url: BLOG_API.delete(selectedBlog.id),
        method: "delete",
      });

      if (res?.code === 200) {
        toast.success(res?.msg || "Blog deleted successfully");
        refetch();
      } else {
        toast.error(res?.msg || "Failed to delete blog");
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Something went wrong");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedBlog(null);
    }
  };

  const columns = [
    {
      header: "Image",
      accessorKey: "blog_images",
      cell: ({ row }) => {
        const fileName = row.original.blog_images;
        const src = fileName ? `${blogBaseUrl}${fileName}` : noImageUrl;
        return <ImageCell src={src} fallback={noImageUrl} alt="Blog Image" />;
      },
      enableSorting: false,
    },
    { header: "Blog Slug", accessorKey: "blog_slug" },
    { header: "Blog Heading", accessorKey: "blog_heading" },
    { header: "Course", accessorKey: "blog_course" },
    {
      header: "Trending",
      accessorKey: "blog_trending",
      cell: ({ row }) => {
        const value = row.original.blog_trending;
        if (value == null) return null;

        const normalizedValue = String(value).toLowerCase();

        const displayText = normalizedValue === "yes" ? "Yes" : "No";
        const bgColor =
          normalizedValue === "yes" ? "bg-green-100" : "bg-red-100";
        const textColor =
          normalizedValue === "yes" ? "text-green-800" : "text-red-800";

        return (
          <span
            className={`px-4 py-1 rounded-full text-center text-xs ${bgColor} ${textColor}`}
          >
            {displayText}
          </span>
        );
      },
    },

    {
      header: "Status",
      accessorKey: "blog_status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.blog_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.blog_status}
        </span>
      ),
    },
    {
      header: "Created Date",
      accessorKey: "blog_created",
      cell: ({ row }) => {
        const date = row.original.blog_created;
        return <span>{date ? moment(date).format("DD MMM YYYY") : "-"}</span>;
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate(`/edit-blog/${row.original.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <button
            title="Delete blog"
            onClick={() => handleDeleteClick(row.original)}
            className="cursor-pointer hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <>
      <Tabs defaultValue="ALL">
        <TabsList className="mb-4">
          <TabsTrigger value="ALL">All</TabsTrigger>
          {courses.map((course) => (
            <TabsTrigger key={course} value={course}>
              {course}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="ALL">
          <DataTable
            data={list}
            columns={columns}
            pageSize={50}
            searchPlaceholder="Search blogs..."
            addButton={{ to: "/add-blog", label: "Add Blog" }}
          />
        </TabsContent>

        {courses.map((course) => {
          const filteredData = list.filter(
            (blog) => blog.blog_course === course,
          );
          return (
            <TabsContent key={course} value={course}>
              <DataTable
                data={filteredData}
                columns={columns}
                pageSize={50}
                searchPlaceholder={`Search ${course} blogs...`}
                addButton={{ to: "/add-blog", label: "Add Blog" }}
              />
            </TabsContent>
          );
        })}
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Delete Blog
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the blog{" "}
              <span className="font-bold text-red-800">
                {selectedBlog?.blog_heading}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BlogList;
