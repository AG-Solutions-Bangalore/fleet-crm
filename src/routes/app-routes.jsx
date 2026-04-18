import LoadingBar from "@/components/loader/loading-bar";

import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Maintenance from "@/components/common/maintenance";
import SignUp from "@/app/auth/sign-up";

import TripList from "@/app/trip/trip-list";
import DriverList from "@/app/driver/driver-list";
import DriverActivityList from "@/app/driver-activity/driver-activity-list";
import VehicleList from "@/app/vehicle/vehicle-list";
import CreateDriver from "@/app/driver/create-driver";
import CreateVehicle from "@/app/vehicle/create-vehicle";
import EditDriver from "@/app/driver/edit-driver";
import EditVehicle from "@/app/vehicle/edit-vehicle";
import DriverAutoPostionList from "@/app/driver-auto-position/driver-auto-position-list";
import PaymentList from "@/app/payment/payment-list";
import DriverPerfromanceList from "@/app/driver-performance/driver-perfromance-list";
import Settings from "@/app/setting/setting";
import DepositList from "@/app/driver-deposit/deposit-list";
import CreateDeposit from "@/app/driver-deposit/create-deposit";
import EditDeposit from "@/app/driver-deposit/edit-deposit";
import PenaltyList from "@/app/driver-penalty/penalty-list";
import CreatePenalty from "@/app/driver-penalty/create-penalty";
import EditPenalty from "@/app/driver-penalty/edit-penalty";
import NewDriverPerformanceReport from "@/app/report/new-performance";
import DailyCashList from "@/app/daily-cash/daily-cash-list";
import VehicleTravelList from "@/app/vehicle-travel/vehicle-travel-list";
import DailyDistanceReport from "@/app/report/daily-distance-report";
import VehicleAssignmentReport from "@/app/report/vehicle-assignment-report";
import ViewDriver from "@/app/driver/view-driver";
import ViewVehicle from "@/app/vehicle/view-vehicle";

import AlternateVehicleList from "@/app/alternate-vehicle/alternate-vehicle-list";
import CreateAlternateVehicle from "@/app/alternate-vehicle/create-alternate-vehicle";
import EditAlternateVehicle from "@/app/alternate-vehicle/edit-alternate-vehicle";
import DriverDebitReport from "@/app/report/driver-debit";
import DriverCreditReport from "@/app/report/driver-credit";
import DriverDetailsReport from "@/app/report/driver-details";
import VehicleDetailsReport from "@/app/report/vehicle-details";
import DriverPerfromanceReport from "@/app/report/driver-performance";
import FinalDriverPerformanceReport from "@/app/report/final-performance";
import CreateDriverPayment from "@/app/driver-payment/create-payment";
import EditDriverPayment from "@/app/driver-payment/edit-payment";
import DriverPaymentList from "@/app/driver-payment/payment-list";
import DayWiseSummaryReport from "@/app/report/day-wise-summary-report";
import VehicleWiseSummaryReport from "@/app/report/vehicle-wise-summary-report";
import DriverDashboard from "@/app/dashboard/driver-dashboard";
import VehicleDashboard from "@/app/dashboard/vehicle-dashboard";

const Login = lazy(() => import("@/app/auth/login"));

const NotFound = lazy(() => import("@/app/errors/not-found"));
const Home = lazy(() => import("@/app/home/home"));

const ForgotPassword = lazy(
  () => import("@/components/forgot-password/forgot-password"),
);
const AuthRoute = lazy(() => import("./auth-route"));
const ProtectedRoute = lazy(() => import("./protected-route"));

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthRoute />}>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
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

      <Route path="/" element={<ProtectedRoute />}>
        {/* dashboard  */}
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<LoadingBar />}>
              <Home />
            </Suspense>
          }
        />

        <Route
          path="/d-dashboard"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DriverDashboard />
            </Suspense>
          }
        />

        <Route
          path="/v-dashboard"
          element={
            <Suspense fallback={<LoadingBar />}>
              <VehicleDashboard />
            </Suspense>
          }
        />
        {/* trip  */}
        <Route
          path="/trip"
          element={
            <Suspense fallback={<LoadingBar />}>
              <TripList />
            </Suspense>
          }
        />

        {/* driver  */}
        <Route
          path="/driver"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DriverList />
            </Suspense>
          }
        />
        <Route
          path="/driver/driver-create"
          element={
            <Suspense fallback={<LoadingBar />}>
              <CreateDriver />
            </Suspense>
          }
        />

        <Route
          path="/driver/driver-edit/:id"
          element={
            <Suspense fallback={<LoadingBar />}>
              <EditDriver />
            </Suspense>
          }
        />
        <Route
          path="/driver/driver-view/:id"
          element={
            <Suspense fallback={<LoadingBar />}>
              <ViewDriver />
            </Suspense>
          }
        />

        {/* vehicle  */}
        <Route
          path="/vehicle"
          element={
            <Suspense fallback={<LoadingBar />}>
              <VehicleList />
            </Suspense>
          }
        />
        <Route
          path="/vehicle/vehicle-create"
          element={
            <Suspense fallback={<LoadingBar />}>
              <CreateVehicle />
            </Suspense>
          }
        />
        <Route
          path="/vehicle/vehicle-edit/:id"
          element={
            <Suspense fallback={<LoadingBar />}>
              <EditVehicle />
            </Suspense>
          }
        />
        <Route
          path="/vehicle/vehicle-view/:id"
          element={
            <Suspense fallback={<LoadingBar />}>
              <ViewVehicle />
            </Suspense>
          }
        />

        {/* alternate vehicle ride */}
        <Route
          path="/alternate-vehicle-ride"
          element={
            <Suspense fallback={<LoadingBar />}>
              <AlternateVehicleList />
            </Suspense>
          }
        />
        <Route
          path="/alternate-vehicle-ride/create"
          element={
            <Suspense fallback={<LoadingBar />}>
              <CreateAlternateVehicle />
            </Suspense>
          }
        />
        <Route
          path="/alternate-vehicle-ride/edit/:id"
          element={
            <Suspense fallback={<LoadingBar />}>
              <EditAlternateVehicle />
            </Suspense>
          }
        />

        {/* driver activity  */}
        <Route
          path="/activity-driver"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DriverActivityList />
            </Suspense>
          }
        />

        {/* driver auto position  */}
        <Route
          path="/position-auto-driver"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DriverAutoPostionList />
            </Suspense>
          }
        />

        {/* payment  */}
        <Route
          path="/payment"
          element={
            <Suspense fallback={<LoadingBar />}>
              <PaymentList />
            </Suspense>
          }
        />

        {/* daily cash */}
        <Route
          path="/daily-cash"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DailyCashList />
            </Suspense>
          }
        />
        {/* daily cash */}
        <Route
          path="/travel-vehicle"
          element={
            <Suspense fallback={<LoadingBar />}>
              <VehicleTravelList />
            </Suspense>
          }
        />

        <Route
          path="/list-driver-performance"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DriverPerfromanceList />
            </Suspense>
          }
        />

        <Route
          path="/performance-new"
          element={
            <Suspense fallback={<LoadingBar />}>
              <NewDriverPerformanceReport />
            </Suspense>
          }
        />

        <Route
          path="/report-drivers-performance"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DriverPerfromanceReport />
            </Suspense>
          }
        />
        <Route
          path="/final-performance-report"
          element={
            <Suspense fallback={<LoadingBar />}>
              <FinalDriverPerformanceReport />
            </Suspense>
          }
        />
        <Route
          path="/daily-distance-report"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DailyDistanceReport />
            </Suspense>
          }
        />
        <Route
          path="/assignment-vehicle-report"
          element={
            <Suspense fallback={<LoadingBar />}>
              <VehicleAssignmentReport />
            </Suspense>
          }
        />
        <Route
          path="/credit-driver-report"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DriverCreditReport />
            </Suspense>
          }
        />
        <Route
          path="/debit-driver-report"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DriverDebitReport />
            </Suspense>
          }
        />
        <Route
          path="/details-driver-report"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DriverDetailsReport />
            </Suspense>
          }
        />
        <Route
          path="/vehicle-details-report"
          element={
            <Suspense fallback={<LoadingBar />}>
              <VehicleDetailsReport />
            </Suspense>
          }
        />
        <Route
          path="/day-wise-summary-report"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DayWiseSummaryReport />
            </Suspense>
          }
        />
        <Route
          path="/summary-vehicle-wise-report"
          element={
            <Suspense fallback={<LoadingBar />}>
              <VehicleWiseSummaryReport />
            </Suspense>
          }
        />

        {/* driver deposit  */}
        <Route
          path="/deposit"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DepositList />
            </Suspense>
          }
        />
        <Route
          path="/deposit/create-deposit"
          element={
            <Suspense fallback={<LoadingBar />}>
              <CreateDeposit />
            </Suspense>
          }
        />
        <Route
          path="/deposit/deposit-edit/:id"
          element={
            <Suspense fallback={<LoadingBar />}>
              <EditDeposit />
            </Suspense>
          }
        />

        {/* driver payment  */}
        <Route
          path="/paid-driver"
          element={
            <Suspense fallback={<LoadingBar />}>
              <DriverPaymentList />
            </Suspense>
          }
        />
        <Route
          path="/paid-driver/create-payment"
          element={
            <Suspense fallback={<LoadingBar />}>
              <CreateDriverPayment />
            </Suspense>
          }
        />
        <Route
          path="/paid-driver/payment-edit/:id"
          element={
            <Suspense fallback={<LoadingBar />}>
              <EditDriverPayment />
            </Suspense>
          }
        />

        {/* driver penalty  */}
        <Route
          path="/penalty"
          element={
            <Suspense fallback={<LoadingBar />}>
              <PenaltyList />
            </Suspense>
          }
        />
        <Route
          path="/penalty/create-penalty"
          element={
            <Suspense fallback={<LoadingBar />}>
              <CreatePenalty />
            </Suspense>
          }
        />
        <Route
          path="/penalty/penalty-edit/:id"
          element={
            <Suspense fallback={<LoadingBar />}>
              <EditPenalty />
            </Suspense>
          }
        />

        {/* settings */}
        <Route
          path="/settings"
          element={
            <Suspense fallback={<LoadingBar />}>
              <Settings />
            </Suspense>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
