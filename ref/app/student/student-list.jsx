import { useNavigate } from "react-router-dom";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ImageCell from "@/components/common/ImageCell";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { STUDENT_API } from "@/constants/apiConstants";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import moment from "moment";

const StudentList = ({ enable }) => {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: STUDENT_API.list,
    queryKey: ["student-list"],
  });

  const list = data?.data || [];
  const IMAGE_FOR = "Student";
  const studentBaseUrl = getImageBaseUrl(data?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(data?.image_url);

  const getCourseGroups = (data) => {
    return [...new Set(data.map((item) => item.student_course))];
  };
  const activeStudents = useMemo(
    () => list.filter((item) => item.student_status === "Active"),
    [list],
  );

  const inactiveStudents = useMemo(
    () => list.filter((item) => item.student_status !== "Active"),
    [list],
  );
  const activeCourseGroups = useMemo(
    () => getCourseGroups(activeStudents),
    [activeStudents],
  );

  const inactiveCourseGroups = useMemo(
    () => getCourseGroups(inactiveStudents),
    [inactiveStudents],
  );
  const columns = [
    ...(enable == "testimonial" || enable == "recentpassout"
      ? [
          {
            header: "Student Image",
            accessorKey: "student_image",
            cell: ({ row }) => {
              const fileName = row.original.student_image;
              if (!fileName) return "-";
              return (
                <ImageCell
                  src={`${studentBaseUrl}${fileName}`}
                  fallback={noImageUrl}
                  alt="Student Image"
                />
              );
            },
            enableSorting: false,
          },
        ]
      : []),
    ...(enable == "certificate"
      ? [
          {
            header: "Certificate Image",
            accessorKey: "student_certificate_image",
            cell: ({ row }) => {
              const fileName = row.original.student_certificate_image;
              if (!fileName) return "-";
              return (
                <ImageCell
                  src={`${studentBaseUrl}${fileName}`}
                  fallback={noImageUrl}
                  alt="Certificate Image"
                />
              );
            },
            enableSorting: false,
          },
        ]
      : []),
    ...(enable == "top"
      ? [
          {
            header: "Marks Image",
            accessorKey: "student_marks_image",
            cell: ({ row }) => {
              const fileName = row.original.student_marks_image;
              if (!fileName) return "-";
              return (
                <ImageCell
                  src={`${studentBaseUrl}${fileName}`}
                  fallback={noImageUrl}
                  alt="Marks Image"
                />
              );
            },
            enableSorting: false,
          },
        ]
      : []),
    ...(enable == "screenshot"
      ? [
          {
            header: "Image",
            accessorKey: "student_screenshot_image",
            cell: ({ row }) => {
              const fileName = row.original.student_screenshot_image;
              if (!fileName) return "-";
              return (
                <ImageCell
                  src={`${studentBaseUrl}${fileName}`}
                  fallback={noImageUrl}
                  alt="ScreenShot Image"
                />
              );
            },
            enableSorting: false,
          },
        ]
      : []),
    ...(enable == "youtube"
      ? [
          {
            header: "YouTube Image",
            accessorKey: "student_youtube_image",
            cell: ({ row }) => {
              const fileName = row.original.student_youtube_image;
              if (!fileName) return "-";
              return (
                <ImageCell
                  src={`${studentBaseUrl}${fileName}`}
                  fallback={noImageUrl}
                  alt="YouTube Image"
                />
              );
            },
            enableSorting: false,
          },
        ]
      : []),
    ...(enable == "story"
      ? [
          {
            header: "Story Image",
            accessorKey: "student_story_banner_image",
            cell: ({ row }) => {
              const fileName = row.original.student_story_banner_image;
              if (!fileName) return "-";
              return (
                <ImageCell
                  src={`${studentBaseUrl}${fileName}`}
                  fallback={noImageUrl}
                  alt="YouTube Image"
                />
              );
            },
            enableSorting: false,
          },
        ]
      : []),
    ...(enable == "officeimage"
      ? [
          {
            header: "Office Image",
            accessorKey: "student_office_image",
            cell: ({ row }) => {
              const fileName = row.original.student_office_image;
              if (!fileName) return "-";
              return (
                <ImageCell
                  src={`${studentBaseUrl}${fileName}`}
                  fallback={noImageUrl}
                  alt="YouTube Image"
                />
              );
            },
            enableSorting: false,
          },
        ]
      : []),

    ...(enable === "story"
      ? [
          {
            header: "Date",
            accessorKey: "student_story_date",
            enableSorting: true,
            cell: ({ getValue }) => {
              const value = getValue();
              return value ? moment(value).format("DD MMM YYYY") : "-";
            },
          },
        ]
      : []),
    ...(enable == "youtube"
      ? [
          {
            header: "Sort",
            enableSorting: true,
            accessorKey: "student_youtube_sort",
          },
        ]
      : []),
    ...(enable != "youtube"
      ? [{ header: "Sort", enableSorting: true, accessorKey: "student_sort" }]
      : []),
    { header: "UID", accessorKey: "student_uid" },
    { header: "Name", accessorKey: "student_name" },
    { header: "Course", accessorKey: "student_course", enableSorting: false },
    {
      header: "Designation",
      accessorKey: "student_designation",
      enableSorting: false,
    },
    ...(enable == "testimonial"
      ? [
          {
            header: "Testimonial",
            accessorKey: "student_have_testimonial",
            cell: ({ row }) => {
              const isActive = row.original.student_have_testimonial === "Yes";
              return (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.original.student_have_testimonial}
                </span>
              );
            },
          },
        ]
      : []),
    ...(enable == "youtube"
      ? [
          {
            header: "YouTube",
            accessorKey: "student_have_youtube",
            cell: ({ row }) => {
              const isActive = row.original.student_have_youtube === "Yes";
              return (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.original.student_have_youtube}
                </span>
              );
            },
          },
        ]
      : []),
    ...(enable == "certificate"
      ? [
          {
            header: "Certificate",
            accessorKey: "student_have_certificate",
            cell: ({ row }) => {
              const isActive = row.original.student_have_certificate === "Yes";
              return (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.original.student_have_certificate}
                </span>
              );
            },
          },
        ]
      : []),
    ...(enable == "story"
      ? [
          {
            header: "Story",
            accessorKey: "student_have_story",
            cell: ({ row }) => {
              const isActive = row.original.student_have_story === "Yes";
              return (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.original.student_have_story}
                </span>
              );
            },
          },
        ]
      : []),
    ...(enable == "recentpassout"
      ? [
          {
            header: "Passout",
            accessorKey: "student_recent_passout",
            cell: ({ row }) => {
              const isActive = row.original.student_recent_passout === "Yes";
              return (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.original.student_recent_passout}
                </span>
              );
            },
          },
        ]
      : []),
    ...(enable == "officeimage"
      ? [
          {
            header: "Office",
            accessorKey: "student_have_office_image",
            cell: ({ row }) => {
              const isActive = row.original.student_have_office_image === "Yes";
              return (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.original.student_have_office_image}
                </span>
              );
            },
          },
        ]
      : []),
    ...(enable == "map"
      ? [
          {
            header: "Map",
            accessorKey: "student_have_map",
            cell: ({ row }) => {
              const isActive = row.original.student_have_map === "Yes";
              return (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.original.student_have_map}
                </span>
              );
            },
          },
        ]
      : []),
    ...(enable == "top"
      ? [
          {
            header: "Is Top",
            accessorKey: "student_is_top",
            cell: ({ row }) => {
              const isActive = row.original.student_is_top === "Yes";
              return (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.original.student_is_top}
                </span>
              );
            },
          },
        ]
      : []),
    ...(enable == "screenshot"
      ? [
          {
            header: "ScreenShot",
            accessorKey: "student_have_screenshot",
            cell: ({ row }) => {
              const isActive = row.original.student_have_screenshot == "Yes";
              return (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.original.student_have_screenshot ?? "No Value"}
                </span>
              );
            },
          },
        ]
      : []),

    {
      header: "Action",
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="outline"
          onClick={() => navigate(`/student/${row.original.id}/edit`)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="ACTIVE" className="w-full">
        <TabsList>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="INACTIVE">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="ACTIVE">
          <Tabs defaultValue="ALL_ACTIVE">
            <TabsList>
              <TabsTrigger value="ALL_ACTIVE">All</TabsTrigger>
              {activeCourseGroups.map((course) => (
                <TabsTrigger key={course} value={course}>
                  {course}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="ALL_ACTIVE">
              <DataTable
                data={activeStudents}
                columns={columns}
                pageSize={50}
                searchPlaceholder="Search active students..."
                addButton={{
                  to: "/student/create",
                  label: "Add Student",
                }}
              />
            </TabsContent>

            {activeCourseGroups.map((course) => (
              <TabsContent key={course} value={course}>
                <DataTable
                  data={activeStudents.filter(
                    (item) => item.student_course === course,
                  )}
                  columns={columns}
                  pageSize={50}
                  searchPlaceholder={`Search ${course} (Active)...`}
                  addButton={{
                    to: "/student/create",
                    label: "Add Student",
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="INACTIVE">
          <Tabs defaultValue="ALL_INACTIVE">
            <TabsList>
              <TabsTrigger value="ALL_INACTIVE">All</TabsTrigger>
              {inactiveCourseGroups.map((course) => (
                <TabsTrigger key={course} value={course}>
                  {course}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="ALL_INACTIVE">
              <DataTable
                data={inactiveStudents}
                columns={columns}
                pageSize={50}
                searchPlaceholder="Search inactive students..."
                addButton={{
                  to: "/student/create",
                  label: "Add Student",
                }}
              />
            </TabsContent>

            {inactiveCourseGroups.map((course) => (
              <TabsContent key={course} value={course}>
                <DataTable
                  data={inactiveStudents.filter(
                    (item) => item.student_course === course,
                  )}
                  columns={columns}
                  pageSize={50}
                  searchPlaceholder={`Search ${course} (Inactive)...`}
                  addButton={{
                    to: "/student/create",
                    label: "Add Student",
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentList;
