import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import { COMPLAINT_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import moment from "moment";
import { useState } from "react";
import ComplaintToggleAction from "@/components/toogle/complaint-toggle";

const ComplaintList = () => {
  const [page, setPage] = useState(1);

  const {
    data: memerdata,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: `${COMPLAINT_API.list}?page=${page}`,
    queryKey: ["complaint-list", page],
  });

  const paginationData = memerdata?.data;

  const columns = [
    {
      header: "Date",
      accessorKey: "complaint_date",
      cell: ({ row }) =>
        row.original.complaint_date
          ? moment(row.original.complaint_date).format("DD-MM-YYYY")
          : "-",
    },
    {
      header: "User MID",
      accessorKey: "user_m_id",
      enableSorting: true,
    },
    {
      header: "Name",
      accessorKey: "name",
      enableSorting: true,
    },
    {
      header: "Subject",
      accessorKey: "complaint_subject",
      enableSorting: false,
    },
    {
      header: "Description",
      accessorKey: "complaint_description",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.complaint_description
          ? row.original.complaint_description
          : "-",
    },
    {
      header: "Action",
      accessorKey: "complaint_status",
      cell: ({ row }) => (
        <ComplaintToggleAction
          initialStatus={row.original.complaint_status}
          apiUrl={COMPLAINT_API.updateStatus(row.original.id)}
          payloadKey="complaint_status"
          onSuccess={refetch}
        />
      ),
    },
  ];

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-5">
      <DataTable
        data={paginationData?.data || []}
        columns={columns}
        pageSize={50}
        searchPlaceholder="Search Complaints..."
        // backend pagination
        backendPagination={true}
        page={paginationData?.current_page}
        totalPages={paginationData?.last_page}
        totalRecords={paginationData?.total}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ComplaintList;
