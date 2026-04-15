import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowLeft, User, Loader2, FileText, ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import BASE_URL from "@/config/base-url";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import ImageCell from "@/components/common/ImageCell";

const ViewDriver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const { data: response, isLoading, isError } = useQuery({
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

  const DisplayField = ({ label, value }) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-gray-500 uppercase tracking-tighter">{label}</Label>
      <div className="p-2 bg-gray-50/50 border border-gray-100 rounded-md text-sm font-medium min-h-[2.25rem] flex items-center break-all shadow-sm">
        {value || <span className="text-gray-300 font-normal italic text-xs">N/A</span>}
      </div>
    </div>
  );

  const DocumentImage = ({ label, fileName }) => (
    <div className="space-y-2 border p-3 rounded-lg bg-gray-50/30 shadow-sm hover:shadow-md transition-shadow">
      <Label className="text-xs font-bold text-gray-600 block text-center uppercase tracking-wider">{label}</Label>
      <div className="relative aspect-video rounded-md overflow-hidden border-2 border-white shadow-inner bg-white">
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
        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Loading Profile...</p>
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
               <h2 className="text-lg font-bold text-red-700">Profile Not Found</h2>
               <p className="text-sm text-red-600/70">The driver record could not be retrieved at this time.</p>
             </div>
             <Button onClick={() => navigate("/driver")} variant="outline" size="sm" className="mt-4 border-red-200 hover:bg-red-50">
               <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
             </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 p-4 animate-in fade-in duration-700">
      {/* Top Header Card */}
      <Card className="border-none shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50/50 flex items-center justify-center flex-shrink-0 border border-blue-100 overflow-hidden shadow-inner">
               <ImageCell 
                src={resolveImage(driver.selfie_image)} 
                fallback={noImageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">{driver.full_name}</h1>
                <div className={`w-2 h-2 rounded-full ${driver.status === "Active" ? "bg-green-500" : "bg-red-500"}`} title={driver.status} />
              </div>
              <p className="text-xs text-gray-500 font-medium">Driver Reference ID: {id}</p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/driver")}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 flex-shrink-0 mt-2 sm:mt-0 font-bold border-gray-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
        </div>
      </Card>

      {/* Main Content Card */}
      <Card className="border-none shadow-md ring-1 ring-gray-100">
        <CardContent className="p-6 space-y-8">
          {/* Section 1: Driver Details */}
          <div className="space-y-4">
            <div className="flex items-center p-2.5 gap-2 text-sm rounded-lg font-bold bg-[var(--team-color)] text-white shadow-sm ring-1 ring-white/10 uppercase tracking-widest">
              <User className="w-4 h-4" />
              Driver Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DisplayField label="UUID" value={driver.UUID} />
              <DisplayField label="First Name" value={driver.name} />
              <DisplayField label="Last Name" value={driver.surname} />
              <DisplayField label="Email Address" value={driver.email} />
              
              <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
                <DisplayField label="Mobile" value={driver.mobile} />
                <DisplayField label="Alternate Mobile" value={driver.alternate_mobile_no} />
                <DisplayField label="Date of Birth" value={driver.dob} />
                <DisplayField label="Father Name" value={driver.father_name} />
                <DisplayField label="Joining Date" value={driver.doj} />
              </div>
            </div>
          </div>

          {/* Section 2: License & Background */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center p-2.5 gap-2 text-sm rounded-lg font-bold bg-[var(--team-color)] text-white shadow-sm ring-1 ring-white/10 uppercase tracking-widest">
              <FileText className="w-4 h-4" />
              License & Background Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DisplayField label="Aadhar No" value={driver.aadhar_no} />
              <DisplayField label="DL Number" value={driver.dl_no} />
              <DisplayField label="DL Issue Date" value={driver.dl_issue_date} />
              <DisplayField label="DL Expiry Date" value={driver.dl_expiry_date} />
              
              <DisplayField label="DL Submitted" value={driver.dl_submitted} />
              <DisplayField label="PCC Status" value={driver.pcc_status} />
              <DisplayField label="Previous Company" value={driver.you_worked_before_company} />
              <DisplayField label="Driving Experience" value={driver.driving_experience} />
            </div>
          </div>

          {/* Section 3: Contact & Bank Details */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center p-2.5 gap-2 text-sm rounded-lg font-bold bg-[var(--team-color)] text-white shadow-sm ring-1 ring-white/10 uppercase tracking-widest">
              <FileText className="w-4 h-4" />
              Contact & Bank Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DisplayField label="Emergency Contact Name" value={driver.emergency_contact_name} />
              <DisplayField label="Emergency Contact No" value={driver.emergency_contact_no} />
              <DisplayField label="Refer By" value={driver.referby} />
              <DisplayField label="Refer By Mobile" value={driver.referby_mobile} />
              
              <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <DisplayField label="Bank Holder Name" value={driver.name_as_per_bank} />
                <DisplayField label="Account Number" value={driver.account_no} />
                <DisplayField label="Bank Name" value={driver.bank_name} />
                <DisplayField label="IFSC Code" value={driver.ifsc_code} />
              </div>
            </div>
          </div>

          {/* Section 4: Remarks */}
          <div className="space-y-4 pt-2">
             <div className="flex items-center p-2.5 gap-2 text-sm rounded-lg font-bold bg-[var(--team-color)] text-white shadow-sm ring-1 ring-white/10 uppercase tracking-widest">
              <FileText className="w-4 h-4" />
              Remarks
            </div>
            <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-lg text-sm text-gray-700 font-medium italic min-h-[4rem] flex items-center shadow-inner">
              &ldquo;{driver.remarks || "No additional remarks provided."}&rdquo;
            </div>
          </div>

          {/* Section 5: Documents */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center p-2.5 gap-2 text-sm rounded-lg font-bold bg-[var(--team-color)] text-white shadow-sm ring-1 ring-white/10 uppercase tracking-widest">
              <ImageIcon className="w-4 h-4" />
              Document Uploads
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              <DocumentImage label="Selfie" fileName={driver.selfie_image} />
              <DocumentImage label="Aadhar Front" fileName={driver.aadhar_front_image} />
              <DocumentImage label="Aadhar Back" fileName={driver.aadhar_back_image} />
              <DocumentImage label="DL Front" fileName={driver.driving_licence_front_image} />
              <DocumentImage label="DL Back" fileName={driver.driving_licence_back_image} />
              <DocumentImage label="Pan Card" fileName={driver.pancard_image} />
              <DocumentImage label="Bank Passbook" fileName={driver.bank_passbook_cancelled_cheque_image} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewDriver;
