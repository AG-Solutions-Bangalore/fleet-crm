import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import { COUNTRY_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Edit } from "lucide-react";
import { useState } from "react";
import CountryForm from "./country-form";

const CountryList = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: COUNTRY_API.list,
    queryKey: ["countrylist"],
  });

  const handleCreate = () => {
    setSelectedId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedId(id);
    setIsDialogOpen(true);
  };

  const columns = [
    { header: "Country", accessorKey: "country_name" },
    { header: "City", accessorKey: "country_city" },
    { header: "Latitude", accessorKey: "country_latitude" },
    { header: "Longitude", accessorKey: "country_longitude" },
    {
      header: "Status",
      accessorKey: "country_status",
      cell: ({ row }) => {
        const status = row.original.country_status;

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
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="outline"
          onClick={() => handleEdit(row.original.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];
  if (isError) {
    return <ApiErrorPage onRetry={() => refetch()} />;
  }
  return (
    <>
      {isLoading && <LoadingBar />}

      <DataTable
        data={data?.data || []}
        columns={columns}
        pageSize={50}
        searchPlaceholder="Search country..."
        addButton={{
          onClick: handleCreate,
          label: "Add Country",
        }}
      />

      <CountryForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        countryId={selectedId}
      />
    </>
  );
};

export default CountryList;
