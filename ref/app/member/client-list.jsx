import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import { CLIENT_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Edit, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ToggleStatus from "@/components/toogle/status-toogle";

const ClientList = () => {
  const navigate = useNavigate();

  // backend page state
  const [page, setPage] = useState(1);

  const {
    data: memerdata,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: `${CLIENT_API.list}?page=${page}`,
    queryKey: ["client-list", page],
  });

  const paginationData = memerdata?.data;

  const columns = [
    {
      header: "M Id",
      accessorKey: "m_id",
    },
    {
      header: "Name",
      accessorKey: "name",
      enableSorting: false,
    },
    {
      header: "Mobile",
      accessorKey: "mobile",
      enableSorting: false,
    },
    {
      header: "Area",
      accessorKey: "area",
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.area || "-"}</span>,
    },
    // {
    //   header: "R ID",
    //   accessorKey: "r_id",
    //   enableSorting: false,
    //   cell: ({ row }) => <span>{row.original.r_id || "-"}</span>,
    // },
    // {
    //   header: "Relation",
    //   accessorKey: "relation",
    //   enableSorting: false,
    //   cell: ({ row }) => <span>{row.original.relation || "-"}</span>,
    // },
    {
      header: "Services",
      accessorKey: "services_name",
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.services_name || "-"}</span>,
    },
    {
      header: "Hide Services",
      accessorKey: "hide_services_name",
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.hide_services_name || "-"}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span
          className={`w-fit px-3 rounded-full text-xs font-medium text-center flex justify-center items-center ${
            row.original.status == "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <ToggleStatus
            initialStatus={row.original.status}
            apiUrl={CLIENT_API.updateStatus(row.original.id)}
            payloadKey="status"
            onSuccess={refetch}
            method="patch"
          />
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <abbr title="Edit Client">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(`/client-list/edit/${row.original.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </abbr>

          {/* <abbr title="Add Family Member">
            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                navigate(`/client-list/create-relation/`, {
                  state: { m_id: row.original.m_id },
                })
              }
            >
              <Users className="h-4 w-4" />
            </Button>
          </abbr> */}
        </div>
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
        searchPlaceholder="Search Clients..."
        pageSize={50}
        addButton={{
          onClick: () => navigate("/client-list/create"),
          label: "Add Client",
        }}
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

export default ClientList;
