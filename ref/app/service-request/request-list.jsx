import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import { REQUEST_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import moment from "moment";
import ToggleAction from "@/components/toogle/action-toggle";
import { useState } from "react";

const RequestList = () => {
  const [page, setPage] = useState(1);

  const {
    data: memerdata,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: `${REQUEST_API.list}?page=${page}`,
    queryKey: ["reqest-list", page],
  });

  const paginationData = memerdata?.data;

  const columns = [
    {
      header: "Date",
      accessorKey: "services_request_date",
      cell: ({ row }) =>
        row.original.services_request_date
          ? moment(row.original.services_request_date).format("DD-MM-YYYY")
          : "-",
    },
    {
      header: "User ID",
      accessorKey: "user_m_id",
      enableSorting: true,
    },
    {
      header: "Name",
      accessorKey: "name",
      enableSorting: true,
    },
    {
      header: "Service Name",
      accessorKey: "service_name",
      enableSorting: false,
    },
    {
      header: "Action",
      accessorKey: "services_request_status",
      cell: ({ row }) => (
        <ToggleAction
          initialStatus={row.original.services_request_status}
          apiUrl={REQUEST_API.updateStatus(row.original.id)}
          payloadKey="services_request_status"
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
        searchPlaceholder="Search Request..."
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

export default RequestList;
