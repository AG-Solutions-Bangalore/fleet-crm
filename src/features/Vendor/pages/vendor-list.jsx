import { Button } from "@/components/ui/button";
import { useFetchVendors, useUpdateVendorStatus } from "@/features/Vendor/hooks/use-vendors";
import VendorTable from "@/features/Vendor/components/vendor-table";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const VendorList = () => {
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
    Cookies.set("vendorReturnPage", (pagination.pageIndex + 1).toString(), {
      expires: 1,
    });
  };

  const handleEditVendor = (id) => {
    storeCurrentPage();
    navigate(`/vendor/vendor-edit/${id}`);
  };

  // Status PATCH switch toggler
  const statusMutation = useUpdateVendorStatus();
  const handleStatusToggle = (id, newStatus) => {
    setTogglingId(id);
    statusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: (data) => {
          toast.success(data?.message || `Vendor status updated to ${newStatus}`);
          setTogglingId(null);
          refetch();
        },
        onError: (error) => {
          console.error("Status update error:", error);
          toast.error(
            error.response?.data?.message || "Failed to update vendor status."
          );
          setTogglingId(null);
        },
      }
    );
  };

  // Restore saved return page if user navigated back
  useEffect(() => {
    const savedPage = Cookies.get("vendorReturnPage");
    if (savedPage) {
      Cookies.remove("vendorReturnPage");
      setTimeout(() => {
        const pageIndex = parseInt(savedPage) - 1;
        if (pageIndex >= 0) {
          setPagination((prev) => ({ ...prev, pageIndex }));
          queryClient.invalidateQueries({
            queryKey: ["vendors"],
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
    data: vendorsPayload,
    isFetching,
    isError,
    refetch,
  } = useFetchVendors(apiSearchTerm, pagination.pageIndex, pagination.pageSize);

  // Parse payload defensively
  const rawList = vendorsPayload?.data?.data || vendorsPayload?.data || vendorsPayload || [];
  const vendorsList = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return rawList;
    const words = debouncedSearchTerm
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length <= 1) return rawList;

    return rawList.filter((item) => {
      const searchCorpus = `${item.vendor_name || ""} ${item.vendor_contact_person || ""} ${item.vendor_mobile || ""} ${item.vendor_email || ""} ${item.vendor_city || ""}`.toLowerCase();
      return words.every((word) => searchCorpus.includes(word));
    });
  }, [rawList, debouncedSearchTerm]);

  const totalPages = vendorsPayload?.data?.last_page || vendorsPayload?.last_page || 1;
  const totalRecords = vendorsPayload?.data?.total || vendorsPayload?.total || vendorsList.length;
  const fromRecord = vendorsPayload?.data?.from || vendorsPayload?.from || (pagination.pageIndex * pagination.pageSize + 1);
  const toRecord = vendorsPayload?.data?.to || vendorsPayload?.to || (fromRecord + vendorsList.length - 1);

  if (isError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="text-center">
            <div className="text-destructive font-medium mb-3">
              Error Fetching Vendors List Data
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
      <VendorTable
        vendorsList={vendorsList}
        isFetching={isFetching}
        pagination={pagination}
        setPagination={setPagination}
        totalPages={totalPages}
        totalRecords={totalRecords}
        fromRecord={fromRecord}
        toRecord={toRecord}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onEditVendor={handleEditVendor}
        onStatusToggle={handleStatusToggle}
        togglingId={togglingId}
        storeCurrentPage={storeCurrentPage}
      />
    </div>
  );
};

export default VendorList;
