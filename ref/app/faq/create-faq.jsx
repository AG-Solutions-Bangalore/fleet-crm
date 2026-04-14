import ApiErrorPage from "@/components/api-error/api-error";
import PageHeader from "@/components/common/page-header";
import { GroupButton } from "@/components/group-button";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FAQ_API, PAGE_TWO_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import BlogFaqForm from "../blog/blog-faq";

/* ---------------- CONSTANTS ---------------- */

const EMPTY_FAQ = {
  id: null,
  faq_sort: "",
  faq_heading: "",
  faq_que: "",
  faq_ans: "",
  faq_status: "Active",
};

/* ---------------- COMPONENT ---------------- */

const FaqForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { trigger, loading } = useApiMutation();

  const [faqFor, setFaqFor] = useState({
    faq_for: "",
    faq_status: "Active",
  });

  const [faqItems, setFaqItems] = useState([{ ...EMPTY_FAQ }]);
  const [errors, setErrors] = useState([]);
  const [pageOptions, setPageOptions] = useState([]);

  const {
    trigger: fetchfaq,
    loading: isLoading,
    error: isError,
  } = useApiMutation();

  const { data: pageData } = useGetApiMutation({
    url: PAGE_TWO_API.dropdown,
    queryKey: ["page-two"],
  });

  useEffect(() => {
    if (!isEdit) return;

    const fetchData = async () => {
      try {
        const res = await fetchfaq({
          url: FAQ_API.byId(id),
        });
        const d = res?.data || {};
        setFaqFor({
          faq_for: d.faq_for,
          faq_status: d.faq_status,
        });

        setFaqItems(
          d.web_faq_subs.map((s) => ({
            id: s.id,
            faq_sort: s.faq_sort ?? "",
            faq_heading: s.faq_heading ?? "",
            faq_que: s.faq_que ?? "",
            faq_ans: s.faq_ans ?? "",
            faq_status: s.faq_status ?? "Active",
          }))
        );
      } catch (err) {
        toast.error("Failed to load country data");
      }
    };

    fetchData();
  }, [isEdit, id]);

  useEffect(() => {
    if (pageData?.data) setPageOptions(pageData.data);
  }, [pageData]);
  /* ---------------- HANDLERS ---------------- */

  const handleItemChange = (i, field, value) => {
    const copy = [...faqItems];
    copy[i][field] = value;
    setFaqItems(copy);

    if (errors[i]?.[field]) {
      const errCopy = [...errors];
      errCopy[i][field] = "";
      setErrors(errCopy);
    }
  };

  const addFaq = () => setFaqItems([...faqItems, { ...EMPTY_FAQ }]);

  const removeFaq = (i) => {
    if (faqItems.length === 1) return;
    setFaqItems(faqItems.filter((_, idx) => idx !== i));
    setErrors(errors.filter((_, idx) => idx !== i));
  };

  const moveFaq = (i, dir) => {
    const copy = [...faqItems];
    const swap = dir === "up" ? i - 1 : i + 1;
    [copy[i], copy[swap]] = [copy[swap], copy[i]];
    setFaqItems(copy);
  };

  const validate = () => {
    let valid = true;
    const err = [];

    if (!faqFor.faq_for) {
      toast.error("Page is required");
      return false;
    }

    faqItems.forEach((f, i) => {
      const e = {};
      if (!f.faq_sort) e.faq_sort = "Required";
      if (!f.faq_que) e.faq_que = "Required";
      if (!f.faq_ans) e.faq_ans = "Required";
      if (Object.keys(e).length) valid = false;
      err[i] = e;
    });

    setErrors(err);
    return valid;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      faq_for: faqFor.faq_for,
      faq_status: faqFor.faq_status,
      faq: faqItems.map((f) => ({
        id: f.id,
        faq_sort: f.faq_sort,
        faq_heading: f.faq_heading,
        faq_que: f.faq_que,
        faq_ans: f.faq_ans,
        faq_status: f.faq_status,
      })),
    };

    try {
      const res = await trigger({
        url: isEdit ? FAQ_API.updateById(id) : FAQ_API.create,
        method: isEdit ? "put" : "post",
        data: payload,
      });

      if (res?.code === 200) {
        toast.success(res.msg || "Success");
        await queryClient.invalidateQueries({
          queryKey: ["faq-list"],
        });
        navigate("/faq-list");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };
  const syncAllSubStatus = (status) => {
    setFaqItems((prev) =>
      prev.map((item) => ({
        ...item,
        faq_status: status,
      }))
    );
  };

  /* ---------------- UI ---------------- */

  if (isEdit && isLoading) return <LoadingBar />;
  if (isEdit && isError) return <ApiErrorPage />;

  return (
    <div>
      <PageHeader
        icon={HelpCircle}
        title={isEdit ? "Edit FAQ" : "Create FAQs"}
        rightContent={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <Card className="mt-2">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className={`grid gap-3 ${
                isEdit ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
              }`}
            >
              <div className={isEdit ? "md:col-span-2" : ""}>
                <Label>Page *</Label>
                <Select
                  value={faqFor.faq_for}
                  onValueChange={(v) =>
                    setFaqFor((p) => ({ ...p, faq_for: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageOptions.map((p) => (
                      <SelectItem key={p.page_two_url} value={p.page_two_url}>
                        {p.page_two_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isEdit && (
                <div className="mt-2">
                  <Label className="mr-4">Status</Label>
                  <GroupButton
                    className="w-fit"
                    value={faqFor.faq_status}
                    onChange={(v) => {
                      setFaqFor((p) => ({ ...p, faq_status: v }));
                      syncAllSubStatus(v);
                    }}
                    options={[
                      { label: "Active", value: "Active" },
                      { label: "Inactive", value: "Inactive" },
                    ]}
                  />
                </div>
              )}
            </div>

            {/* FAQ ITEMS */}
            {/* {faqItems.map((item, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <h4 className="font-medium">FAQ {i + 1}</h4>
                  <div className="flex gap-2">
                    {isEdit && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {item.faq_status === "Active" ? "Active" : "Inactive"}
                        </span>

                        <Switch
                          checked={item.faq_status === "Active"}
                          onCheckedChange={(checked) =>
                            handleItemChange(
                              i,
                              "faq_status",
                              checked ? "Active" : "Inactive"
                            )
                          }
                        />
                      </div>
                    )}
                    {i > 0 && (
                      <ChevronUp
                        onClick={() => moveFaq(i, "up")}
                        className="cursor-pointer h-5 w-5"
                      />
                    )}
                    {i < faqItems.length - 1 && (
                      <ChevronDown
                        onClick={() => moveFaq(i, "down")}
                        className="cursor-pointer h-5 w-5"
                      />
                    )}
                    <Trash2
                      className="cursor-pointer text-red-500 !h-5 !w-5"
                      onClick={() => removeFaq(i)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Input
                      placeholder="Sort Order *"
                      value={item.faq_sort}
                      onChange={(e) =>
                        handleItemChange(i, "faq_sort", e.target.value)
                      }
                      className={errors[i]?.faq_sort && "border-red-500"}
                    />
                    {errors[i]?.faq_sort && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[i].faq_sort}
                      </p>
                    )}
                  </div>
                  <Input
                    placeholder="Heading"
                    value={item.faq_heading}
                    onChange={(e) =>
                      handleItemChange(i, "faq_heading", e.target.value)
                    }
                  />

                  <div>
                    <Textarea
                      placeholder="Question *"
                      value={item.faq_que}
                      onChange={(e) =>
                        handleItemChange(i, "faq_que", e.target.value)
                      }
                      className={errors[i]?.faq_que && "border-red-500"}
                    />
                    {errors[i]?.faq_que && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[i].faq_que}
                      </p>
                    )}
                  </div>
                  <div>
                    <Textarea
                      placeholder="Answer *"
                      value={item.faq_ans}
                      onChange={(e) =>
                        handleItemChange(i, "faq_ans", e.target.value)
                      }
                      className={errors[i]?.faq_ans && "border-red-500"}
                    />
                    {errors[i]?.faq_ans && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[i].faq_ans}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addFaq}>
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button> */}
            <BlogFaqForm
              isEdit={isEdit ? true : false}
              faqItems={faqItems}
              error={errors}
              addFaq={addFaq}
              removeFaq={removeFaq}
              moveFaq={moveFaq}
              handleItemChange={handleItemChange}
            />

            <Button type="submit" disabled={loading} className="!mt-1 ml-3">
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 " />
                  Saving...
                </>
              ) : isEdit ? (
                "Update FAQ"
              ) : (
                "Create FAQs"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaqForm;
