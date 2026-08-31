import { Button } from "@/components/ui/button";
import { useFetchServiceTypes, useUpdateServiceTypeStatus } from "@/features/ServiceType/hooks/use-service-types";
import ServiceTypeTable from "@/features/ServiceType/components/service-type-table";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ServiceTypeList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const storeCurrentPage = () => {
    Cookies.set("serviceTypeReturnPage", (pagination.pageIndex + 1).toString(), {
      expires: 1,
    });
  };

  const handleEditServiceType = (id) => {
    storeCurrentPage();
    navigate(`/service-types/service-type-edit/${id}`);
  };

  const statusMutation = useUpdateServiceTypeStatus();
  const handleStatusToggle = (id, newStatus) => {
    setTogglingId(id);
    statusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: (data) => {
          toast.success(data?.message || `Service Type status updated to ${newStatus}`);
          setTogglingId(null);
          refetch();
        },
        onError: (error) => {
          console.error("Status update error:", error);
          toast.error(
            error.response?.data?.message || "Failed to update service type status."
          );
          setTogglingId(null);
        },
      }
    );
  };

  useEffect(() => {
    const savedPage = Cookies.get("serviceTypeReturnPage");
    if (savedPage) {
      Cookies.remove("serviceTypeReturnPage");
      setTimeout(() => {
        const pageIndex = parseInt(savedPage) - 1;
        if (pageIndex >= 0) {
          setPagination((prev) => ({ ...prev, pageIndex }));
          queryClient.invalidateQueries({
            queryKey: ["service-types"],
            exact: false,
          });
        }
      }, 100);
    }
  }, [queryClient]);

  const apiSearchTerm = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return "";
    return debouncedSearchTerm.trim().split(/\s+/)[0];
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm !== debouncedSearchTerm) {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        setDebouncedSearchTerm(searchTerm);
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, debouncedSearchTerm]);

  const {
    data: serviceTypesPayload,
    isFetching,
    isError,
    refetch,
  } = useFetchServiceTypes(apiSearchTerm, pagination.pageIndex, pagination.pageSize);

  const rawList = serviceTypesPayload?.data?.data || serviceTypesPayload?.data || serviceTypesPayload || [];
  const serviceTypesList = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return rawList;
    const words = debouncedSearchTerm
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length <= 1) return rawList;

    return rawList.filter((item) => {
      const searchCorpus = `${item.service_name || ""} ${item.service_type || ""}`.toLowerCase();
      return words.every((word) => searchCorpus.includes(word));
    });
  }, [rawList, debouncedSearchTerm]);

  const totalPages = serviceTypesPayload?.data?.last_page || serviceTypesPayload?.last_page || 1;
  const totalRecords = serviceTypesPayload?.data?.total || serviceTypesPayload?.total || serviceTypesList.length;
  const fromRecord = serviceTypesPayload?.data?.from || serviceTypesPayload?.from || (pagination.pageIndex * pagination.pageSize + 1);
  const toRecord = serviceTypesPayload?.data?.to || serviceTypesPayload?.to || (fromRecord + serviceTypesList.length - 1);

  if (isError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="text-center">
            <div className="text-destructive font-medium mb-3">
              Error Fetching Service Types Data
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full p-2">
      <ServiceTypeTable
        serviceTypesList={serviceTypesList}
        isFetching={isFetching}
        pagination={pagination}
        setPagination={setPagination}
        totalPages={totalPages}
        totalRecords={totalRecords}
        fromRecord={fromRecord}
        toRecord={toRecord}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onEditServiceType={handleEditServiceType}
        onStatusToggle={handleStatusToggle}
        togglingId={togglingId}
        storeCurrentPage={storeCurrentPage}
      />
    </div>
  );
};

export default ServiceTypeList;
