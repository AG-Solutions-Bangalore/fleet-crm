import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MinusCircle, Plus, Trash2 } from "lucide-react";
import ImageUpload from "@/components/image-upload/image-upload";

const ServiceSubForm = ({
  subs,
  isEdit,
  handleAddSub,
  handleRemoveSub,
  handleSubChange,
  handleSubImageChange,
  handleRemoveSubImage,
  handleDeleteSubApi,
  errors,
}) => {
  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <Label className="text-lg font-semibold">Sub Services</Label>
        <Button
          type="button"
          size="sm"
          onClick={handleAddSub}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Sub Service
        </Button>
      </div>

      {subs.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No sub services added yet.
        </p>
      ) : (
        <Card className="mt-2 border-0 shadow-none">
          <CardContent className="p-0">
            <div className="space-y-4">
              {subs.map((sub, index) => {
                return (
                  <div
                    key={index}
                    className="border rounded-lg p-3 space-y-2 relative bg-gray-50/50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Sub Service #{index + 1}</h4>
                      <div className="flex gap-4 items-center">
                        {isEdit && (
                          <div className="flex items-center gap-2">
                            {/* No status for sub services */}
                          </div>
                        )}

                        {sub.id && handleDeleteSubApi ? (
                          subs.length <= 1 ? (
                            <Trash2 className="h-5 w-5 text-gray-300 cursor-not-allowed" />
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Trash2 className="h-5 w-5 text-red-500 cursor-pointer hover:text-red-700 transition-colors" />
                              </AlertDialogTrigger>

                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Sub Service?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the sub service.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() =>
                                      handleDeleteSubApi(index, sub.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )
                        ) : (
                          <MinusCircle
                            className={`h-5 w-5 transition-colors ${
                              subs.length <= 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-red-500 cursor-pointer hover:text-red-700"
                            }`}
                            onClick={() =>
                              subs.length > 1 && handleRemoveSub(index)
                            }
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label>
                          Link
                        </Label>
                        <Input
                          placeholder="Enter Link (e.g., https://...)"
                          value={sub.service_sub_link}
                          onChange={(e) =>
                            handleSubChange(
                              index,
                              "service_sub_link",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      {isEdit && (
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={sub.service_sub_status || "Active"}
                            onValueChange={(value) =>
                              handleSubChange(
                                index,
                                "service_sub_status",
                                value,
                              )
                            }
                          >
                            <SelectTrigger
                              className={`h-10 w-full ${
                                sub.service_sub_status === "Active" ||
                                !sub.service_sub_status
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                              }`}
                            >
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value="Active"
                                className="text-green-700"
                              >
                                Active
                              </SelectItem>
                              <SelectItem
                                value="Inactive"
                                className="text-red-700"
                              >
                                Inactive
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div
                        className={`space-y-2 ${isEdit ? "lg:col-span-2" : ""}`}
                      >
                        <ImageUpload
                          id={`service_sub_banner_${index}`}
                          label="Banner"
                          previewImage={sub.preview_banner}
                          selectedFile={sub.service_sub_banner}
                          onFileChange={(e) =>
                            handleSubImageChange(index, e.target.files?.[0])
                          }
                          onRemove={() => handleRemoveSubImage(index)}
                          format="WEBP"
                          maxSize={5}
                          allowedExtensions={["webp", "png", "jpg", "jpeg"]}
                          required
                        />
                        {errors?.subs?.[index]?.service_sub_banner && (
                          <p className="text-red-500 text-sm">
                            {errors.subs[index].service_sub_banner}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceSubForm;
