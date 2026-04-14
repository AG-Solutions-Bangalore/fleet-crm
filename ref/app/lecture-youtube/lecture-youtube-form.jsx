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
  COURSE_API,
  LETUREYOUTUBE_API,
  LETUREYOUTUBEPLAYLIST_API,
  YOUTUBEFOR_API,
} from "@/constants/apiConstants";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import ImageCell from "@/components/common/ImageCell";
import { useQueryClient } from "@tanstack/react-query";
import ApiErrorPage from "@/components/api-error/api-error";
import PageHeader from "@/components/common/page-header";
import { Youtube } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/image-upload/image-upload";
import { Card } from "@/components/ui/card";
import { GroupButton } from "@/components/group-button";

const initialState = {
  youtube_for: "",
  youtube_sort: "",
  youtube_course: "",
  youtube_language: "",
  youtube_title: "",
  youtube_link: "",
  youtube_playlist_id: "",
  youtube_image: null,
  youtube_image_alt: "",
  youtube_status: "Active",
};

const LectureYoutubeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const IMAGE_FOR = "Lecture Youtube";
  const [data, setData] = useState(initialState);
  const [preview, setPreview] = useState({
    youtube_image: "",
  });
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();
  const { trigger: fetchVideo, loading, error: videoError } = useApiMutation();
  const { trigger: submitVideo, loading: submitLoading } = useApiMutation();
  const {
    data: youtubeForData,
    loading: youtubeForLoading,
    youtubeForError,
    refetch,
  } = useGetApiMutation({
    url: YOUTUBEFOR_API.list,
    queryKey: ["youtubeFor"],
  });
  const { data: playListData } = useGetApiMutation({
    url: LETUREYOUTUBEPLAYLIST_API.activelist,
    queryKey: ["activeplaytlist-dropdown"],
  });
  const { data: coursesData } = useGetApiMutation({
    url: COURSE_API.courses,
    queryKey: ["courses-dropdown"],
  });
  const fetchData = async () => {
    try {
      const res = await fetchVideo({
        url: LETUREYOUTUBE_API.byId(id),
      });

      setData({
        ...res.data,
        youtube_image: null,
      });
      const imageBaseUrl = getImageBaseUrl(res?.image_url, IMAGE_FOR);
      const noImageUrl = getNoImageUrl(res?.image_url);
      const imagepath = res?.data?.youtube_image
        ? `${imageBaseUrl}${res?.data?.youtube_image}`
        : noImageUrl;

      setPreview({
        youtube_image: imagepath,
      });
    } catch {
      refetch();
      toast.error("Failed to load data");
    }
  };
  useEffect(() => {
    if (!isEditMode) return;
    fetchData();
  }, [id, isEditMode]);

  const validate = () => {
    const err = {};

    if (!data.youtube_for) err.youtube_for = "YouTube For is required";
    if (!data.youtube_link) err.youtube_link = "YouTube link is required";
    if (!data.youtube_image_alt)
      err.youtube_image_alt = "Image Alt is required";
    if (!preview.youtube_image && !data.youtube_image)
      err.youtube_image = "Image is required";
    if (data.youtube_sort && isNaN(Number(data.youtube_sort))) {
      err.youtube_sort = "Sort order must be a number";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const formData = new FormData();
    formData.append("youtube_for", data.youtube_for ?? "");
    formData.append("youtube_sort", data.youtube_sort ?? "");
    formData.append("youtube_course", data.youtube_course ?? "");
    formData.append("youtube_language", data.youtube_language ?? "");
    formData.append("youtube_playlist_id", data.youtube_playlist_id ?? "");
    formData.append("youtube_title", data.youtube_title ?? "");
    formData.append("youtube_link", data.youtube_link ?? "");
    formData.append("youtube_image_alt", data.youtube_image_alt ?? "");
    formData.append("youtube_status", data.youtube_status);

    if (data.youtube_image instanceof File) {
      formData.append("youtube_image", data.youtube_image);
    }
    try {
      const res = await submitVideo({
        url: isEditMode
          ? `${LETUREYOUTUBE_API.updateById(id)}`
          : `${LETUREYOUTUBE_API.list}`,
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
        navigate("/lecture-youtube");
        queryClient.invalidateQueries({ queryKey: ["lecture-youtube-list"] });
      } else {
        toast.error(res?.msg || "Failed to update leture");
      }
    } catch {
      toast.error(err?.message || "Something went wrong. Please try again.");
    }
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

  if (videoError || youtubeForError) {
    return <ApiErrorPage onRetry={() => fetchData()} />;
  }
  return (
    <div className="mx-6 space-y-6">
      {(loading || youtubeForLoading) && <LoadingBar />}

      <form onSubmit={handleSubmit}>
        <PageHeader
          icon={Youtube}
          title={isEditMode ? "Edit Lecture Youtube" : "Create Lecture Youtube"}
          description="Fill in the lecture youtube  details below to register them"
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
                {isEditMode ? "Update" : "Create"}
              </Button>
            </div>
          }
        />
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">YouTube For *</label>
              <Select
                value={data.youtube_for}
                onValueChange={(v) => setData({ ...data, youtube_for: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select YouTube For" />
                </SelectTrigger>
                <SelectContent>
                  {youtubeForData?.data?.map((item, key) => (
                    <SelectItem key={key} value={item.page_one_url}>
                      {item.page_one_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.youtube_for && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.youtube_for}
                </p>
              )}
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium">Sort Order</label>
              <Input
                type="number"
                min={0}
                className="mt-1"
                value={data.youtube_sort}
                onChange={(e) =>
                  setData({ ...data, youtube_sort: e.target.value })
                }
              />
              {errors.youtube_sort && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.youtube_sort}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Course</label>
              <Select
                value={data.youtube_course}
                onValueChange={(v) => setData({ ...data, youtube_course: v })}
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
            </div>
            <div>
              <label className="text-sm font-medium">PlayList</label>
              <Select
                value={data.youtube_playlist_id}
                onValueChange={(value) => {
                  const selected = playListData?.data?.find(
                    (item) => String(item.id) == String(value),
                  );
                  setData((prev) => ({
                    ...prev,
                    youtube_playlist_id: selected?.id,
                    youtube_language: selected?.youtube_playlist_name || "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select PlayList" />
                </SelectTrigger>
                <SelectContent>
                  {playListData?.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.youtube_playlist_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* <div>
              <label className="text-sm font-medium">Language/PlayList</label>
              <Input
                className="mt-1"
                value={data.youtube_language}
                onChange={(e) =>
                  setData({ ...data, youtube_language: e.target.value })
                }
              />
            </div> */}
            <div className="col-span-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                className="mt-1"
                value={data.youtube_title}
                onChange={(e) =>
                  setData({ ...data, youtube_title: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">YouTube Link *</label>
              <Textarea
                className="mt-1"
                value={data.youtube_link}
                onChange={(e) =>
                  setData({ ...data, youtube_link: e.target.value })
                }
              />
              {errors.youtube_link && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.youtube_link}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <ImageUpload
                id="youtube_image"
                label="YouTube Image"
                required
                selectedFile={data.youtube_image}
                previewImage={preview.youtube_image}
                onFileChange={(e) =>
                  handleImageChange("youtube_image", e.target.files?.[0])
                }
                onRemove={() => handleRemoveImage("youtube_image")}
                error={errors.youtube_image}
                format="WEBP"
                allowedExtensions={["webp"]}
                dimensions="600x300"
                maxSize={5}
                requiredDimensions={[600, 300]}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Image Alt *</label>
              <Textarea
                className="mt-1"
                value={data.youtube_image_alt}
                onChange={(e) =>
                  setData({ ...data, youtube_image_alt: e.target.value })
                }
              />
              {errors.youtube_image_alt && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.youtube_image_alt}
                </p>
              )}
            </div>
            {isEditMode && (
              <div className="flex items-center h-full ml-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Status *</label>

                  <GroupButton
                    className="w-fit"
                    value={data.youtube_status}
                    onChange={(value) =>
                      setData({ ...data, youtube_status: value })
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
        </Card>
      </form>
    </div>
  );
};

export default LectureYoutubeForm;
