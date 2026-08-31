import { Button } from "@/components/ui/button";
import { useFetchServices } from "@/features/Service/hooks/use-services";
import ServiceTable from "@/features/Service/components/service-table";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ServiceList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const storeCurrentPage = () => {
    Cookies.set("serviceReturnPage", (pagination.pageIndex + 1).toString(), {
      expires: 1,
    });
  };

  const handleEditService = (id) => {
    storeCurrentPage();
    navigate(`/service/service-edit/${id}`);
  };

  // Restore saved return page if user navigated back
  useEffect(() => {
    const savedPage = Cookies.get("serviceReturnPage");
    if (savedPage) {
      Cookies.remove("serviceReturnPage");
      setTimeout(() => {
        const pageIndex = parseInt(savedPage) - 1;
        if (pageIndex >= 0) {
          setPagination((prev) => ({ ...prev, pageIndex }));
          queryClient.invalidateQueries({
            queryKey: ["services"],
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

  // Debounce search input
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

  // Query Hook
  const {
    data: servicesPayload,
    isFetching,
    isError,
    refetch,
  } = useFetchServices(apiSearchTerm, pagination.pageIndex, pagination.pageSize);

  // Parse payload defensively
  const rawList = servicesPayload?.data?.data || servicesPayload?.data || servicesPayload || [];
  const servicesList = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return rawList;
    const words = debouncedSearchTerm
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length <= 1) return rawList;

    return rawList.filter((item) => {
      const searchCorpus = `${item.service_name || ""} ${item.service_type || ""} ${item.vendor_name || ""} ${item.vehicle_registration_no || ""}`.toLowerCase();
      return words.every((word) => searchCorpus.includes(word));
    });
  }, [rawList, debouncedSearchTerm]);

  const totalPages = servicesPayload?.data?.last_page || servicesPayload?.last_page || 1;
  const totalRecords = servicesPayload?.data?.total || servicesPayload?.total || servicesList.length;
  const fromRecord = servicesPayload?.data?.from || servicesPayload?.from || (pagination.pageIndex * pagination.pageSize + 1);
  const toRecord = servicesPayload?.data?.to || servicesPayload?.to || (fromRecord + servicesList.length - 1);

  if (isError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="text-center">
            <div className="text-destructive font-medium mb-3">
              Error Fetching Services List Data
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
      <ServiceTable
        servicesList={servicesList}
        isFetching={isFetching}
        pagination={pagination}
        setPagination={setPagination}
        totalPages={totalPages}
        totalRecords={totalRecords}
        fromRecord={fromRecord}
        toRecord={toRecord}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onEditService={handleEditService}
        storeCurrentPage={storeCurrentPage}
      />
    </div>
  );
};

export default ServiceList;
