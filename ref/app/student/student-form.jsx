import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import LoadingBar from "@/components/loader/loading-bar";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-mutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import {
  STUDENT_API,
  COUNTRY_API,
  COMPANY_API,
  COURSE_API,
} from "@/constants/apiConstants";
import ApiErrorPage from "@/components/api-error/api-error";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/image-upload/image-upload";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import PageHeader from "@/components/common/page-header";
import { User } from "lucide-react";
import { GroupButton } from "@/components/group-button";
import { Card } from "@/components/ui/card";
import CompanyDialog from "../notification/create-notification";
import CountryForm from "../country/country-form";
import { CKEditor } from "ckeditor4-react";

const initialState = {
  student_uid: "",
  student_sort: "",
  student_youtube_sort: "",
  student_name: "",
  student_course: "",
  student_designation: "",
  student_country_id: "",
  student_company_id: "",
  student_certificate_issued_by: "",
  student_have_testimonial: "No",
  student_have_certificate: "No",
  student_have_youtube: "No",
  student_recent_passout: "No",
  student_have_office_image: "No",
  student_have_map: "No",
  student_is_top: "No",
  student_have_screenshot: "No",
  student_have_story: "No",
  student_story_short_description: "",
  student_marks: "",
  student_marks_image: "",
  student_marks_image_alt: "",
  student_story_date: "",
  student_story_details: "",
  student_testimonial: "",
  student_testimonial_link: "",
  student_linkedin_link: "",
  student_youtube_link: "",
  student_story_box_title1: "",
  student_story_box_details1: "",
  student_story_box_title2: "",
  student_story_box_details2: "",
  student_story_box_title3: "",
  student_story_box_details3: "",
  student_story_box_title4: "",
  student_story_box_details4: "",
  student_story_banner_image: null,
  student_story_banner_image_alt: "",
  student_image: null,
  student_image_alt: "",
  student_office_image: null,
  student_office_image_alt: "",
  student_certificate_image: null,
  student_certificate_image_alt: null,
  student_other_certificate_image: null,
  student_other_certificate_image_alt: "",
  student_youtube_image: null,
  student_status: "Active",
  student_youtube_image_alt: "",
  student_screenshot_image: "",
  student_screenshot_image_alt: "",
};

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const queryClient = useQueryClient();
  const [openCompany, setCompanyOpen] = useState(false);
  const [openCountry, setCountryOpen] = useState(false);

  const [data, setData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({});

  const {
    trigger: fetchStudent,
    loading: fetchLoading,
    error: fetchError,
  } = useApiMutation();
  const { trigger: submitStudent, loading: submitLoading } = useApiMutation();

  const { data: countriesData } = useGetApiMutation({
    url: COUNTRY_API.dropdown,
    queryKey: ["countries-dropdown"],
  });

  const { data: companiesData } = useGetApiMutation({
    url: COMPANY_API.dropdown,
    queryKey: ["companies-dropdown"],
  });
  const { data: coursesData } = useGetApiMutation({
    url: COURSE_API.courses,
    queryKey: ["courses-dropdown"],
  });

  const fetchData = async () => {
    try {
      const res = await fetchStudent({ url: STUDENT_API.byId(id) });

      const IMAGE_FOR = "Student";
      const baseUrl = getImageBaseUrl(res?.image_url, IMAGE_FOR);
      const noImageUrl = getNoImageUrl(res?.image_url);

      setData({
        ...res.data,
        student_image: null,
        student_office_image: null,
        student_certificate_image: null,
        student_other_certificate_image: null,
        student_youtube_image: null,
      });

      setPreview({
        student_image: res?.data?.student_image
          ? `${baseUrl}${res.data.student_image}`
          : noImageUrl,

        student_office_image: res?.data?.student_office_image
          ? `${baseUrl}${res.data.student_office_image}`
          : noImageUrl,

        student_other_certificate_image: res?.data
          ?.student_other_certificate_image
          ? `${baseUrl}${res.data.student_other_certificate_image}`
          : noImageUrl,
        student_certificate_image: res?.data?.student_certificate_image
          ? `${baseUrl}${res.data.student_certificate_image}`
          : noImageUrl,
        student_marks_image: res?.data?.student_marks_image
          ? `${baseUrl}${res.data.student_marks_image}`
          : noImageUrl,

        student_youtube_image: res?.data?.student_youtube_image
          ? `${baseUrl}${res.data.student_youtube_image}`
          : noImageUrl,
        student_story_banner_image: res?.data?.student_story_banner_image
          ? `${baseUrl}${res.data.student_story_banner_image}`
          : noImageUrl,
        student_screenshot_image: res?.data?.student_screenshot_image
          ? `${baseUrl}${res.data.student_screenshot_image}`
          : noImageUrl,
      });
    } catch {
      toast.error("Failed to load student data");
    }
  };

  useEffect(() => {
    if (!isEditMode) return;
    fetchData();
  }, [id]);

  const validate = () => {
    const err = {};
    if (!data.student_uid) err.student_uid = "UID is required";
    if (!data.student_name) err.student_name = "Name is required";

    if (!data.student_course) err.student_course = "Course is required";
    if (!data.student_have_testimonial)
      err.student_have_testimonial = "Testimonial is required";
    if (!data.student_have_certificate)
      err.student_have_certificate = "Certificate is required";
    if (!data.student_have_youtube)
      err.student_have_youtube = "Youtube is required";

    if (!data.student_have_testimonial)
      err.student_have_testimonial = "Testimonial is required";
    if (!data.student_have_certificate)
      err.student_have_certificate = "Have Certificate is required";
    if (!data.student_have_youtube)
      err.student_have_youtube = "Have YouTube is required";
    if (!data.student_recent_passout)
      err.student_recent_passout = "Have Passout is required";
    if (!data.student_have_office_image)
      err.student_have_office_image = "Office Image is required";
    if (!data.student_have_map)
      err.student_have_map = "Student Have  Map is required";
    if (!data.student_is_top) err.student_is_top = "Student Top is required";
    if (!data.student_have_screenshot)
      err.student_have_screenshot = "ScreenShot is required";

    if (data.student_sort && isNaN(Number(data.student_sort)))
      err.student_sort = "Sort order must be a number";

    if (
      data.student_have_testimonial === "Yes" ||
      data.student_have_map === "Yes"
    ) {
      if (!preview.student_image && !data.student_image)
        err.student_image = "Student image is required";
      if (!data.student_image_alt)
        err.student_image_alt = "Image alt is required";
    }
    if (data.student_is_top == "Yes") {
      if (!preview.student_marks_image && !data.student_marks_image)
        err.student_marks_image = "Mark  Image is required";
      if (!data.student_marks_image_alt)
        err.student_marks_image_alt = "Mark Image Alt is required";
    }
    if (data.student_have_screenshot == "Yes") {
      if (!preview.student_screenshot_image && !data.student_screenshot_image)
        err.student_screenshot_image = "ScreenShot  Image is required";
      if (!data.student_screenshot_image_alt)
        err.student_screenshot_image_alt = "ScreenShot Image Alt is required";
    }
    if (data.student_have_testimonial === "Yes") {
      if (!data.student_testimonial)
        err.student_testimonial = "Testimonial is required";
    }
    if (!data.student_have_story)
      err.student_have_story = "Have Story is required";
    if (data.student_have_story === "Yes") {
      if (!data.student_story_details)
        err.student_story_details = "Success Story is required";
      if (!data.student_story_date)
        err.student_story_date = "Success Story Date is required";
      if (!data.student_story_box_title1)
        err.student_story_box_title1 = "Box One Title  is required";
      if (!data.student_story_box_details1)
        err.student_story_box_details1 = "Box One Description is required";
      if (!data.student_story_box_title2)
        err.student_story_box_title2 = "Box Two Title is required";
      if (!data.student_story_box_details2)
        err.student_story_box_details2 = "Box Two Description is required";
      if (!data.student_story_box_title3)
        err.student_story_box_title3 = "Box Three Title is required";
      if (!data.student_story_box_details3)
        err.student_story_box_details3 = "Box Three Description is required";
      if (!data.student_story_box_title4)
        err.student_story_box_title4 = "Box Four Title is required";
      if (!data.student_story_box_details4)
        err.student_story_box_details4 = "Box Four Description is required";
      if (
        !preview.student_story_banner_image &&
        !data.student_story_banner_image
      )
        err.student_story_banner_image = "Story Banner Image is required";
      if (!data.student_story_banner_image_alt)
        err.student_story_banner_image_alt =
          "Story Banner Image alt is required";
      if (!data.student_story_short_description)
        err.student_story_short_description = "Short Description is required";
    }

    if (data.student_have_office_image === "Yes") {
      if (!preview.student_office_image && !data.student_office_image)
        err.student_office_image = "Office Image is required";
      if (!data.student_office_image_alt)
        err.student_office_image_alt = "Office Image alt is required";
    }
    if (data.student_have_certificate === "Yes") {
      if (!data.student_linkedin_link)
        err.student_linkedin_link = "LinkedIn link is required";
      if (!preview.student_certificate_image && !data.student_certificate_image)
        err.student_certificate_image = "Certificate image is required";
      if (!data.student_certificate_image_alt)
        err.student_certificate_image_alt = "Certificate image alt is required";
    }

    if (data.student_have_youtube === "Yes") {
      if (!data.student_youtube_sort)
        err.student_youtube_sort = "Sort is required";
      if (!data.student_youtube_link)
        err.student_youtube_link = "YouTube link is required";
      if (!preview.student_youtube_image && !data.student_youtube_image)
        err.student_youtube_image = "YouTube image is required";
      if (!data.student_youtube_image_alt)
        err.student_youtube_image_alt = "YouTube image alt is required";
    }
    if (data.student_recent_passout === "Yes") {
      if (!preview.student_image && !data.student_image)
        err.student_image = "Student image is required";
      if (!preview.student_image && !data.student_image)
        err.student_image = "Student image is required";

      if (!preview.student_country_id && !data.student_country_id)
        err.student_country_id = "Country is required";
      if (!data.student_company_id)
        err.student_company_id = "Company is required";
    }
    if (data.student_have_map == "Yes") {
      if (!data.student_country_id)
        err.student_country_id = "Country is required";
    }

    if (data.student_have_youtube == "No") {
      if (!data.student_sort) err.student_sort = "Sort Order is required";
    }
    console.log(err, "err");
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleImageChange = (fieldName, file) => {
    if (file) {
      setData({ ...data, [fieldName]: file });
      const url = URL.createObjectURL(file);
      setPreview({ ...preview, [fieldName]: url });
      setErrors({ ...errors, [fieldName]: "" });
    }
  };

  const handleRemoveImage = (fieldName) => {
    setData({ ...data, [fieldName]: null });
    setPreview({ ...preview, [fieldName]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const formData = new FormData();
    formData.append("student_uid", data.student_uid || "");
    formData.append("student_sort", data?.student_sort || "");
    formData.append("student_youtube_sort", data.student_youtube_sort || "");
    formData.append("student_name", data.student_name || "");
    formData.append("student_course", data.student_course || "");
    formData.append("student_designation", data.student_designation || "");
    formData.append("student_country_id", data.student_country_id || "");
    formData.append("student_company_id", data.student_company_id || "");
    formData.append(
      "student_certificate_issued_by",
      data.student_certificate_issued_by || "",
    );
    formData.append(
      "student_have_testimonial",
      data.student_have_testimonial || "",
    );
    formData.append(
      "student_have_certificate",
      data.student_have_certificate || "",
    );
    formData.append(
      "student_recent_passout",
      data.student_recent_passout || "",
    );
    formData.append(
      "student_have_office_image",
      data.student_have_office_image || "",
    );
    formData.append("student_have_map", data.student_have_map || "");
    formData.append("student_is_top", data.student_is_top || "");
    formData.append("student_have_youtube", data.student_have_youtube || "");
    formData.append("student_testimonial", data.student_testimonial || "");
    formData.append(
      "student_testimonial_link",
      data.student_testimonial_link || "",
    );
    formData.append("student_marks", data.student_marks || "");
    formData.append(
      "student_marks_image_alt",
      data.student_marks_image_alt || "",
    );
    if (data.student_marks_image instanceof File)
      formData.append("student_marks_image", data.student_marks_image);
    formData.append("student_have_story", data.student_have_story || "");
    formData.append(
      "student_story_short_description",
      data.student_story_short_description || "",
    );
    formData.append("student_story_details", data.student_story_details || "");
    formData.append("student_story_date", data.student_story_date || "");
    formData.append("student_linkedin_link", data.student_linkedin_link || "");
    formData.append("student_youtube_link", data.student_youtube_link || "");
    formData.append("student_image_alt", data.student_image_alt || "");
    formData.append("student_status", data.student_status || "");
    formData.append(
      "student_office_image_alt",
      data.student_office_image_alt || "",
    );
    formData.append(
      "student_other_certificate_image_alt",
      data.student_other_certificate_image_alt || "",
    );
    formData.append(
      "student_certificate_image_alt",
      data.student_certificate_image_alt || "",
    );
    formData.append(
      "student_youtube_image_alt",
      data.student_youtube_image_alt || "",
    );
    formData.append(
      "student_story_box_title1",
      data.student_story_box_title1 || "",
    );
    formData.append(
      "student_story_box_details1",
      data.student_story_box_details1 || "",
    );
    formData.append(
      "student_story_box_title2",
      data.student_story_box_title2 || "",
    );
    formData.append(
      "student_story_box_details2",
      data.student_story_box_details2 || "",
    );
    formData.append(
      "student_story_box_title3",
      data.student_story_box_title3 || "",
    );
    formData.append(
      "student_story_box_details3",
      data.student_story_box_details3 || "",
    );
    formData.append(
      "student_story_box_title4",
      data.student_story_box_title4 || "",
    );
    formData.append(
      "student_story_box_details4",
      data.student_story_box_details4 || "",
    );
    formData.append(
      "student_have_screenshot",
      data.student_have_screenshot || "",
    );

    if (data.student_screenshot_image instanceof File)
      formData.append(
        "student_screenshot_image",
        data.student_screenshot_image,
      );

    formData.append(
      "student_screenshot_image_alt",
      data.student_screenshot_image_alt || "",
    );
    if (data.student_story_banner_image instanceof File)
      formData.append(
        "student_story_banner_image",
        data.student_story_banner_image,
      );

    formData.append(
      "student_story_banner_image_alt",
      data.student_story_banner_image_alt || "",
    );
    if (data.student_image instanceof File)
      formData.append("student_image", data.student_image);
    if (data.student_office_image instanceof File)
      formData.append("student_office_image", data.student_office_image);
    if (data.student_other_certificate_image instanceof File)
      formData.append(
        "student_other_certificate_image",
        data.student_other_certificate_image,
      );
    if (data.student_certificate_image instanceof File)
      formData.append(
        "student_certificate_image",
        data.student_certificate_image,
      );
    if (data.student_youtube_image instanceof File)
      formData.append("student_youtube_image", data.student_youtube_image);

    try {
      const res = await submitStudent({
        url: isEditMode
          ? `${STUDENT_API.updateById(id)}`
          : `${STUDENT_API.list}`,
        method: "post",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (
        (isEditMode && res?.code === 200) ||
        (!isEditMode && res?.code === 201)
      ) {
        toast.success(res?.msg || "Saved successfully");
        queryClient.invalidateQueries({ queryKey: ["student-list"] });
        navigate(-1);
      } else {
        toast.error(res?.msg || "Failed to save student");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  if (fetchError) return <ApiErrorPage onRetry={() => fetchData()} />;

  return (
    <div className="mx-6 space-y-6">
      {fetchLoading && <LoadingBar />}
      <form onSubmit={handleSubmit}>
        <PageHeader
          icon={User}
          title={isEditMode ? "Edit Student" : "Create Student"}
          description="Fill in the student details below to register them"
          rightContent={
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <Button type="submit" disabled={submitLoading}>
                {isEditMode ? "Update Student" : "Create Student"}
              </Button>
            </div>
          }
        />
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3  lg:grid-cols-4  gap-7">
            <div>
              <label className="text-sm font-medium">UID *</label>
              <Input
                type="number"
                min={0}
                value={data.student_uid}
                onChange={(e) =>
                  setData({ ...data, student_uid: e.target.value })
                }
              />
              {errors.student_uid && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.student_uid}
                </p>
              )}
            </div>
            {data.student_have_youtube == "No" && (
              <div>
                <label className="text-sm font-medium">Sort Order *</label>
                <Input
                  type="number"
                  min={0}
                  value={data.student_sort}
                  onChange={(e) =>
                    setData({ ...data, student_sort: e.target.value })
                  }
                />
                {errors.student_sort && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.student_sort}
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={data.student_name}
                onChange={(e) =>
                  setData({ ...data, student_name: e.target.value })
                }
              />
              {errors.student_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.student_name}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Course *</label>

              <Select
                value={data.student_course}
                onValueChange={(v) => setData({ ...data, student_course: v })}
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
                </SelectContent>
              </Select>
              {errors.student_course && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.student_course}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">Designation</label>
              <Input
                value={data.student_designation}
                onChange={(e) =>
                  setData({ ...data, student_designation: e.target.value })
                }
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Country - City{" "}
                  {data?.student_recent_passout == "Yes" ||
                  data?.student_have_map == "Yes"
                    ? "*"
                    : ""}
                </label>

                <button
                  type="button"
                  onClick={() => setCountryOpen(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  + Country
                </button>
              </div>
              <Select
                value={data.student_country_id?.toString() || ""}
                onValueChange={(v) =>
                  setData({ ...data, student_country_id: Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Country - City" />
                </SelectTrigger>
                <SelectContent>
                  {countriesData?.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.country_name}-{c.country_city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.student_country_id && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.student_country_id}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Company {data?.student_recent_passout == "Yes" ? "*" : ""}
                </label>

                <button
                  type="button"
                  onClick={() => setCompanyOpen(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  + Company
                </button>
              </div>

              <Select
                value={data.student_company_id?.toString() || ""}
                onValueChange={(v) =>
                  setData({ ...data, student_company_id: Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  {companiesData?.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.student_company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.student_company_id && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.student_company_id}
                </p>
              )}
            </div>
            {data?.student_have_certificate == "Yes" && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Certificate Issued By
                  </label>
                </div>

                <Select
                  value={data.student_certificate_issued_by || ""}
                  onValueChange={(v) =>
                    setData({ ...data, student_certificate_issued_by: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Certificate Issued" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACFE">ACFE</SelectItem>
                    <SelectItem value="ACAMS">ACAMS</SelectItem>
                    <SelectItem value="IIA">IIA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 my-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Have Testimonial</label>

              <GroupButton
                className="w-fit"
                value={data.student_have_testimonial}
                onChange={(value) =>
                  setData({ ...data, student_have_testimonial: value })
                }
                options={[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ]}
              />
              {errors.student_have_testimonial && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.student_have_testimonial}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Have Certificate</label>

              <GroupButton
                className="w-fit"
                value={data.student_have_certificate}
                onChange={(value) =>
                  setData({ ...data, student_have_certificate: value })
                }
                options={[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ]}
              />
              {errors.student_have_certificate && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.student_have_certificate}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Have Youtube</label>

              <GroupButton
                className="w-fit"
                value={data.student_have_youtube}
                onChange={(value) =>
                  setData({ ...data, student_have_youtube: value })
                }
                options={[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ]}
              />
              {errors.student_have_youtube && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.student_have_youtube}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Have Story</label>

              <GroupButton
                className="w-fit"
                value={data.student_have_story}
                onChange={(value) =>
                  setData({ ...data, student_have_story: value })
                }
                options={[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ]}
              />

              {errors.student_have_story && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.student_have_story}
                </p>
              )}
            </div>
            <div className="flex items-center h-full ml-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Recent Passout</label>

                <GroupButton
                  className="w-fit"
                  value={data.student_recent_passout}
                  onChange={(value) =>
                    setData({ ...data, student_recent_passout: value })
                  }
                  options={[
                    { label: "Yes", value: "Yes" },
                    { label: "No", value: "No" },
                  ]}
                />
              </div>
            </div>
            <div className="flex items-center h-full ml-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Have Office Image</label>

                <GroupButton
                  className="w-fit"
                  value={data.student_have_office_image}
                  onChange={(value) =>
                    setData({ ...data, student_have_office_image: value })
                  }
                  options={[
                    { label: "Yes", value: "Yes" },
                    { label: "No", value: "No" },
                  ]}
                />
              </div>
            </div>
            <div className="flex items-center h-full ml-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Have Map</label>

                <GroupButton
                  className="w-fit"
                  value={data.student_have_map}
                  onChange={(value) =>
                    setData({ ...data, student_have_map: value })
                  }
                  options={[
                    { label: "Yes", value: "Yes" },
                    { label: "No", value: "No" },
                  ]}
                />
              </div>
            </div>
            <div className="flex items-center h-full ml-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Is Top</label>

                <GroupButton
                  className="w-fit"
                  value={data.student_is_top}
                  onChange={(value) =>
                    setData({ ...data, student_is_top: value })
                  }
                  options={[
                    { label: "Yes", value: "Yes" },
                    { label: "No", value: "No" },
                  ]}
                />
              </div>
            </div>
            <div className="flex items-center h-full ml-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Have ScreenShot</label>

                <GroupButton
                  className="w-fit"
                  value={data.student_have_screenshot}
                  onChange={(value) =>
                    setData({ ...data, student_have_screenshot: value })
                  }
                  options={[
                    { label: "Yes", value: "Yes" },
                    { label: "No", value: "No" },
                  ]}
                />
              </div>
            </div>
            {isEditMode && (
              <div className="flex items-center h-full ml-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Status *</label>

                  <GroupButton
                    className="w-fit"
                    value={data.student_status}
                    onChange={(value) =>
                      setData({ ...data, student_status: value })
                    }
                    options={[
                      { label: "Active", value: "Active" },
                      { label: "Inactive", value: "Inactive" },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(data.student_have_testimonial === "Yes" ||
              data.student_recent_passout === "Yes" ||
              data.student_have_map === "Yes") && (
              <>
                <div className="col-span-2">
                  <ImageUpload
                    id="student_image"
                    label="Student Image"
                    required
                    selectedFile={data.student_image}
                    previewImage={preview.student_image}
                    onFileChange={(e) =>
                      handleImageChange("student_image", e.target.files?.[0])
                    }
                    onRemove={() => handleRemoveImage("student_image")}
                    error={errors.student_image}
                    format="WEBP"
                    allowedExtensions={["webp"]}
                    dimensions="1080x1080"
                    maxSize={5}
                    requiredDimensions={[1080, 1080]}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">
                    Student Image Alt *
                  </label>
                  <Textarea
                    placeholder="Describe the student image"
                    value={data.student_image_alt}
                    onChange={(e) =>
                      setData({ ...data, student_image_alt: e.target.value })
                    }
                    rows={4}
                  />
                  {errors.student_image_alt && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_image_alt}
                    </p>
                  )}
                </div>
              </>
            )}

            {data?.student_have_testimonial === "Yes" && (
              <>
                <div className="col-span-2">
                  <label className="text-sm font-medium block">
                    Testimonial *
                  </label>
                  <Textarea
                    placeholder="Enter testimonial"
                    value={data.student_testimonial}
                    onChange={(e) =>
                      setData({ ...data, student_testimonial: e.target.value })
                    }
                    rows={4}
                  />
                  {errors.student_testimonial && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_testimonial}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium block">
                    Testimonial Link
                  </label>
                  <Textarea
                    placeholder="Enter testimonial"
                    value={data.student_testimonial_link}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_testimonial_link: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>
              </>
            )}

            {(data?.student_have_certificate === "Yes" ||
              data.student_have_story === "Yes") && (
              <div className="col-span-2">
                <label className="text-sm font-medium">LinkedIn Link *</label>
                <Textarea
                  placeholder="Enter LinkedIn link"
                  value={data.student_linkedin_link}
                  onChange={(e) =>
                    setData({
                      ...data,
                      student_linkedin_link: e.target.value,
                    })
                  }
                  rows={4}
                />
                {errors.student_linkedin_link && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.student_linkedin_link}
                  </p>
                )}
              </div>
            )}
            {data?.student_have_certificate == "Yes" && (
              <>
                <div className="col-span-2">
                  <ImageUpload
                    id="student_certificate_image"
                    label="Certificate Image"
                    required
                    selectedFile={data.student_certificate_image}
                    previewImage={preview.student_certificate_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "student_certificate_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() =>
                      handleRemoveImage("student_certificate_image")
                    }
                    error={errors.student_certificate_image}
                    format="WEBP"
                    allowedExtensions={["webp"]}
                    dimensions="380*270"
                    maxSize={5}
                    requiredDimensions={[380, 270]}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">
                    Certificate Image Alt *
                  </label>
                  <Textarea
                    placeholder="Describe the certificate image"
                    value={data.student_certificate_image_alt}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_certificate_image_alt: e.target.value,
                      })
                    }
                    rows={4}
                  />
                  {errors.student_certificate_image_alt && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_certificate_image_alt}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <ImageUpload
                    id="student_other_certificate_image"
                    label="Other Certificate Image"
                    selectedFile={data.student_other_certificate_image}
                    previewImage={preview.student_other_certificate_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "student_other_certificate_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() =>
                      handleRemoveImage("student_other_certificate_image")
                    }
                    format="WEBP"
                    allowedExtensions={["webp"]}
                    maxSize={5}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">
                    Other Certificate Image Alt
                  </label>
                  <Textarea
                    placeholder="Describe the certificate image"
                    value={data.student_other_certificate_image_alt}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_other_certificate_image_alt: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {data?.student_have_youtube === "Yes" && (
              <>
                <div>
                  <label className="text-sm font-medium">Sort Order *</label>
                  <Input
                    type="number"
                    min={0}
                    value={data.student_youtube_sort}
                    onChange={(e) =>
                      setData({ ...data, student_youtube_sort: e.target.value })
                    }
                  />
                  {errors.student_youtube_sort && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_youtube_sort}
                    </p>
                  )}
                </div>
                <div>
                  <ImageUpload
                    id="student_youtube_image"
                    label="YouTube Image"
                    required
                    selectedFile={data.student_youtube_image}
                    previewImage={preview.student_youtube_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "student_youtube_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() => handleRemoveImage("student_youtube_image")}
                    error={errors.student_youtube_image}
                    format="WEBP"
                    dimensions="640*360"
                    allowedExtensions={["webp"]}
                    maxSize={5}
                    requiredDimensions={[640, 360]}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    YouTube Image Alt *
                  </label>
                  <Textarea
                    placeholder="Describe the YouTube image"
                    value={data.student_youtube_image_alt}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_youtube_image_alt: e.target.value,
                      })
                    }
                    rows={4}
                  />
                  {errors.student_youtube_image_alt && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_youtube_image_alt}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">YouTube Link *</label>
                  <Textarea
                    placeholder="Enter YouTube link"
                    value={data.student_youtube_link}
                    onChange={(e) =>
                      setData({ ...data, student_youtube_link: e.target.value })
                    }
                    rows={4}
                  />
                  {errors.student_youtube_link && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_youtube_link}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
            {data.student_have_story == "Yes" && (
              <>
                <div>
                  <label className="text-sm font-medium">Box One Title *</label>
                  <Input
                    value={data.student_story_box_title1}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_story_box_title1: e.target.value,
                      })
                    }
                  />
                  {errors.student_story_box_title1 && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_story_box_title1}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Box Two Title *</label>
                  <Input
                    value={data.student_story_box_title2}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_story_box_title2: e.target.value,
                      })
                    }
                  />
                  {errors.student_story_box_title2 && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_story_box_title2}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Box Three Title *
                  </label>
                  <Input
                    value={data.student_story_box_title3}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_story_box_title3: e.target.value,
                      })
                    }
                  />
                  {errors.student_story_box_title3 && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_story_box_title3}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Box Four Title *
                  </label>
                  <Input
                    value={data.student_story_box_title4}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_story_box_title4: e.target.value,
                      })
                    }
                  />
                  {errors.student_story_box_title4 && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_story_box_title4}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Box One Description *
                  </label>
                  <Textarea
                    placeholder="Box One Description"
                    value={data.student_story_box_details1}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_story_box_details1: e.target.value,
                      })
                    }
                    rows={2}
                  />
                  {errors.student_story_box_details1 && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_story_box_details1}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Box Two Description *
                  </label>
                  <Textarea
                    placeholder="Box Two Description"
                    value={data.student_story_box_details2}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_story_box_details2: e.target.value,
                      })
                    }
                    rows={2}
                  />
                  {errors.student_story_box_details2 && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_story_box_details2}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Box Three Description *
                  </label>
                  <Textarea
                    placeholder="Box Three Description"
                    value={data.student_story_box_details3}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_story_box_details3: e.target.value,
                      })
                    }
                    rows={2}
                  />
                  {errors.student_story_box_details3 && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_story_box_details3}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Box Four Description *
                  </label>
                  <Textarea
                    placeholder="Box Four Description"
                    value={data.student_story_box_details4}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_story_box_details4: e.target.value,
                      })
                    }
                    rows={2}
                  />
                  {errors.student_story_box_details4 && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_story_box_details4}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Success Story Date *
                  </label>
                  <Input
                    value={data.student_story_date}
                    type="date"
                    onChange={(e) =>
                      setData({ ...data, student_story_date: e.target.value })
                    }
                  />
                  {errors.student_story_date && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_story_date}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <ImageUpload
                    id="student_story_banner_image"
                    label="Story Banner Image"
                    required
                    selectedFile={data.student_story_banner_image}
                    previewImage={preview.student_story_banner_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "student_story_banner_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() =>
                      handleRemoveImage("student_story_banner_image")
                    }
                    error={errors.student_story_banner_image}
                    format="WEBP"
                    allowedExtensions={["webp"]}
                    dimensions="1200x628"
                    maxSize={5}
                    requiredDimensions={[1200, 628]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Story Banner Image Alt *
                  </label>
                  <Textarea
                    placeholder="Story Banner Image Alt"
                    value={data.student_story_banner_image_alt}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_story_banner_image_alt: e.target.value,
                      })
                    }
                    rows={4}
                  />
                  {errors.student_story_banner_image_alt && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_story_banner_image_alt}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          {data?.student_have_story === "Yes" && (
            <div className="space-y-3 col-span-4 mb-3">
              <div>
                <label className="text-sm font-medium">
                  Short Description *
                </label>
                <Textarea
                  placeholder="Short Description"
                  value={data.student_story_short_description}
                  onChange={(e) =>
                    setData({
                      ...data,
                      student_story_short_description: e.target.value,
                    })
                  }
                  rows={4}
                />
                {errors.student_story_short_description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.student_story_short_description}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Success Story *</label>
                <div
                  className={
                    errors.student_story_details ? "border border-red-500" : ""
                  }
                >
                  <CKEditor
                    initData={data.student_story_details || ""}
                    config={{
                      versionCheck: false,
                      toolbar: [
                        {
                          name: "basicstyles",
                          items: ["Bold", "Italic", "Underline", "Strike"],
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
                          items: ["Styles", "Format", "Font", "FontSize"],
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
                      const editorData = event.editor.getData();

                      setData((prev) => ({
                        ...prev,
                        student_story_details: editorData,
                      }));
                    }}
                  />
                </div>
                {errors.student_story_details && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.student_story_details}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.student_have_office_image == "Yes" && (
              <>
                <div>
                  <ImageUpload
                    id="student_office_image"
                    label="Office Image *"
                    selectedFile={data.student_office_image}
                    previewImage={preview.student_office_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "student_office_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() => handleRemoveImage("student_office_image")}
                    error={errors.student_office_image}
                    format="WEBP"
                    allowedExtensions={["webp"]}
                    dimensions="1080x1080"
                    maxSize={5}
                    requiredDimensions={[1080, 1080]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Office Image Alt *
                  </label>
                  <Textarea
                    placeholder="Describe the office image"
                    value={data.student_office_image_alt}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_office_image_alt: e.target.value,
                      })
                    }
                    rows={4}
                  />
                  {errors.student_office_image_alt && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_office_image_alt}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data?.student_is_top === "Yes" && (
              <>
                {/* <div>
                  <label className="text-sm font-medium block">
                    Student Marks
                  </label>
                  <Textarea
                    placeholder="Example: 91,44,55,67"
                    value={data.student_marks}
                    onChange={(e) =>
                      setData({ ...data, student_marks: e.target.value })
                    }
                    rows={4}
                  />
                </div> */}

                <div>
                  <ImageUpload
                    id="student_marks_image"
                    label="Mark Image *"
                    selectedFile={data.student_marks_image}
                    previewImage={preview.student_marks_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "student_marks_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() => handleRemoveImage("student_marks_image")}
                    error={errors.student_marks_image}
                    format="WEBP"
                    allowedExtensions={["webp"]}
                    dimensions="1200x1500"
                    maxSize={5}
                    requiredDimensions={[1200, 1500]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Mark Image Alt *
                  </label>
                  <Textarea
                    placeholder="Describe the Mark Image Alt"
                    value={data.student_marks_image_alt}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_marks_image_alt: e.target.value,
                      })
                    }
                    rows={4}
                  />
                  {errors.student_marks_image_alt && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_marks_image_alt}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data?.student_have_screenshot === "Yes" && (
              <>
                <div>
                  <ImageUpload
                    id="student_screenshot_image"
                    label="Student ScreenShot *"
                    selectedFile={data.student_screenshot_image}
                    previewImage={preview.student_screenshot_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "student_screenshot_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() =>
                      handleRemoveImage("student_screenshot_image")
                    }
                    error={errors.student_screenshot_image}
                    format="WEBP"
                    allowedExtensions={["webp"]}
                    // dimensions="1200x1500"
                    maxSize={5}
                    // requiredDimensions={[1200, 1500]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Student ScreenShot Image Alt *
                  </label>
                  <Textarea
                    placeholder="Describe the ScreenShot Image Alt"
                    value={data.student_screenshot_image_alt}
                    onChange={(e) =>
                      setData({
                        ...data,
                        student_screenshot_image_alt: e.target.value,
                      })
                    }
                    rows={4}
                  />
                  {errors.student_screenshot_image_alt && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.student_screenshot_image_alt}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>
      </form>
      <CompanyDialog
        open={openCompany}
        onClose={() => setCompanyOpen(false)}
        companyId={null}
      />
      <CountryForm
        isOpen={openCountry}
        onClose={() => setCountryOpen(false)}
        countryId={null}
      />
    </div>
  );
};

export default StudentForm;
