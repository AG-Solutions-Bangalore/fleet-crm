import ApiErrorPage from "@/components/api-error/api-error";
import BlogPreview from "@/components/blog-preview/blog-preview";
import MemoizedSelect from "@/components/common/memoized-select";
import PageHeader from "@/components/common/page-header";
import { GroupButton } from "@/components/group-button";
import LoadingBar from "@/components/loader/loading-bar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BLOG_API, COURSE_API, GALLERY_API } from "@/constants/apiConstants";
import certifications from "@/constants/certifications.json";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { CKEditor } from "ckeditor4-react";
import {
  BookOpen,
  Calendar,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Type,
  User,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import BlogFaqForm from "./blog-faq";

const EMPTY_FAQ = {
  id: null,
  faq_sort: "",
  faq_heading: "",
  faq_que: "",
  faq_ans: "",
  faq_status: "Active",
};

const CreateBlog = () => {
  const { trigger, loading: isSubmitting } = useApiMutation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPreview, setShowPreview] = useState(true);
  const {
    data: coursesData,
    loading: courseLoading,
    error: courseerror,
    refetch,
  } = useGetApiMutation({
    url: COURSE_API.courses,
    queryKey: ["courses-dropdown"],
  });

  const [formData, setFormData] = useState({
    blog_meta_title: "",
    blog_meta_description: "",
    blog_meta_keywords: "",
    // blog_heading: "",
    blog_short_description: "",
    blog_course: "",
    blog_index: "no",
    blog_trending: "no",
    blog_created: new Date().toISOString().split("T")[0],
    blog_images_alt: "",
    blog_slug: "",
    blog_status: "Draft",
  });

  const [blogSubs, setBlogSubs] = useState([
    {
      blog_sub_heading: "",
      blog_sub_heading_tag: "",
      blog_sub_description: "",
    },
  ]);
  const [faqItems, setFaqItems] = useState([{ ...EMPTY_FAQ }]);
  const [error, setError] = useState([]);

  const [selectedBlogCategories, setSelectedBlogCategories] = useState([]);
  const [selectedRelatedBlogs, setSelectedRelatedBlogs] = useState([]);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [subErrors, setSubErrors] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const {
    data: blogDropdownData,
    isLoading: isLoadingBlogs,
    isError: isErrorBlogs,
    refetch: refetchBlogs,
  } = useGetApiMutation({
    url: BLOG_API.dropdown,
    queryKey: ["blog-dropdown"],
  });

  const blogOptions =
    blogDropdownData?.data?.map((blog) => ({
      value: blog.id,
      label: blog.blog_heading,
      slug: blog.blog_slug,
      status: blog.blog_status,
    })) || [];

  const {
    data: galleryData,
    isLoading: isLoadingGallery,
    isError: isErrorGallery,
    refetch: refetchGallery,
  } = useGetApiMutation({
    url: GALLERY_API.dropdown,
    queryKey: ["gallery-list"],
  });

  const galleryOptions =
    galleryData?.data?.map((item, index) => ({
      value: `${item.gallery_url}${item.gallery_image}`,
      label: `Image ${index + 1}`,
      image: item.gallery_image,
    })) || [];
  const handleGalleryImageSelect = async (option) => {
    if (option) {
      setSelectedGalleryImage(option);
      try {
        await navigator.clipboard.writeText(option.value);
        toast.success(`Image URL copied: ${option.image}`);
      } catch (error) {
        toast.error("Failed to copy URL");
      }
      setPreviewImage(option.value);
    } else {
      setSelectedGalleryImage(null);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "blog_heading" && !formData.blog_slug.includes("-edited-")) {
      const slug = generateSlug(value);
      setFormData((prev) => ({ ...prev, blog_slug: slug }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSlugChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, blog_slug: value }));
  };

  const generateSlug = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleSubInputChange = (index, field, value) => {
    const updatedSubs = [...blogSubs];
    updatedSubs[index][field] = value;
    setBlogSubs(updatedSubs);

    if (subErrors[index] && subErrors[index][field]) {
      const updatedErrors = [...subErrors];
      updatedErrors[index][field] = "";
      setSubErrors(updatedErrors);
    }
  };

  const addNewSub = () => {
    setBlogSubs([
      ...blogSubs,
      {
        blog_sub_heading: "",
        blog_sub_heading_tag: "",
        blog_sub_description: "",
      },
    ]);
    setSubErrors([...subErrors, {}]);
  };

  const removeSub = (index) => {
    if (blogSubs.length === 1) {
      toast.error("At least one sub-section is required");
      return;
    }

    const updatedSubs = blogSubs.filter((_, i) => i !== index);
    setBlogSubs(updatedSubs);
    const updatedErrors = subErrors.filter((_, i) => i !== index);
    setSubErrors(updatedErrors);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newErrors = [];

    if (file.type !== "image/webp") {
      newErrors.push("The image must be in WEBP format only.");
    }

    if (file.size > 5 * 1024 * 1024) {
      newErrors.push("Image must be less than 5MB.");
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        if (img.width !== 1200 || img.height !== 628) {
          newErrors.push("The image size must be exactly 1200×628 pixels.");
        }

        setImageDimensions({ width: img.width, height: img.height });

        if (newErrors.length > 0) {
          setErrors((prev) => ({
            ...prev,
            blog_images: newErrors.join(" \n "),
          }));
          setSelectedFile(null);
          setPreviewImage(null);
          setImageDimensions({ width: 0, height: 0 });
        } else {
          setSelectedFile(file);
          setPreviewImage(reader.result);
          setErrors((prev) => ({ ...prev, blog_images: "" }));
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setImageDimensions({ width: 0, height: 0 });
  };
  const addFaq = () => setFaqItems([...faqItems, { ...EMPTY_FAQ }]);

  const removeFaq = (i) => {
    if (faqItems.length === 1) return;
    setFaqItems(faqItems.filter((_, idx) => idx !== i));
    setError(error.filter((_, idx) => idx !== i));
  };

  const moveFaq = (i, dir) => {
    const copy = [...faqItems];
    const swap = dir === "up" ? i - 1 : i + 1;
    [copy[i], copy[swap]] = [copy[swap], copy[i]];
    setFaqItems(copy);
  };

  const handleItemChange = (i, field, value) => {
    const copy = [...faqItems];
    copy[i][field] = value;
    setFaqItems(copy);

    if (error[i]?.[field]) {
      const errCopy = [...error];
      errCopy[i][field] = "";
      setError(errCopy);
    }
  };
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (!formData.blog_meta_title.trim()) {
      newErrors.blog_meta_title = "Meta Title is required";
      isValid = false;
    }
    if (!formData.blog_meta_description.trim()) {
      newErrors.blog_meta_description = "Meta Description is required";
      isValid = false;
    }
    // if (!formData.blog_heading.trim()) {
    //   newErrors.blog_heading = "Blog heading is required";
    //   isValid = false;
    // }

    if (!formData.blog_slug.trim()) {
      newErrors.blog_slug = "Blog slug is required";
      isValid = false;
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.blog_slug)) {
      newErrors.blog_slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
      isValid = false;
    }

    // if (!formData.blog_short_description.trim()) {
    //   newErrors.blog_short_description = "Short description is required";
    //   isValid = false;
    // }

    if (!formData.blog_course.trim()) {
      newErrors.blog_course = "Course is required";
      isValid = false;
    }
    if (!formData.blog_status.trim()) {
      newErrors.blog_status = "Status is required";
      isValid = false;
    }

    if (!formData.blog_created.trim()) {
      newErrors.blog_created = "Blog date is required";
      isValid = false;
    }

    if (!formData.blog_images_alt.trim()) {
      newErrors.blog_images_alt = "Image alt text is required";
      isValid = false;
    }

    if (!selectedFile) {
      newErrors.blog_images = "Blog image is required";
      isValid = false;
    } else if (
      imageDimensions.width !== 1200 ||
      imageDimensions.height !== 628
    ) {
      newErrors.blog_images = `Image dimensions must be exactly 1200×628 pixels. Current: ${imageDimensions.width}×${imageDimensions.height}`;
      isValid = false;
    }

    const newSubErrors = [];
    blogSubs.forEach((sub, index) => {
      const subError = {};
      if (!sub.blog_sub_heading.trim()) {
        subError.blog_sub_heading = "Sub-heading is required";
        isValid = false;
      }
      if (!sub.blog_sub_heading_tag.trim()) {
        subError.blog_sub_heading_tag = "Sub-heading tag is required";
        isValid = false;
      }
      if (!sub.blog_sub_description.trim()) {
        subError.blog_sub_description = "Sub-description is required";
        isValid = false;
      }
      newSubErrors.push(subError);
    });
    const err = [];

    faqItems.forEach((f, i) => {
      const e = {};

      const hasAnyValue =
        f.faq_sort?.toString().trim() || f.faq_que?.trim() || f.faq_ans?.trim();

      if (hasAnyValue) {
        if (!f.faq_sort) e.faq_sort = "Required";
        if (!f.faq_que) e.faq_que = "Required";
        if (!f.faq_ans) e.faq_ans = "Required";

        if (Object.keys(e).length) isValid = false;
      }

      err[i] = e;
    });

    setError(err);
    setErrors(newErrors);
    setSubErrors(newSubErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("blog_slug", formData.blog_slug);
    formDataObj.append("blog_meta_title", formData.blog_meta_title);
    formDataObj.append("blog_meta_description", formData.blog_meta_description);
    formDataObj.append("blog_meta_keywords", formData.blog_meta_keywords);
    // formDataObj.append("blog_heading", formData.blog_heading);
    // formDataObj.append(
    //   "blog_short_description",
    //   formData.blog_short_description
    // );
    formDataObj.append("blog_status", formData.blog_status);
    formDataObj.append("blog_course", formData.blog_course);
    formDataObj.append("blog_index", formData.blog_index);
    formDataObj.append("blog_trending", formData.blog_trending);
    formDataObj.append("blog_created", formData.blog_created);
    formDataObj.append("blog_images_alt", formData.blog_images_alt);
    formDataObj.append("blog_images", selectedFile);

    blogSubs.forEach((sub, index) => {
      formDataObj.append(
        `sub[${index}][blog_sub_heading]`,
        sub.blog_sub_heading,
      );
      formDataObj.append(
        `sub[${index}][blog_sub_heading_tag]`,
        sub.blog_sub_heading_tag,
      );
      formDataObj.append(
        `sub[${index}][blog_sub_description]`,
        sub.blog_sub_description,
      );
    });

    faqItems
      .filter(
        (f) =>
          f.faq_sort?.toString().trim() ||
          f.faq_heading?.trim() ||
          f.faq_que?.trim() ||
          f.faq_ans?.trim(),
      )
      .forEach((f, index) => {
        formDataObj.append(`faq[${index}][faq_sort]`, f.faq_sort ?? "");
        formDataObj.append(`faq[${index}][faq_heading]`, f.faq_heading ?? "");
        formDataObj.append(`faq[${index}][faq_que]`, f.faq_que ?? "");
        formDataObj.append(`faq[${index}][faq_ans]`, f.faq_ans ?? "");
      });

    selectedRelatedBlogs.forEach((blog, index) => {
      formDataObj.append(`related[${index}][blog_related_id]`, blog.value);
    });
    const categories = selectedBlogCategories
      .map((blog) => blog.value)
      .join(",");

    formDataObj.append("blog_categories", categories);

    try {
      const res = await trigger({
        url: BLOG_API.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 201) {
        toast.success(res?.msg || "Blog created successfully");
        queryClient.invalidateQueries(["blog-list"]);
        navigate("/blog-list");
      } else {
        toast.error(res?.msg || "Failed to create blog");
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Something went wrong");
    }
  };

  if (isLoadingGallery || isLoadingBlogs || courseLoading) {
    <LoadingBar />;
  }
  if (isErrorBlogs || isErrorGallery || courseerror) {
    <ApiErrorPage
      onRetry={() => refetchBlogs() || refetchGallery() || refetch()}
    />;
  }

  return (
    <div className="max-w-full mx-auto">
      <PageHeader
        icon={User}
        title="Blog Builder"
        description="Create your blog with live preview"
        rightContent={
          <div className="flex justify-end gap-2 pt-4">
            <div className="flex gap-3 justify-end">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submiting...
                  </>
                ) : (
                  "Submit Blog"
                )}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="md:hidden"
            >
              {showPreview ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="ml-2">
                {showPreview ? "Hide" : "Show"} Preview
              </span>
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>
        }
      />
      <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center gap-2"
                  >
                    <Type className="h-4 w-4" />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="content"
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Faq
                  </TabsTrigger>
                  <TabsTrigger
                    value="related"
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Related Blog
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Meta Title*
                      </Label>
                      <Textarea
                        name="blog_meta_title"
                        placeholder="Enter mata title"
                        value={formData.blog_meta_title}
                        onChange={handleInputChange}
                        className={`min-h-[100px] ${
                          errors.blog_meta_title ? "border-red-500" : ""
                        }`}
                      />
                      {errors.blog_meta_title && (
                        <p className="text-sm text-red-500">
                          {errors.blog_meta_title}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Meta Description *</span>{" "}
                      </Label>
                      <Textarea
                        name="blog_meta_description"
                        placeholder="Enter a brief meta description of your blog"
                        value={formData.blog_meta_description}
                        onChange={handleInputChange}
                        className={`min-h-[100px] ${
                          errors.blog_meta_description ? "border-red-500" : ""
                        }`}
                      />
                      <div className="flex justify-between">
                        {errors.blog_meta_description ? (
                          <p className="text-sm text-red-500">
                            {errors.blog_meta_description}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500"></p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Meta Keywords</span>{" "}
                      </Label>
                      <Textarea
                        name="blog_meta_keywords"
                        placeholder="Enter a meta Keywords"
                        value={formData.blog_meta_keywords}
                        onChange={handleInputChange}
                        className={`min-h-[100px] ${
                          errors.blog_meta_keywords ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                    {/* <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Blog Heading *
                      </Label>
                      <Textarea
                        name="blog_heading"
                        placeholder="Enter blog heading"
                        value={formData.blog_heading}
                        onChange={handleInputChange}
                        className={`min-h-[100px] ${
                          errors.blog_heading ? "border-red-500" : ""
                        }`}
                      />
                      {errors.blog_heading && (
                        <p className="text-sm text-red-500">
                          {errors.blog_heading}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Short Description *</span>{" "}
                      </Label>
                      <Textarea
                        name="blog_short_description"
                        placeholder="Enter a brief description of your blog"
                        value={formData.blog_short_description}
                        onChange={handleInputChange}
                        className={`min-h-[100px] ${
                          errors.blog_short_description ? "border-red-500" : ""
                        }`}
                      />
                      <div className="flex justify-between">
                        {errors.blog_short_description ? (
                          <p className="text-sm text-red-500">
                            {errors.blog_short_description}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500"></p>
                        )}
                      </div>
                    </div> */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Blog Slug *
                      </Label>
                      <Input
                        name="blog_slug"
                        placeholder="blog-slug-here"
                        value={formData.blog_slug}
                        onChange={handleSlugChange}
                        className={errors.blog_slug ? "border-red-500" : ""}
                      />
                      {errors.blog_slug && (
                        <p className="text-sm text-red-500">
                          {errors.blog_slug}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Auto-generates from heading, but you can edit it
                        directly
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          Blog Index
                        </Label>

                        <GroupButton
                          className="w-fit"
                          value={formData.blog_index}
                          onChange={(value) =>
                            setFormData({ ...formData, blog_index: value })
                          }
                          options={[
                            { label: "Yes", value: "yes" },
                            { label: "No", value: "no" },
                          ]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          Trending
                        </Label>

                        <GroupButton
                          className="w-fit"
                          value={formData.blog_trending}
                          onChange={(value) =>
                            setFormData({ ...formData, blog_trending: value })
                          }
                          options={[
                            { label: "Yes", value: "yes" },
                            { label: "No", value: "no" },
                          ]}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Course *
                        </Label>

                        <Select
                          value={formData.blog_course}
                          onValueChange={(v) =>
                            setFormData({ ...formData, blog_course: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Courses" />
                          </SelectTrigger>
                          <SelectContent>
                            {coursesData?.data?.map((c, key) => (
                              <SelectItem key={key} value={c.courses_name}>
                                {c.courses_name}
                              </SelectItem>
                            ))}
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.blog_course && (
                          <p className="text-sm text-red-500">
                            {errors.blog_course}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Example: CFE, CIA, CAMS, Other
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Blog Date *
                        </Label>
                        <Input
                          name="blog_created"
                          type="date"
                          value={formData.blog_created}
                          onChange={handleInputChange}
                          className={
                            errors.blog_created ? "border-red-500" : ""
                          }
                        />
                        {errors.blog_created && (
                          <p className="text-sm text-red-500">
                            {errors.blog_created}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Image Alt Text *
                        </Label>
                        <Textarea
                          name="blog_images_alt"
                          placeholder="Describe the blog image"
                          value={formData.blog_images_alt}
                          onChange={handleInputChange}
                          className={
                            errors.blog_images_alt ? "border-red-500" : ""
                          }
                        />
                        {errors.blog_images_alt && (
                          <p className="text-sm text-red-500">
                            {errors.blog_images_alt}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center h-full ml-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium">
                            Status *
                          </label>

                          <GroupButton
                            className="w-fit"
                            value={formData.blog_status}
                            onChange={(value) =>
                              setFormData({ ...formData, blog_status: value })
                            }
                            options={[
                              { label: "Active", value: "Active" },
                              { label: "Inactive", value: "Inactive" },
                              { label: "Draft", value: "Draft" },
                              { label: "Scheduled", value: "Scheduled" },
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Blog Categories
                      </Label>
                      <MemoizedSelect
                        isMulti
                        options={certifications}
                        value={selectedBlogCategories}
                        onChange={setSelectedBlogCategories}
                        placeholder="Search and select blog categories..."
                      />

                      <Label className="flex items-center gap-2 text-sm">
                        <ImageIcon className="h-4 w-4" />
                        Blog Image *
                      </Label>

                      <Alert className="py-2 px-3 bg-blue-50 border-blue-200">
                        <AlertDescription className="text-xs text-blue-700">
                          WEBP • 1200×628 • Max 5MB
                        </AlertDescription>
                      </Alert>

                      {selectedFile ? (
                        <div className="border border-dashed rounded-md p-3">
                          <div className="relative aspect-[1200/628] bg-gray-100 rounded overflow-hidden">
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="w-full h-full object-contain"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              onClick={handleRemoveImage}
                              className="absolute top-1 right-1 h-6 w-6"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="mt-2 text-xs flex items-center gap-3 text-center text-gray-600">
                            <p className="truncate font-medium">
                              {selectedFile.name}
                            </p>
                            <p>
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {imageDimensions.width > 0 && (
                              <p
                                className={
                                  imageDimensions.width === 1200 &&
                                  imageDimensions.height === 628
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {imageDimensions.width}×{imageDimensions.height}
                                px
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="border border-dashed rounded-md p-4 text-center hover:border-blue-400 transition">
                          <Input
                            id="blog_images"
                            type="file"
                            accept=".webp,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <Label
                            htmlFor="blog_images"
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <ImageIcon className="h-8 w-8 text-blue-500" />
                              <p className="text-sm font-medium">
                                Upload Image
                              </p>
                              <p className="text-xs text-gray-500">
                                Click or drag & drop
                              </p>
                            </div>
                          </Label>
                        </div>
                      )}

                      {errors.blog_images && (
                        <p className="text-xs text-red-500 text-center">
                          {errors.blog_images}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-1">
                  {blogSubs.map((sub, index) => (
                    <Card key={index} className="border">
                      <CardContent className="px-3 py-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium">Section {index + 1}</h4>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSub(index)}
                            disabled={blogSubs.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>

                        <div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label>Sub-heading *</Label>
                              <Input
                                placeholder="Enter sub-heading"
                                value={sub.blog_sub_heading}
                                onChange={(e) =>
                                  handleSubInputChange(
                                    index,
                                    "blog_sub_heading",
                                    e.target.value,
                                  )
                                }
                                className={
                                  subErrors[index]?.blog_sub_heading
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {subErrors[index]?.blog_sub_heading && (
                                <p className="text-sm text-red-500">
                                  {subErrors[index].blog_sub_heading}
                                </p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label>Sub-heading Tag *</Label>
                              <Select
                                value={sub.blog_sub_heading_tag}
                                onValueChange={(value) =>
                                  handleSubInputChange(
                                    index,
                                    "blog_sub_heading_tag",
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger
                                  className={
                                    subErrors[index]?.blog_sub_heading_tag
                                      ? "border-red-500"
                                      : ""
                                  }
                                >
                                  <SelectValue placeholder="Select heading tag" />
                                </SelectTrigger>

                                <SelectContent>
                                  <SelectItem value="h1">H1</SelectItem>
                                  <SelectItem value="h2">H2</SelectItem>
                                  <SelectItem value="h3">H3</SelectItem>
                                  <SelectItem value="h4">H4</SelectItem>
                                  <SelectItem value="h5">H5</SelectItem>
                                  <SelectItem value="h6">H6</SelectItem>
                                  <SelectItem value="p">Paragraph</SelectItem>
                                </SelectContent>
                              </Select>
                              {subErrors[index]?.blog_sub_heading_tag && (
                                <p className="text-sm text-red-500">
                                  {subErrors[index].blog_sub_heading_tag}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label>Sub-description *</Label>
                            <div
                              className={
                                subErrors[index]?.blog_sub_description
                                  ? "border border-red-500 rounded"
                                  : ""
                              }
                            >
                              <CKEditor
                                initData={sub.blog_sub_description || ""}
                                config={{
                                  versionCheck: false,
                                  toolbar: [
                                    {
                                      name: "basicstyles",
                                      items: [
                                        "Bold",
                                        "Italic",
                                        "Underline",
                                        "Strike",
                                      ],
                                    },
                                    {
                                      name: "paragraph",
                                      items: [
                                        "NumberedList",
                                        "BulletedList",
                                        "-",
                                        "Outdent",
                                        "Indent",
                                      ],
                                    },
                                    {
                                      name: "links",
                                      items: ["Link", "Unlink"],
                                    },
                                    {
                                      name: "insert",
                                      items: ["Image", "Table"],
                                    },
                                    {
                                      name: "styles",
                                      items: [
                                        "Styles",
                                        "Format",
                                        "Font",
                                        "FontSize",
                                      ],
                                    },
                                    {
                                      name: "colors",
                                      items: ["TextColor", "BGColor"],
                                    },
                                    { name: "tools", items: ["Maximize"] },
                                  ],
                                  height: 200,
                                  removePlugins: "elementspath",
                                  resize_enabled: false,
                                }}
                                onChange={(event) => {
                                  const data = event.editor.getData();
                                  handleSubInputChange(
                                    index,
                                    "blog_sub_description",
                                    data,
                                  );
                                }}
                              />
                            </div>
                            {subErrors[index]?.blog_sub_description && (
                              <p className="text-sm text-red-500 mt-1">
                                {subErrors[index].blog_sub_description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className=" flex flex-row items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewSub}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Section
                    </Button>
                    <Select
                      value={selectedGalleryImage?.value}
                      onValueChange={(value) => {
                        const option = galleryOptions.find(
                          (opt) => opt.value === value,
                        );
                        handleGalleryImageSelect(option);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an image URL " />
                      </SelectTrigger>
                      <SelectContent>
                        {galleryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className=" rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={option.value}
                                  alt={option.label}
                                  className="w-8 h-8 object-cover"
                                />
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="faq" className="space-y-4">
                  <BlogFaqForm
                    faqItems={faqItems}
                    error={error}
                    addFaq={addFaq}
                    removeFaq={removeFaq}
                    moveFaq={moveFaq}
                    handleItemChange={handleItemChange}
                  />
                </TabsContent>
                <TabsContent value="related" className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Related Blogs
                    </Label>
                    <p className="text-sm text-gray-500">
                      Select blogs that are related to this content
                    </p>

                    <>
                      <MemoizedSelect
                        isMulti
                        options={blogOptions}
                        value={selectedRelatedBlogs}
                        onChange={setSelectedRelatedBlogs}
                        placeholder="Search and select related blogs..."
                      />
                      {selectedRelatedBlogs.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <Label className="text-sm font-medium">
                            Selected Blogs ({selectedRelatedBlogs.length})
                          </Label>
                          <div className="space-y-2">
                            {selectedRelatedBlogs.map((blog) => (
                              <div
                                key={blog.value}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-sm">
                                    {blog.label}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Slug: {blog.slug}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    blog.status === "Active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {blog.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div
          className={`lg:col-span-1 ${
            showPreview ? "block" : "hidden lg:block"
          }`}
        >
          <div className="sticky top-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Live Preview</h3>

                    {previewImage && (
                      <BlogPreview
                        formData={formData}
                        blogSubs={blogSubs}
                        selectedRelatedBlogs={selectedRelatedBlogs}
                        previewImage={previewImage}
                        imageDimensions={imageDimensions}
                      />
                    )}
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Real-time
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden shadow-sm">
                    <div className="relative aspect-[1200/628] bg-gray-100 overflow-hidden">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt={formData.blog_images_alt || "Blog image"}
                          className="w-full h-full object-cover"
                          style={{
                            objectFit:
                              imageDimensions.width === 1200 &&
                              imageDimensions.height === 628
                                ? "cover"
                                : "contain",
                            backgroundColor:
                              imageDimensions.width === 1200 &&
                              imageDimensions.height === 628
                                ? "transparent"
                                : "#f3f4f6",
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
                          <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            1200×628 pixels
                          </p>
                        </div>
                      )}
                      {formData.blog_course && (
                        <div className="absolute top-3 left-3">
                          <Badge
                            variant="secondary"
                            className="bg-white/90 text-gray-800"
                          >
                            {formData.blog_course}
                          </Badge>
                        </div>
                      )}
                      {previewImage && imageDimensions.width > 0 && (
                        <div className="absolute bottom-2 right-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              imageDimensions.width === 1200 &&
                              imageDimensions.height === 628
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {imageDimensions.width}×{imageDimensions.height}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      {/* {formData.blog_heading ? (
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {formData.blog_heading}
                        </h3>
                      ) : (
                        <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      )} */}

                      {formData.blog_slug && (
                        <div className="mb-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                            /blog/{formData.blog_slug}
                          </code>
                        </div>
                      )}

                      {formData.blog_short_description ? (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                          {formData.blog_short_description}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formData.blog_created
                              ? moment(formData.blog_created).format(
                                  "DD MMM YYYY",
                                )
                              : "Date not set"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>
                            {blogSubs.length} section
                            {blogSubs.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {blogSubs.map((sub, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {sub.blog_sub_heading || `Section ${index + 1}`}
                      </h4>
                      {sub.blog_sub_description ? (
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {sub.blog_sub_description}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  ))}

                  {selectedRelatedBlogs.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Related Blogs
                      </h4>
                      <div className="space-y-2">
                        {selectedRelatedBlogs.map((blog) => (
                          <div
                            key={blog.value}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-700 line-clamp-1">
                              {blog.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2 text-center">
                    {/* <div className="bg-gray-50 p-3 rounded-lg"> */}
                    {/* <p className="text-2xl font-bold text-gray-900">
                        {formData.blog_heading.length}
                      </p> */}
                    {/* <p className="text-xs text-gray-500">Chars</p>
                    </div> */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {blogSubs.length}
                      </p>
                      <p className="text-xs text-gray-500">Sections</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedFile ? "✓" : "✗"}
                      </p>
                      <p className="text-xs text-gray-500">Image</p>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        imageDimensions.width === 1200 &&
                        imageDimensions.height === 628
                          ? "bg-green-50"
                          : selectedFile
                            ? "bg-yellow-50"
                            : "bg-gray-50"
                      }`}
                    >
                      <p className="text-2xl font-bold text-gray-900">
                        {imageDimensions.width === 1200 &&
                        imageDimensions.height === 628
                          ? "✓"
                          : selectedFile
                            ? "⚠"
                            : "-"}
                      </p>
                      <p className="text-xs text-gray-500">Size</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
