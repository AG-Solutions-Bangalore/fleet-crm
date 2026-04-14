import ApiErrorPage from "@/components/api-error/api-error";
import LoadingBar from "@/components/loader/loading-bar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NEWSLETTER_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { motion } from "framer-motion";
import { Calendar, Mail, Search } from "lucide-react";
import moment from "moment";
import { useMemo, useState } from "react";

const NewsLetter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: NEWSLETTER_API.list,
    queryKey: ["newsletter-list"],
  });
  const newsletters = data?.data || [];

  const filteredNewsletters = useMemo(() => {
    if (!searchQuery.trim()) return newsletters;
    const query = searchQuery.toLowerCase();
    return newsletters.filter((item) =>
      item.newsletter_email.toLowerCase().includes(query)
    );
  }, [searchQuery, newsletters]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <>
      {isLoading && <LoadingBar />}

      <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Newsletters
                </h1>
                <p className="text-sm text-gray-500">
                  Manage and view all newsletter subscribers
                </p>
              </div>

              {/* Right: Search */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="w-full sm:w-80"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 pl-10  pr-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {filteredNewsletters.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="text-center">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  No newsletters found
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery ? "Try adjusting your search" : "No data yet"}
                </p>
              </div>
            </motion.div>
          ) : (
            <Card className="p-2">
              <motion.div
                variants={containerVariants}
                initial={false}
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
              >
                {filteredNewsletters.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    whileHover={{
                      y: -4,
                      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
                    }}
                    className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-600">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>
                        {moment(item.newsletter_created).format("MMM DD, YYYY")}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 mb-3" />

                    {/* Email */}
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-gray-900 break-all">
                        {item.newsletter_email}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default NewsLetter;
