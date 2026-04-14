import Login from "@/app/auth/login";
import ForgotPassword from "@/components/forgot-password/forgot-password";
import BlogList from "@/app/blog/blog-list";
import CreateBlog from "@/app/blog/create-blog";
import NotFound from "@/app/errors/not-found";
import FaqForm from "@/app/faq/create-faq";
import FaqList from "@/app/faq/faq-list";
import GalleryList from "@/app/gallery/gallery-list";
import LectureYoutubeForm from "@/app/lecture-youtube/lecture-youtube-form";
import LetureYoutubeList from "@/app/lecture-youtube/lecture-youtube-list";
import PopupList from "@/app/popup/popup";
import Settings from "@/app/setting/setting";
import SidePopupList from "@/app/sidepopup/sidepopup-list";
import StudentCertificate from "@/app/student/student-certificate";
import StudentForm from "@/app/student/student-form";
import StudentMap from "@/app/student/student-map";
import StudentOfficeImage from "@/app/student/student-officeimage";
import StudentRecentPassOut from "@/app/student/student-recentpassout";
import StudentStory from "@/app/student/student-story";
import StudentTestimonial from "@/app/student/student-testimonial";
import StudenTop from "@/app/student/student-top";
import StudentYoutube from "@/app/student/student-youtube";
import Maintenance from "@/components/common/maintenance";
import ErrorBoundary from "@/components/error-boundry/error-boundry";
import LoadingBar from "@/components/loader/loading-bar";
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import EditBlog from "../app/blog/edit-blog";
import AuthRoute from "./auth-route";
import ProtectedRoute from "./protected-route";
import StudenScreenShot from "@/app/student/student-screenshot";
import NotificationList from "@/app/notification/notifycation-list";
import Dashboard from "@/app/dashboard/home";
import ClientList from "@/app/member/client-list";
import CreateClient from "@/app/member/create-client";
import RequestList from "@/app/service-request/request-list";
import ServiceList from "@/app/service/service-list";
import CreateService from "@/app/service/create-service";
import UpdateService from "@/app/service/update-service";
import Client from "@/app/reports/Client";
import Request_service from "@/app/reports/Request_service";
import ComplaintList from "@/app/complaint/complaint-list";

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ForgotPassword />
              </Suspense>
            }
          />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<LoadingBar />}>
              <Dashboard />
            </Suspense>
          }
        />

        <Route path="/" element={<ProtectedRoute />}>
          <Route
            path="/service-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ServiceList />
              </Suspense>
            }
          />
          <Route
            path="/service-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CreateService />
              </Suspense>
            }
          />
          <Route
            path="/service-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <UpdateService />
              </Suspense>
            }
          />

          {/* Clients */}
          <Route
            path="/client-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ClientList />
              </Suspense>
            }
          />
          <Route
            path="/client-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CreateClient />
              </Suspense>
            }
          />
          <Route
            path="/client-list/create-relation/"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CreateClient isRelation={true} />
              </Suspense>
            }
          />
          <Route
            path="/client-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CreateClient isEdit={true} />
              </Suspense>
            }
          />

          {/* Service-request */}
          <Route
            path="/service-request"
            element={
              <Suspense fallback={<LoadingBar />}>
                <RequestList />
              </Suspense>
            }
          />

          {/* notification */}
          <Route
            path="/notification-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <NotificationList />
              </Suspense>
            }
          />

          {/* Complaint */}
          <Route
            path="/complaint-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ComplaintList />
              </Suspense>
            }
          />

          {/* Reports */}
          <Route
            path="/client-report"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Client />
              </Suspense>
            }
          />
          <Route
            path="/service-request-report"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Request_service />
              </Suspense>
            }
          />

          {/* old routes --------------------------------------------------------------------- */}
          <Route
            path="/lecture-youtube"
            element={
              <Suspense fallback={<LoadingBar />}>
                <LetureYoutubeList />
              </Suspense>
            }
          />
          <Route
            path="/lecture-youtube/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <LectureYoutubeForm />
              </Suspense>
            }
          />
          <Route
            path="/lecture-youtube/:id/edit"
            element={
              <Suspense fallback={<LoadingBar />}>
                <LectureYoutubeForm />
              </Suspense>
            }
          />
          <Route
            path="/student-testimonial"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentTestimonial />
              </Suspense>
            }
          />
          <Route
            path="/student-youtube"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentYoutube />
              </Suspense>
            }
          />
          <Route
            path="/student-certificate"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentCertificate />
              </Suspense>
            }
          />
          <Route
            path="/student-story"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentStory />
              </Suspense>
            }
          />
          <Route
            path="/student-recent-passout"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentRecentPassOut />
              </Suspense>
            }
          />
          <Route
            path="/student-map"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentMap />
              </Suspense>
            }
          />
          <Route
            path="/student-top"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudenTop />
              </Suspense>
            }
          />
          <Route
            path="/student-screenshot"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudenScreenShot />
              </Suspense>
            }
          />
          <Route
            path="/student-top"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudenTop />
              </Suspense>
            }
          />
          <Route
            path="/student-officeimage"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentOfficeImage />
              </Suspense>
            }
          />
          <Route
            path="/student/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentForm />
              </Suspense>
            }
          />
          <Route
            path="/student/:id/edit"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentForm />
              </Suspense>
            }
          />

          <Route
            path="/popup-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <PopupList />
              </Suspense>
            }
          />
          <Route
            path="/side-popup-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <SidePopupList />
              </Suspense>
            }
          />

          {/* <Route
            path="/company-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <NotificationList />
              </Suspense>
            }
          /> */}

          <Route
            path="/faq-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FaqList />
              </Suspense>
            }
          />
          <Route
            path="/add-faq"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FaqForm />
              </Suspense>
            }
          />
          <Route
            path="/edit-faq/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FaqForm />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Settings />
              </Suspense>
            }
          />
          <Route
            path="/blog-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BlogList />
              </Suspense>
            }
          />
          <Route
            path="/add-blog"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CreateBlog />
              </Suspense>
            }
          />
          <Route
            path="/edit-blog/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <EditBlog />
              </Suspense>
            }
          />
          <Route
            path="/gallery-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <GalleryList />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;
