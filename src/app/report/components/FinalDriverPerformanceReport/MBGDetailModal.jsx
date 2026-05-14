import { useEffect, useMemo } from "react";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";

const MBGDetailModal = ({
  driver,
  onClose,
  fetchMBGdata,
  popupData,
  mbgLoading,
}) => {
  useEffect(() => {
    if (driver?.driver_full_name) {
      fetchMBGdata(driver?.driver_full_name);
    }
  }, [driver]);

  const popupFullData = popupData?.data;
  const mbgConditions = popupData?.condition_mbg;

  const popupRows = popupFullData || [];

  const getConditionStatus = (row, conditions) => {
    const category = row?.performance_type || "Uber Black";
    const filteredConditions =
      conditions?.filter((c) => c.condition_for === category) || [];

    if (!filteredConditions.length) return { allMet: false, failed: [] };

    const earnings = Number(row.total_earings || 0);
    const hours = Number(row.hours_online || 0);

    const failed = [];

    filteredConditions.forEach((cond) => {
      if (cond.condition_type !== ">=") return;

      const value = Number(cond.condition_amount);

      if (cond.condition_of === "total_earings" && earnings < value) {
        failed.push(`Earnings < ${value}`);
      }

      if (cond.condition_of === "hours_online" && hours < value) {
        failed.push(`Hours < ${value}`);
      }
    });

    return {
      allMet: failed.length === 0,
      failed,
    };
  };

  const calculateDailyMBG = (row, conditions) => {
    const category = row?.performance_type || "Uber Black";

    if (category === "Uber Green") return 0;

    const filteredConditions =
      conditions?.filter((c) => c.condition_for === category) || [];

    if (!filteredConditions.length) return 0;

    const earnings = Number(row.total_earings || 0);
    const hours = Number(row.hours_online || 0);

    const earningCond = filteredConditions.find(
      (c) => c.condition_of === "total_earings" && c.condition_type === ">=",
    );

    const hoursCond = filteredConditions.find(
      (c) => c.condition_of === "hours_online" && c.condition_type === ">=",
    );

    const perHourCond = filteredConditions.find(
      (c) => c.condition_type === "*",
    );

    const isEarningMet =
      earningCond && earnings >= Number(earningCond.condition_amount);

    const isHoursMet = hoursCond && hours >= Number(hoursCond.condition_amount);

    if (isEarningMet && isHoursMet) {
      return Number(earningCond.condition_amount_to_show);
    }

    if (perHourCond) {
      const rate = Number(perHourCond.condition_amount_to_show);
      const maxHours = Number(perHourCond.condition_amount);

      const applicableHours = Math.min(hours, maxHours);
      return applicableHours * rate;
    }

    return 0;
  };

  const totalMBG = useMemo(() => {
    return popupRows.reduce((acc, r) => {
      return acc + Number(calculateDailyMBG(r, mbgConditions) || 0);
    }, 0);
  }, [popupRows, mbgConditions]);

  const totalHrs = popupRows
    ?.reduce((acc, r) => acc + Number(r.hours_online || 0), 0)
    ?.toFixed(2);

  const totalconf = (
    (popupRows?.reduce((acc, r) => acc + Number(r.confirmation_rate || 0), 0) *
      100) /
    popupRows?.length
  ).toFixed(0);

  const totalTrips = popupRows?.reduce(
    (acc, r) => acc + Number(r.trips_taken || 0),
    0,
  );

  const totalEarnings = popupRows?.reduce(
    (acc, r) => acc + Number(r.total_earings || 0),
    0,
  );

  const totalCashCollection = popupRows?.reduce(
    (acc, r) => acc + Number(r.cash_collected || 0),
    0,
  );

  const totalCashDeposited = popupRows?.reduce(
    (acc, r) => acc + Number(r.deposit_amount || 0),
    0,
  );

  const totalQrDeposited = popupRows?.reduce(
    (acc, r) => acc + Number(r.amount || 0),
    0,
  );

  const uber = popupRows[0]?.performance_type;

  return (
    <Dialog
      open={!!driver?.driver_full_name}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-[80%] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between px-2">
            <p>Daily MBG Breakdown — {driver?.driver_full_name || ""}</p>
            <p className="text-gray-400 px-10">{uber}</p>
          </DialogTitle>
        </DialogHeader>

        {/* ✅ LOADING INSIDE MODAL */}
        {mbgLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-full">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-yellow-400 text-black">
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-right">Hours Online</th>
                    <th className="border p-2 text-right">Confirmation %</th>
                    <th className="border p-2 text-right">Trips Taken</th>
                    <th className="border p-2 text-right">Daily Earning</th>
                    <th className="border p-2 text-right">Cash Collection</th>
                    <th className="border p-2 text-right">Daily MBG</th>
                    <th className="border p-2 text-right">Cash D</th>
                    <th className="border p-2 text-right">QR D</th>
                    <th className="border p-2 text-left">Conditions Met</th>
                  </tr>
                </thead>

                <tbody>
                  {popupFullData && popupFullData.length > 0 ? (
                    popupFullData.map((r, i) => {
                      const hours = Number(r.hours_online || 0);

                      const { allMet, failed } = getConditionStatus(
                        r,
                        mbgConditions,
                      );

                      return (
                        <tr key={i}>
                          <td className="border p-2">
                            {r.performance_date
                              ? moment(r.performance_date).format("DD-MM-YYYY")
                              : "—"}
                          </td>

                          <td className="border p-2 text-right">
                            {hours.toFixed(2)}
                          </td>

                          <td className="border p-2 text-right">
                            {(r.confirmation_rate * 100 || 0).toFixed(0)}%
                          </td>

                          <td className="border p-2 text-right">
                            {r.trips_taken || 0}
                          </td>

                          <td className="border p-2 text-right">
                            {Number(r.total_earings || 0).toFixed(0)}
                          </td>

                          <td className="border p-2 text-right">
                            {Number(r.cash_collected || 0).toFixed(0)}
                          </td>

                          <td className="border p-2 text-right text-green-700 font-semibold">
                            {calculateDailyMBG(r, mbgConditions).toFixed(0)}
                          </td>

                          <td className="border p-2 text-right">
                            {Number(r.deposit_amount || 0).toFixed(0)}
                          </td>

                          <td className="border p-2 text-right">
                            {Number(r.amount || 0).toFixed(0)}
                          </td>
                          <td className="border p-2">
                            {allMet ? (
                              <span className="text-green-600 font-semibold">
                                ✓ All Conditions Met
                              </span>
                            ) : (
                              <span className="text-red-500 text-xs">
                                {failed.length > 0 ? (
                                  failed.map((f, idx) => (
                                    <span key={idx} className="block">
                                      {f}
                                    </span>
                                  ))
                                ) : (r.performance_type || "Uber Black") ===
                                  "Uber Green" ? (
                                  <span className="text-gray-400 italic">
                                    Conditions not set
                                  </span>
                                ) : (
                                  "N/A"
                                )}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-4 text-gray-400"
                      >
                        No MBG data available
                      </td>
                    </tr>
                  )}
                </tbody>
                {popupFullData && popupFullData.length > 0 && (
                  <tfoot>
                    <tr className="bg-red-50 text-black">
                      <th className="border p-2 text-left">Total</th>
                      <th className="border p-2 text-right">{totalHrs}</th>
                      <th className="border p-2 text-right">{totalconf}%</th>
                      <th className="border p-2 text-right">{totalTrips}</th>
                      <th className="border p-2 text-right">
                        {totalEarnings.toFixed(0)}
                      </th>
                      <th className="border p-2 text-right">
                        {totalCashCollection.toFixed(0)}
                      </th>
                      <th className="border p-2 text-right font-bold">
                        {totalMBG.toFixed(0)}
                      </th>
                      <th className="border p-2 text-right">
                        {totalCashDeposited.toFixed(0)}
                      </th>
                      <th className="border p-2 text-right">
                        {totalQrDeposited.toFixed(0)}
                      </th>
                      <th className="border p-2"></th>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                [" MBG", `${driver?.mbg}`],
                [" Total Earning", `${driver?.totalearings}`],
                [" Revenue Incentive", `${driver?.totalrevenue}`],
                [" Additional Incentive", `${driver?.additionalIncentive}`],
                [" Cash Collection", `${driver?.totalCashCollected}`],
                [" Cash Deposited", `${driver?.totalCashDepositAmount}`],
                [" Cash Balance ", `${driver?.cashBalance}`],
                [" QR Deposited", `${driver?.totalQRDepositAmount}`],
                [" Total Payout ", `${driver?.totalPayout}`],
                [" Payout After Adj ", `${driver?.payoutAdj}`],
                [" Credit", `${driver?.totalCreditAmount}`],
                [" Debit ", `${driver?.totalDebiitAmount}`],
                [" Customer Trips ", `${driver?.totalCustomerTipsAmount}`],
                [" Final Payout ", `${driver?.finalPayout}`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between bg-gray-50 rounded p-2"
                >
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MBGDetailModal;
