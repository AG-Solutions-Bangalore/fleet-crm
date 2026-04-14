import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Image,
  Loader2,
  User,
  Mail,
  Phone,
  FormInput,
  GitBranch,
  Locate,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CLIENT_API, ACTIVE_SERVICE_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import MemoizedSelect from "@/components/common/memoized-select";
import { useQueryClient } from "@tanstack/react-query";
import RedStar from "@/components/RedStar";
import LoadingBar from "@/components/loader/loading-bar";

const CreateClient = ({ isEdit, isRelation = false }) => {
  const { trigger, loading: isSubmitting } = useApiMutation();
  const { trigger: gettrigger, loading: getloading } = useApiMutation();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const m_id_from_state = location.state?.m_id;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    whatsapp: "",
    area: "",
    description: "",
    relation: "",
    status: "Active",
    m_id: null,
    r_id: null,
  });

  const [initialData, setInitialData] = useState(null); // Temp state for comparison
  const [errors, setErrors] = useState({});
  const [serviceOptions, setServiceOptions] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedHideServices, setSelectedHideServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await gettrigger({
          url: ACTIVE_SERVICE_API.list,
          method: "get",
        });
        const mappedServices = (res?.data || []).map((service) => ({
          value: String(service.id),
          label: service.service_name,
        }));
        setServiceOptions(mappedServices);
      } catch (error) {
        toast.error("Failed to load services");
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchClient = async () => {
      try {
        const res = await gettrigger({
          url: CLIENT_API.byId(id),
          method: "get",
        });

        const data = res?.data;

        const fetchedForm = {
          name: data?.name || "",
          email: data?.email || "",
          mobile: data?.mobile || "",
          whatsapp: data?.whatsapp || "",
          area: data?.area || "",
          description: data?.description || "",
          relation: data?.relation || "",
          status: data?.status || "Active",
          m_id: data?.m_id,
          r_id: data?.r_id,
        };

        setFormData(fetchedForm);

        let fetchedServices = [];
        if (data?.services) {
          const servicesArray = data.services.split(",");
          fetchedServices = servicesArray.map((s) => ({
            value: s,
            label:
              serviceOptions.find((opt) => opt.value === s)?.label ||
              `Service ${s}`,
          }));
          setSelectedServices(fetchedServices);
        }

        let fetchedHideServices = [];
        if (data?.hide_services) {
          const hideArray = data.hide_services.split(",");
          fetchedHideServices = hideArray.map((s) => ({
            value: s,
            label:
              serviceOptions.find((opt) => opt.value === s)?.label ||
              `Service ${s}`,
          }));
          setSelectedHideServices(fetchedHideServices);
        }

        // Store copy for comparison
        setInitialData({
          ...fetchedForm,
          services: fetchedServices,
          hide_services: fetchedHideServices,
        });
      } catch {
        toast.error("Failed to fetch client details");
      }
    };

    fetchClient();
  }, [id, serviceOptions.length > 0]);

  // Comparison logic
  const isFormUnchanged = () => {
    if (!isEdit || !initialData) return false;

    const isBaseChanged = Object.keys(formData).some(
      (key) => formData[key] !== initialData[key],
    );

    const isServicesChanged =
      JSON.stringify(selectedServices) !== JSON.stringify(initialData.services);
    const isHideServicesChanged =
      JSON.stringify(selectedHideServices) !==
      JSON.stringify(initialData.hide_services);

    return !isBaseChanged && !isServicesChanged && !isHideServicesChanged;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    let error = "";

    if (name === "name") updatedValue = value.replace(/[^a-zA-Z\s]/g, "");
    if (name === "mobile" || name === "whatsapp")
      updatedValue = value.replace(/\D/g, "").slice(0, 10);

    setErrors((prev) => ({ ...prev, [name]: error }));
    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.mobile || formData.mobile.length !== 10)
      newErrors.mobile = "10 digit mobile required";
    if (selectedServices.length === 0)
      newErrors.services = "Select at least one service";

    const showRelation =
      isRelation || (formData.m_id !== formData.r_id && formData.m_id !== null);
    if (showRelation && !formData.relation)
      newErrors.relation = "Relation is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) formDataObj.append(key, value);
    });

    if (isRelation && m_id_from_state) {
      formDataObj.append("r_id", m_id_from_state);
    }

    formDataObj.append(
      "services",
      selectedServices.map((s) => s.value).join(","),
    );
    formDataObj.append(
      "hide_services",
      selectedHideServices.map((s) => s.value).join(","),
    );

    try {
      const res = await trigger({
        url: isEdit ? CLIENT_API.updateById(id) : CLIENT_API.list,
        method: isEdit ? "put" : "post",
        data: formDataObj,
      });

      if (res?.code === 200 || res?.code === 201) {
        queryClient.invalidateQueries({ queryKey: ["client-list"] });
        toast.success(
          res?.msg ||
            (isEdit
              ? "Client updated successfully"
              : "Client created successfully"),
        );
        navigate(-1);
      } else {
        toast.error(res?.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const errorBorder = (field) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  if (getloading) return <LoadingBar />;

  return (
    <div className="max-w-full mx-auto">
      <PageHeader
        icon={Image}
        title={isEdit ? "Edit Client" : "Add New Client"}
        description="Fill in the details below"
      />

      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="create-client-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label className="flex">
                  <User className="h-3.5 w-5" /> Name <RedStar />
                </Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errorBorder("name")}
                  placeholder="Enter Name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex">
                  <Mail className="h-3.5 w-5" /> Email <RedStar />
                </Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errorBorder("email")}
                  placeholder="Enter Email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex">
                  <Phone className="h-3.5 w-5" /> Mobile <RedStar />
                </Label>
                <Input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={errorBorder("mobile")}
                  placeholder="Enter Mobile"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm">{errors.mobile}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex">
                  <Phone className="h-3.5 w-5" /> Whatsapp
                </Label>
                <Input
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="Enter Whatsapp"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-4" /> Services <RedStar />
                </Label>

                <MemoizedSelect
                  isMulti
                  options={serviceOptions.filter(
                    (service) =>
                      !selectedHideServices?.some(
                        (hidden) => hidden.value === service.value,
                      ),
                  )}
                  value={selectedServices}
                  onChange={setSelectedServices}
                />

                {errors.services && (
                  <p className="text-red-500 text-sm">{errors.services}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-4" /> Hide Services
                </Label>

                <MemoizedSelect
                  isMulti
                  options={serviceOptions.filter(
                    (service) =>
                      !selectedServices?.some(
                        (selected) => selected.value === service.value,
                      ),
                  )}
                  value={selectedHideServices}
                  onChange={setSelectedHideServices}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex">
                  <Locate className="h-3.5 w-5" /> Area
                </Label>
                <Input
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Enter Area"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                className={`space-y-2 md:col-span-2 ${isEdit ? "md:col-span-2" : "md:col-span-3"}`}
              >
                <Label className="flex">
                  <FormInput className="h-3.5 w-5" /> Description
                </Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Type Your Description Here..."
                />
              </div>

              {(isRelation ||
                (formData.m_id !== formData.r_id &&
                  formData.m_id !== null)) && (
                <div className="space-y-2">
                  <Label className="flex">
                    <GitBranch className="h-3.5 w-5" /> Relation <RedStar />
                  </Label>
                  <Input
                    name="relation"
                    value={formData.relation}
                    onChange={handleInputChange}
                    className={errorBorder("relation")}
                    placeholder="Enter Relation"
                  />
                  {errors.relation && (
                    <p className="text-red-500 text-sm">{errors.relation}</p>
                  )}
                </div>
              )}

              {isEdit && (
                <div className="space-y-2">
                  <Label className="flex">
                    <GitBranch className="h-3.5 w-5" /> Status
                  </Label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border rounded-md h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (isEdit && isFormUnchanged())}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : isEdit ? (
                  "Update Client"
                ) : (
                  "Create Client"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateClient;
