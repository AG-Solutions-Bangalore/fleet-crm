import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { AlertCircle, ArrowLeft, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BASE_URL from "@/config/base-url";
import ImageUpload from "@/components/image-upload/image-upload";
import { Textarea } from "@/components/ui/textarea";

const CreateDriver = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = Cookies.get("token");

  const [isDuplicate, setIsDuplicate] = useState(false);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [driver, setDriver] = useState({
    UUID: "",
    name: "",
    surname: "",
    email: "",
    mobile: "",
    aadhar_no: "",
    dl_expiry_date: "",
    dl_submitted: "",
    pcc_status: "",
    doj: "",
    status: "Active",
    uid_match_status: "Matched",

    alternate_mobile_no: "",
    name_as_per_bank: "",
    account_no: "",
    bank_name: "",
    ifsc_code: "",
    father_name: "",
    dob: "",
    dl_no: "",
    dl_issue_date: "",
    you_worked_before_company: "",
    driving_experience: "",
    referby: "",
    referby_mobile: "",
    emergency_contact_name: "",
    emergency_contact_no: "",
    remarks: "",

    selfie_image: null,
    aadhar_front_image: null,
    aadhar_back_image: null,
    driving_licence_front_image: null,
    driving_licence_back_image: null,
    pancard_image: null,
    bank_passbook_cancelled_cheque_image: null,
  });

  const [preview, setPreview] = useState({
    selfie_image: "",
    aadhar_front_image: "",
    aadhar_back_image: "",
    driving_licence_front_image: "",
    driving_licence_back_image: "",
    pancard_image: "",
    bank_passbook_cancelled_cheque_image: "",
  });

  const handleImageChange = (fieldName, file) => {
    if (file) {
      setDriver((prev) => ({ ...prev, [fieldName]: file }));
      const url = URL.createObjectURL(file);
      setPreview((prev) => ({ ...prev, [fieldName]: url }));
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleRemoveImage = (fieldName) => {
    setDriver((prev) => ({ ...prev, [fieldName]: null }));
    setPreview((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const validateOnlyDigits = (inputtxt) => {
    const phoneno = /^\d+$/;
    return inputtxt.match(phoneno) || inputtxt.length === 0;
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      if (validateOnlyDigits(value)) {
        setDriver((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setDriver((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const requiredFields = [
      "name",
      "surname",
      "email",
      "mobile",
      "alternate_mobile_no",
      "dob",
      "father_name",
      "doj",
      "aadhar_no",
      "dl_no",
      "dl_issue_date",
      "dl_expiry_date",
      "dl_submitted",
      "pcc_status",
      "you_worked_before_company",
      "driving_experience",
      "selfie_image",
      "aadhar_back_image",
      "driving_licence_front_image",
      "driving_licence_back_image",
      "pancard_image",
      "bank_passbook_cancelled_cheque_image",
    ];

    requiredFields.forEach((field) => {
      const val = driver[field];
      if (
        val === "" ||
        val === null ||
        val === undefined ||
        (typeof val === "string" && !val.trim())
      ) {
        newErrors[field] = `${field.replace(/_/g, " ")} is required`;
        isValid = false;
      }
    });

    const phoneFields = [
      "mobile",
      "alternate_mobile_no",
      "referby_mobile",
      "emergency_contact_no",
    ];
    phoneFields.forEach((field) => {
      if (driver[field] && !/^\d{10}$/.test(driver[field])) {
        newErrors[field] = "Valid 10-digit Number is required";
        isValid = false;
      }
    });

    if (driver.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driver.email)) {
      newErrors.email = "Valid Email is required";
      isValid = false;
    }

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  };

  const createDriverMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(`${BASE_URL}/api/driver`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.code === 201) {
        queryClient.invalidateQueries(["drivers"]);
        toast.success(data.message || "Driver Created Successfully");

        setDriver({
          UUID: "",
          name: "",
          surname: "",
          email: "",
          mobile: "",
          aadhar_no: "",
          dl_expiry_date: "",
          dl_submitted: "",
          pcc_status: "",
          doj: "",
          status: "Active",
          uid_match_status: "Matched",

          alternate_mobile_no: "",
          name_as_per_bank: "",
          account_no: "",
          bank_name: "",
          ifsc_code: "",
          father_name: "",
          dob: "",
          dl_no: "",
          dl_issue_date: "",
          you_worked_before_company: "",
          driving_experience: "",
          referby: "",
          referby_mobile: "",
          emergency_contact_name: "",
          emergency_contact_no: "",
          remarks: "",

          selfie_image: null,
          aadhar_front_image: null,
          aadhar_back_image: null,
          driving_licence_front_image: null,
          driving_licence_back_image: null,
          pancard_image: null,
          bank_passbook_cancelled_cheque_image: null,
        });
        setPreview({
          selfie_image: "",
          aadhar_front_image: "",
          aadhar_back_image: "",
          driving_licence_front_image: "",
          driving_licence_back_image: "",
          pancard_image: "",
          bank_passbook_cancelled_cheque_image: "",
        });

        navigate("/driver");
      } else {
        toast.error(data.message || "Driver Creation Error");
      }
    },
    onError: (error) => {
      console.error("Driver Creation Error:", error.response?.data?.message);
      toast.error(error.response?.data?.message || "Driver Creation Error");
    },
    onSettled: () => {
      setIsButtonDisabled(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateForm();

    if (!isValid) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(driver).forEach((key) => {
        if (!key.includes("image")) {
          formData.append(key, driver[key] || "");
        }
      });

      const imageFields = [
        "selfie_image",
        "aadhar_front_image",
        "aadhar_back_image",
        "driving_licence_front_image",
        "driving_licence_back_image",
        "pancard_image",
        "bank_passbook_cancelled_cheque_image",
      ];
      imageFields.forEach((field) => {
        if (driver[field] instanceof File) {
          formData.append(field, driver[field]);
        }
      });

      setIsButtonDisabled(true);
      createDriverMutation.mutate(formData);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred during submission");
      setIsButtonDisabled(false);
    }
  };

  return (
    <div className="w-full space-y-1 p-4">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <User className="text-muted-foreground w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-md font-semibold text-gray-900">
                    Add Driver
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Create a new driver record
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/driver")}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 flex-shrink-0 mt-2 sm:mt-0"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </Button>
        </div>
      </Card>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <div className="flex items-center p-1 gap-2 text-sm rounded-md px-1 font-medium bg-[var(--team-color)] text-white">
                <User className="w-4 h-4" />
                Driver Details
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="">
                  <Label htmlFor="UUID" className="text-xs font-medium">
                    UUID
                  </Label>
                  <Input
                    id="UUID"
                    name="UUID"
                    value={driver.UUID}
                    onChange={onInputChange}
                    placeholder="Enter UUID"
                  />
                </div>

                <div className="">
                  <Label htmlFor="name" className="text-xs font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={driver.name}
                    onChange={onInputChange}
                    className={isDuplicate ? "border-red-500" : ""}
                    placeholder="Enter driver name"
                  />
                  {errors?.name && (
                    <p className="text-red-500 text-xs">{errors.name}</p>
                  )}
                  {isDuplicate && (
                    <div className="flex items-center gap-1 text-red-500 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      Duplicate driver: Name already exists
                    </div>
                  )}
                </div>

                <div className="">
                  <Label htmlFor="surname" className="text-xs font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="surname"
                    name="surname"
                    value={driver.surname}
                    onChange={onInputChange}
                    placeholder="Enter surname"
                  />
                  {errors?.surname && (
                    <p className="text-red-500 text-xs">{errors.surname}</p>
                  )}
                </div>

                <div className="">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={driver.email}
                    onChange={onInputChange}
                    placeholder="Enter email address"
                  />
                  {errors?.email && (
                    <p className="text-red-500 text-xs">{errors.email}</p>
                  )}
                </div>

                <div className="col-span-full grid grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="mobile" className="text-xs font-medium">
                      Mobile *
                    </Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={driver.mobile}
                      onChange={onInputChange}
                      maxLength={10}
                      placeholder="Enter mobile number"
                      className={isDuplicate ? "border-red-500" : ""}
                    />
                    {errors?.mobile && (
                      <p className="text-red-500 text-xs">{errors.mobile}</p>
                    )}
                    {isDuplicate && (
                      <div className="flex items-center gap-1 text-red-500 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        Duplicate driver: Mobile already exists
                      </div>
                    )}
                  </div>

                  <div className="">
                    <Label
                      htmlFor="alternate_mobile_no"
                      className="text-xs font-medium"
                    >
                      Alternate Mobile *
                    </Label>
                    <Input
                      id="alternate_mobile_no"
                      name="alternate_mobile_no"
                      type="tel"
                      value={driver.alternate_mobile_no}
                      onChange={onInputChange}
                      maxLength={10}
                      placeholder="Enter mobile number"
                    />
                    {errors?.alternate_mobile_no && (
                      <p className="text-red-500 text-xs">
                        {errors.alternate_mobile_no}
                      </p>
                    )}
                  </div>

                  <div className="">
                    <Label htmlFor="dob" className="text-xs font-medium">
                      Date Of Birth *
                    </Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={driver.dob}
                      onChange={onInputChange}
                    />
                    {errors?.dob && (
                      <p className="text-red-500 text-xs">{errors.dob}</p>
                    )}
                  </div>

                  <div className="">
                    <Label
                      htmlFor="father_name"
                      className="text-xs font-medium"
                    >
                      Father Name *
                    </Label>
                    <Input
                      id="father_name"
                      name="father_name"
                      value={driver.father_name}
                      onChange={onInputChange}
                      placeholder="Enter father's name"
                    />
                    {errors?.father_name && (
                      <p className="text-red-500 text-xs">
                        {errors.father_name}
                      </p>
                    )}
                  </div>

                  <div className="">
                    <Label htmlFor="doj" className="text-xs font-medium">
                      Date of Joining *
                    </Label>
                    <Input
                      id="doj"
                      name="doj"
                      type="date"
                      value={driver.doj}
                      onChange={onInputChange}
                    />
                    {errors?.doj && (
                      <p className="text-red-500 text-xs">{errors.doj}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center p-1 gap-2 text-sm rounded-md px-1 font-medium bg-[var(--team-color)] text-white mt-4">
                <User className="w-4 h-4" />
                License & Background Details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                <div className="">
                  <Label htmlFor="aadhar_no" className="text-xs font-medium">
                    Aadhar No *
                  </Label>
                  <Input
                    id="aadhar_no"
                    name="aadhar_no"
                    value={driver.aadhar_no}
                    onChange={onInputChange}
                    placeholder="Enter Aadhar number"
                  />
                  {errors?.aadhar_no && (
                    <p className="text-red-500 text-xs">{errors.aadhar_no}</p>
                  )}
                </div>
                <div className="">
                  <Label htmlFor="dl_no" className="text-xs font-medium">
                    DL No *
                  </Label>
                  <Input
                    id="dl_no"
                    name="dl_no"
                    placeholder="Enter DL number"
                    value={driver.dl_no}
                    onChange={onInputChange}
                  />
                  {errors?.dl_no && (
                    <p className="text-red-500 text-xs">{errors.dl_no}</p>
                  )}
                </div>
                <div className="">
                  <Label
                    htmlFor="dl_issue_date"
                    className="text-xs font-medium"
                  >
                    DL Issue Date *
                  </Label>
                  <Input
                    id="dl_issue_date"
                    name="dl_issue_date"
                    type="date"
                    value={driver.dl_issue_date}
                    onChange={onInputChange}
                  />
                  {errors?.dl_issue_date && (
                    <p className="text-red-500 text-xs">
                      {errors.dl_issue_date}
                    </p>
                  )}
                </div>
                <div className="">
                  <Label
                    htmlFor="dl_expiry_date"
                    className="text-xs font-medium"
                  >
                    DL Expiry Date *
                  </Label>
                  <Input
                    id="dl_expiry_date"
                    name="dl_expiry_date"
                    type="date"
                    value={driver.dl_expiry_date}
                    onChange={onInputChange}
                  />
                  {errors?.dl_expiry_date && (
                    <p className="text-red-500 text-xs">
                      {errors.dl_expiry_date}
                    </p>
                  )}
                </div>

                <div className="">
                  <Label htmlFor="dl_submitted" className="text-xs font-medium">
                    DL Submitted *
                  </Label>
                  <Select
                    value={driver.dl_submitted}
                    onValueChange={(value) =>
                      setDriver((prev) => ({ ...prev, dl_submitted: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors?.dl_submitted && (
                    <p className="text-red-500 text-xs">
                      {errors.dl_submitted}
                    </p>
                  )}
                </div>

                <div className="">
                  <Label htmlFor="pcc_status" className="text-xs font-medium">
                    Do You Have PCC Certificate? *
                  </Label>
                  <Select
                    value={driver.pcc_status}
                    onValueChange={(value) =>
                      setDriver((prev) => ({ ...prev, pcc_status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors?.pcc_status && (
                    <p className="text-red-500 text-xs">{errors.pcc_status}</p>
                  )}
                </div>

                <div className="">
                  <Label
                    htmlFor="you_worked_before_company"
                    className="text-xs font-medium"
                  >
                    Worked Before Company *
                  </Label>
                  <Select
                    value={driver.you_worked_before_company}
                    onValueChange={(value) =>
                      setDriver((prev) => ({
                        ...prev,
                        you_worked_before_company: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ola">Ola</SelectItem>
                      <SelectItem value="Uber">Uber</SelectItem>
                      <SelectItem value="Rapido">Rapido</SelectItem>
                      <SelectItem value="Blusmart">Blusmart</SelectItem>
                      <SelectItem value="Quick Ride">Quick Ride</SelectItem>
                      <SelectItem value="Namma Yatri">Namma Yatri</SelectItem>
                      <SelectItem value="Shofer">Shofer</SelectItem>
                      <SelectItem value="Airport Taxi">Airport Taxi</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors?.you_worked_before_company && (
                    <p className="text-red-500 text-xs">
                      {errors.you_worked_before_company}
                    </p>
                  )}
                </div>

                <div className="">
                  <Label
                    htmlFor="driving_experience"
                    className="text-xs font-medium"
                  >
                    Driving Experience *
                  </Label>
                  <Select
                    id="driving_experience"
                    name="driving_experience"
                    value={driver.driving_experience}
                    onValueChange={(value) =>
                      setDriver((prev) => ({
                        ...prev,
                        driving_experience: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Below 1 Year">Below 1 Year</SelectItem>
                      <SelectItem value="Below 2 Years">
                        Below 2 Years
                      </SelectItem>
                      <SelectItem value="Below 3 Years">
                        Below 3 Years
                      </SelectItem>
                      <SelectItem value="Below 4 Years">
                        Below 4 Years
                      </SelectItem>
                      <SelectItem value="Below 5 Years">
                        Below 5 Years
                      </SelectItem>
                      <SelectItem value="Above 5 Years">
                        Above 5 Years
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors?.driving_experience && (
                    <p className="text-red-500 text-xs">
                      {errors.driving_experience}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center p-1 gap-2 text-sm rounded-md px-1 font-medium bg-[var(--team-color)] text-white mt-4">
                <User className="w-4 h-4" />
                Contact & Bank Details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                <div className="">
                  <Label
                    htmlFor="emergency_contact_name"
                    className="text-xs font-medium"
                  >
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergency_contact_name"
                    name="emergency_contact_name"
                    placeholder="Enter emergency contact name"
                    value={driver.emergency_contact_name}
                    onChange={onInputChange}
                  />
                  {errors?.emergency_contact_name && (
                    <p className="text-red-500 text-xs">
                      {errors.emergency_contact_name}
                    </p>
                  )}
                </div>
                <div className="">
                  <Label
                    htmlFor="emergency_contact_no"
                    className="text-xs font-medium"
                  >
                    Emergency Contact No
                  </Label>
                  <Input
                    id="emergency_contact_no"
                    name="emergency_contact_no"
                    type="tel"
                    maxLength={10}
                    placeholder="Enter emergency contact number"
                    value={driver.emergency_contact_no}
                    onChange={onInputChange}
                  />
                  {errors?.emergency_contact_no && (
                    <p className="text-red-500 text-xs">
                      {errors.emergency_contact_no}
                    </p>
                  )}
                </div>
                <div className="">
                  <Label htmlFor="referby" className="text-xs font-medium">
                    Refer By
                  </Label>
                  <Input
                    id="referby"
                    name="referby"
                    placeholder="Enter refer by"
                    value={driver.referby}
                    onChange={onInputChange}
                  />
                  {errors?.referby && (
                    <p className="text-red-500 text-xs">{errors.referby}</p>
                  )}
                </div>
                <div className="">
                  <Label
                    htmlFor="referby_mobile"
                    className="text-xs font-medium"
                  >
                    Refer By Mobile
                  </Label>
                  <Input
                    id="referby_mobile"
                    name="referby_mobile"
                    type="tel"
                    maxLength={10}
                    placeholder="Enter refer by mobile"
                    value={driver.referby_mobile}
                    onChange={onInputChange}
                  />
                  {errors?.referby_mobile && (
                    <p className="text-red-500 text-xs">
                      {errors.referby_mobile}
                    </p>
                  )}
                </div>

                <div className="">
                  <Label
                    htmlFor="name_as_per_bank"
                    className="text-xs font-medium"
                  >
                    Name As Per Bank
                  </Label>
                  <Input
                    id="name_as_per_bank"
                    name="name_as_per_bank"
                    placeholder="Enter name as per bank"
                    value={driver.name_as_per_bank}
                    onChange={onInputChange}
                  />
                  {errors?.name_as_per_bank && (
                    <p className="text-red-500 text-xs">
                      {errors.name_as_per_bank}
                    </p>
                  )}
                </div>
                <div className="">
                  <Label htmlFor="bank_name" className="text-xs font-medium">
                    Bank Name
                  </Label>
                  <Input
                    id="bank_name"
                    name="bank_name"
                    placeholder="Enter bank name"
                    value={driver.bank_name}
                    onChange={onInputChange}
                  />
                  {errors?.bank_name && (
                    <p className="text-red-500 text-xs">{errors.bank_name}</p>
                  )}
                </div>
                <div className="">
                  <Label htmlFor="account_no" className="text-xs font-medium">
                    Account No
                  </Label>
                  <Input
                    id="account_no"
                    name="account_no"
                    placeholder="Enter account number"
                    value={driver.account_no}
                    onChange={onInputChange}
                  />
                  {errors?.account_no && (
                    <p className="text-red-500 text-xs">{errors.account_no}</p>
                  )}
                </div>
                <div className="">
                  <Label htmlFor="ifsc_code" className="text-xs font-medium">
                    IFSC Code
                  </Label>
                  <Input
                    id="ifsc_code"
                    name="ifsc_code"
                    placeholder="Enter IFSC code"
                    value={driver.ifsc_code}
                    onChange={onInputChange}
                  />
                  {errors?.ifsc_code && (
                    <p className="text-red-500 text-xs">{errors.ifsc_code}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center p-1 gap-2 text-sm rounded-md px-1 font-medium bg-[var(--team-color)] text-white mt-4">
                <User className="w-4 h-4" />
                Documents Upload
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                <div className="">
                  <ImageUpload
                    id="selfie_image"
                    label="Selfie Image"
                    required={true}
                    previewImage={preview.selfie_image}
                    onFileChange={(e) =>
                      handleImageChange("selfie_image", e.target.files?.[0])
                    }
                    onRemove={() => handleRemoveImage("selfie_image")}
                    error={errors.selfie_image}
                    format="WEBP"
                    maxSize={5}
                    allowedExtensions={["webp", "jpg", "jpeg", "png"]}
                  />
                </div>

                <div className="">
                  <ImageUpload
                    id="aadhar_front_image"
                    label="Aadhar Front"
                    previewImage={preview.aadhar_front_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "aadhar_front_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() => handleRemoveImage("aadhar_front_image")}
                    error={errors.aadhar_front_image}
                    format="WEBP"
                    maxSize={5}
                    allowedExtensions={["webp", "jpg", "jpeg", "png"]}
                  />
                </div>

                <div className="">
                  <ImageUpload
                    id="aadhar_back_image"
                    label="Aadhar Back"
                    required={true}
                    previewImage={preview.aadhar_back_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "aadhar_back_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() => handleRemoveImage("aadhar_back_image")}
                    error={errors.aadhar_back_image}
                    format="WEBP"
                    maxSize={5}
                    allowedExtensions={["webp", "jpg", "jpeg", "png"]}
                  />
                </div>

                <div className="">
                  <ImageUpload
                    id="driving_licence_front_image"
                    label="DL Front"
                    required={true}
                    previewImage={preview.driving_licence_front_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "driving_licence_front_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() =>
                      handleRemoveImage("driving_licence_front_image")
                    }
                    error={errors.driving_licence_front_image}
                    format="WEBP"
                    maxSize={5}
                    allowedExtensions={["webp", "jpg", "jpeg", "png"]}
                  />
                </div>

                <div className="">
                  <ImageUpload
                    id="driving_licence_back_image"
                    label="DL Back"
                    required={true}
                    previewImage={preview.driving_licence_back_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "driving_licence_back_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() =>
                      handleRemoveImage("driving_licence_back_image")
                    }
                    error={errors.driving_licence_back_image}
                    format="WEBP"
                    maxSize={5}
                    allowedExtensions={["webp", "jpg", "jpeg", "png"]}
                  />
                </div>

                <div className="">
                  <ImageUpload
                    id="pancard_image"
                    label="PAN Card"
                    required={true}
                    previewImage={preview.pancard_image}
                    onFileChange={(e) =>
                      handleImageChange("pancard_image", e.target.files?.[0])
                    }
                    onRemove={() => handleRemoveImage("pancard_image")}
                    error={errors.pancard_image}
                    format="WEBP"
                    maxSize={5}
                    allowedExtensions={["webp", "jpg", "jpeg", "png"]}
                  />
                </div>

                <div className="">
                  <ImageUpload
                    id="bank_passbook_cancelled_cheque_image"
                    label="Bank Proof (Passbook/Cheque)"
                    required={true}
                    previewImage={preview.bank_passbook_cancelled_cheque_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "bank_passbook_cancelled_cheque_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() =>
                      handleRemoveImage("bank_passbook_cancelled_cheque_image")
                    }
                    error={errors.bank_passbook_cancelled_cheque_image}
                    format="WEBP"
                    maxSize={5}
                    allowedExtensions={["webp", "jpg", "jpeg", "png"]}
                  />
                </div>
                <div className="col-span-full">
                  <Label htmlFor="remarks" className="text-xs font-medium">
                    Remarks
                  </Label>
                  <Textarea
                    id="remarks"
                    name="remarks"
                    value={driver.remarks}
                    onChange={onInputChange}
                    placeholder="Enter remarks..."
                  />
                  {errors?.remarks && (
                    <p className="text-red-500 text-xs">{errors.remarks}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="submit"
                disabled={isButtonDisabled || createDriverMutation.isPending}
                className="flex items-center gap-2"
              >
                {createDriverMutation.isPending ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    Create Driver
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/driver")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateDriver;
