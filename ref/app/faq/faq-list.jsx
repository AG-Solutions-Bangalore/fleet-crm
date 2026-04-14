import ApiErrorPage from "@/components/api-error/api-error";
import LoadingBar from "@/components/loader/loading-bar";
import ToggleStatus from "@/components/toogle/status-toogle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FAQ_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Edit, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const FaqList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: FAQ_API.list,
    queryKey: ["faq-list"],
  });
  const filteredData = useMemo(() => {
    const list = data?.data ?? [];

    if (!searchTerm.trim()) return list;

    return list.filter((faq) =>
      (faq?.page_two_name ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);
  if (isLoading) return <LoadingBar />;

  if (isError) return <ApiErrorPage onRetry={refetch} />;

  const isEmpty = filteredData.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search FAQs by page name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          <Button
            className="w-full sm:w-auto gap-2 "
            onClick={() => {
              navigate("/add-faq");
            }}
          >
            <Plus className="h-4 w-4" />
            Add FAQ
          </Button>
        </div>

        {isEmpty ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No FAQs found" : "No FAQs yet"}
              </h3>
              <p className="text-gray-600 text-center max-w-sm">
                {searchTerm
                  ? "Try adjusting your search terms or filters"
                  : "Get started by creating your first FAQ to help your users"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.map((faq) => (
              <Card
                key={faq.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-lg  group"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2  transition flex-grow">
                    {faq.page_two_name}
                  </h3>

                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                    <ToggleStatus
                      initialStatus={faq.faq_status}
                      apiUrl={FAQ_API.updateStatus(faq.id)}
                      payloadKey="faq_status"
                      onSuccess={refetch}
                    />
                    <Link to={`/edit-faq/${faq.id}`} title="Edit FAQ">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-accent hover:text-accent/95 hover:bg-accent/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Counter */}
        {!isEmpty && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Showing {filteredData.length} of {data?.data?.length || 0} FAQs
          </div>
        )}
      </div>
    </div>
  );
};

export default FaqList;
