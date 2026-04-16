import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  User,
  Loader2,
  FileText,
  ImageIcon,
  Printer,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import BASE_URL from "@/config/base-url";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import ImageCell from "@/components/common/ImageCell";
import moment from "moment";

const ViewDriver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["driver", id],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/driver/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!id,
  });

  const driver = response?.data || {};
  const imageUrlArray = response?.image_url || [];
  const driverImageBaseUrl = getImageBaseUrl(imageUrlArray, "Driver");
  const noImageUrl = getNoImageUrl(imageUrlArray);

  const resolveImage = (fileName) => {
    if (!fileName) return noImageUrl;
    if (fileName.startsWith("http")) return fileName;
    return `${driverImageBaseUrl}${fileName}`;
  };

  const formatDate = (date) => {
    if (!date || date === "0000-00-00") return "N/A";
    const m = moment(date);
    return m.isValid() ? m.format("DD-MM-YYYY") : "N/A";
  };

  const DisplayField = ({ label, value }) => (
    <div className="space-y-1">
      <Label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider doc-field-label">
        {label}
      </Label>
      <div className="text-sm font-semibold text-gray-900 break-all doc-field-value min-h-[1.5rem] flex items-center border-b border-gray-50 pb-0.5">
        {value || (
          <span className="text-gray-300 font-normal italic text-xs">N/A</span>
        )}
      </div>
    </div>
  );

  const DocumentImage = ({ label, fileName }) => (
    <div className="space-y-2 border p-3 rounded-lg bg-gray-50/30 shadow-sm hover:shadow-md transition-shadow">
      <Label className="text-xs font-bold text-gray-600 block text-center uppercase tracking-wider">
        {label}
      </Label>
      <div className="relative aspect-square rounded-md overflow-hidden border-2 border-white shadow-inner bg-white">
        <ImageCell
          src={resolveImage(fileName)}
          fallback={noImageUrl}
          alt={label}
          className="w-full h-full object-contain p-1"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
          Loading Profile...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 max-w-lg mx-auto">
        <Card className="border-red-100 bg-red-50/30">
          <CardContent className="pt-8 flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-700">
                Profile Not Found
              </h2>
              <p className="text-sm text-red-600/70">
                The driver record could not be retrieved at this time.
              </p>
            </div>
            <Button
              onClick={() => navigate("/driver")}
              variant="outline"
              size="sm"
              className="mt-4 border-red-200 hover:bg-red-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-4 animate-in fade-in duration-700 printable-document bg-white">
      {/* Report Header (Visible on Screen & Print) */}
      <div className="flex items-center justify-between no-print">
        <Button
          onClick={() => navigate("/driver")}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 font-bold border-gray-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={() => window.print()}
          variant="default"
          size="sm"
          className="flex items-center gap-1.5 font-bold shadow-sm bg-gray-900 text-white hover:bg-gray-800"
        >
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>
      <div className="text-center border-b-2 border-[var(--team-color)] pb-4 mb-6 print:mb-2 print:pb-2">
        <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900">
          Driver Information
        </h1>
      </div>

      {/* Top Header Card */}
      <Card className="border-none shadow-sm ring-1 ring-gray-100 print:ring-0 print:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 print:p-0">
          <div className="flex items-start gap-4 w-full px-2">
            <div className="w-12 h-12 rounded-xl bg-blue-50/50 flex items-center justify-center flex-shrink-0 border border-blue-100 overflow-hidden shadow-inner print:border-gray-300">
              <ImageCell
                src={resolveImage(driver.selfie_image)}
                fallback={noImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                  {driver.full_name}
                </h1>
                <div
                  className={`px-2 w-fit rounded-full ${driver.status === "Active" ? "bg-green-500" : "bg-red-500"}`}
                >
                  {driver.status}
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900 min-h-[1.5rem] flex items-center pb-0.5">
                  {driver.email}
                </span>
                <div className="flex justify-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 min-h-[1.5rem] flex items-center pb-0.5">
                    {driver.mobile}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 min-h-[1.5rem] flex items-center pb-0.5">
                    {driver.alternate_mobile_no}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0 no-print"></div>
        </div>
      </Card>

      {/* Main Content Card */}
      <Card className="border-none shadow-none print:shadow-none print:ring-0">
        <CardContent className="p-6 space-y-8 print:p-0 pt-2">
          {/* Section 1: Driver Details */}
          <div className="space-y-4">
            <div className="flex items-center p-2.5 gap-2 text-sm rounded-lg font-bold bg-[var(--team-color)] text-white uppercase tracking-widest doc-section-header">
              <User className="w-4 h-4" />
              Driver Details
            </div>
            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DisplayField
                label="Date of Birth"
                value={formatDate(driver.dob)}
              />
              <DisplayField
                label="Joining Date"
                value={formatDate(driver.doj)}
              />
              <DisplayField label="Father Name" value={driver.father_name} />
            </div>
          </div>

          {/* Section 2: License & Background */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center p-2.5 gap-2 text-sm rounded-lg font-bold bg-[var(--team-color)] text-white uppercase tracking-widest doc-section-header">
              <FileText className="w-4 h-4" />
              License & Background Details
            </div>
            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DisplayField label="Aadhar No" value={driver.aadhar_no} />
              <DisplayField label="DL Number" value={driver.dl_no} />
              <DisplayField
                label="DL Issue Date"
                value={formatDate(driver.dl_issue_date)}
              />
              <DisplayField
                label="DL Expiry Date"
                value={formatDate(driver.dl_expiry_date)}
              />

              <DisplayField label="DL Submitted" value={driver.dl_submitted} />
              <DisplayField label="PCC Status" value={driver.pcc_status} />
              <DisplayField
                label="Previous Company"
                value={driver.you_worked_before_company}
              />
              <DisplayField
                label="Driving Experience"
                value={driver.driving_experience}
              />
            </div>
          </div>

          {/* Section 3: Contact & Bank Details */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center p-2.5 gap-2 text-sm rounded-lg font-bold bg-[var(--team-color)] text-white uppercase tracking-widest doc-section-header">
              <FileText className="w-4 h-4" />
              Contact & Bank Details
            </div>
            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DisplayField
                label="Emergency Contact Name"
                value={driver.emergency_contact_name}
              />
              <DisplayField
                label="Emergency Contact No"
                value={driver.emergency_contact_no}
              />
              <DisplayField label="Refer By" value={driver.referby} />
              <DisplayField
                label="Refer By Mobile"
                value={driver.referby_mobile}
              />

              <DisplayField
                label="Bank Holder Name"
                value={driver.name_as_per_bank}
              />
              <DisplayField label="Account Number" value={driver.account_no} />
              <DisplayField label="Bank Name" value={driver.bank_name} />
              <DisplayField label="IFSC Code" value={driver.ifsc_code} />
            </div>
          </div>

          {/* Section 4: Remarks */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center p-2.5 gap-2 text-sm rounded-lg font-bold bg-[var(--team-color)] text-white uppercase tracking-widest doc-section-header">
              <FileText className="w-4 h-4" />
              Remarks
            </div>
            <div className="p-4 bg-gray-50/50 rounded-lg text-sm text-gray-700 font-medium italic min-h-[4rem] flex items-center shadow-inner print:shadow-none print:border-gray-200">
              {driver.remarks || "N/A"}
            </div>
          </div>

          {/* Section 5: Documents */}
          <div className="space-y-4 pt-2 print:pt-0">
            <div className="flex items-center p-2.5 gap-2 text-sm rounded-lg font-bold bg-[var(--team-color)] text-white uppercase tracking-widest doc-section-header">
              <ImageIcon className="w-4 h-4" />
              Document Uploads
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <DocumentImage label="Selfie" fileName={driver.selfie_image} />
              <DocumentImage
                label="Aadhar Front"
                fileName={driver.aadhar_front_image}
              />
              <DocumentImage
                label="Aadhar Back"
                fileName={driver.aadhar_back_image}
              />
              <DocumentImage
                label="DL Front"
                fileName={driver.driving_licence_front_image}
              />
              <DocumentImage
                label="DL Back"
                fileName={driver.driving_licence_back_image}
              />
              <DocumentImage label="Pan Card" fileName={driver.pancard_image} />
              <DocumentImage
                label="Bank Passbook"
                fileName={driver.bank_passbook_cancelled_cheque_image}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewDriver;
