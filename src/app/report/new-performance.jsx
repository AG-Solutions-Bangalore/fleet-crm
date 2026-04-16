import { Button } from "@/components/ui/button";
import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import { Download, Loader } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import moment from "moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatCurrency as fmt,
  formatPercentage as fmtPct,
} from "@/config/performance-rules";
import { Label } from "@radix-ui/react-dropdown-menu";

// ─────────────────────────────────────────────
// Pure Local Helpers (Row Sums/Averages)
// ─────────────────────────────────────────────

/** Column O: Weekly Acceptance % = avg confirmation_rate */
const calcWeeklyAcceptance = (rows) => {
  if (!rows.length) return 0;
  const sum = rows.reduce(
    (acc, r) => acc + parseFloat(r.confirmation_rate || 0),
    0,
  );
  return sum / rows.length;
};

/** Column Q: Total Earning = sum of total_earings */
const calcTotalEarning = (rows) =>
  rows.reduce((acc, r) => acc + parseFloat(r.total_earings || 0), 0);

/** Column T: Total Cash Collection = sum of cash_collected */
const calcTotalCollection = (rows) =>
  rows.reduce((acc, r) => acc + parseFloat(r.cash_collected || 0), 0);

/** Column AA: Customer Trips = sum of paid_to_you_your_earings_tip */
const calcCustomerTrips = (rows) =>
  rows.reduce(
    (acc, r) => acc + parseFloat(r.paid_to_you_your_earings_tip || 0),
    0,
  );

/** Column AB: Final Payout = X + Y + AA - Z */
const calcFinalPayout = (X, Y, AA, Z) => X + Y + AA - Z;

// ─────────────────────────────────────────────
// Group API rows by driver
// ─────────────────────────────────────────────
const groupByDriver = (data) => {
  const map = {};
  data.forEach((row) => {
    const key = row.driver_full_name;
    if (!map[key]) map[key] = [];
    map[key].push(row);
  });
  return map;
};

// ─────────────────────────────────────────────
// Compute per-driver fleet row
// ─────────────────────────────────────────────
const computeFleetRow = (driverName, rows, calcEngines) => {
  const category = rows[0]?.performance_type || "Uber Black";
  const { mbgEngine, revenueEngine, additionalEngine, otherEngine } =
    calcEngines;

  const weeklyAcceptance = calcWeeklyAcceptance(rows);
  const mbgTotal = rows.reduce((acc, r) => acc + mbgEngine(r, category), 0);
  const totalEarnings = calcTotalEarning(rows);
  const revenueIncentive = revenueEngine(totalEarnings, category);
  const additionalIncentive = additionalEngine(rows, category);
  const totalCashCollection = calcTotalCollection(rows);
  const cashDeposited = rows.reduce(
    (acc, r) => acc + parseFloat(r.deposit_amount || 0),
    0,
  ); // Sum of daily deposits from API
  const qrDeposited = rows.reduce(
    (acc, r) => acc + (parseFloat(r.transaction_amount || 0) - parseFloat(r.discount_amount || 0)),
    0,
  );
  const cashBalance = totalCashCollection - cashDeposited - qrDeposited; // Cash Balance = Collection - (Cash D + QR D)
  const totalPayout = mbgTotal + revenueIncentive + additionalIncentive; // Total Payout
  const payoutAfterAdj = totalPayout - cashBalance; // Payout After Adj
  const credit = 0; // Credit
  const debit =
    otherEngine(rows, category) +
    rows.reduce((acc, r) => acc + parseFloat(r.penalty_amount || 0), 0); // Dynamic penalties + API penalty_amount
  const customerTripsTip = calcCustomerTrips(rows);
  const finalPayout = calcFinalPayout(payoutAfterAdj, credit, customerTripsTip, debit);

  return {
    driverName,
    rows,
    category,
    weeklyAcceptance,
    mbgTotal,
    totalEarnings,
    revenueIncentive,
    additionalIncentive,
    totalCashCollection,
    cashDeposited,
    qrDeposited,
    cashBalance,
    totalPayout,
    payoutAfterAdj,
    credit,
    debit,
    customerTripsTip,
    finalPayout,
  };
};

const MBGDetailModal = ({ driver, onClose, mbgEngine, rules }) => {
  if (!driver) return null;
  const { driverName, rows, category } = driver;

  // Filter rules for this specific driver category
  const categoryRules =
    rules?.mbg?.filter((r) => r.condition_for === category) || [];
  const thresholdRules = categoryRules.filter((r) => r.condition_type === ">=");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily MBG Breakdown — {driverName}</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
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
              {rows.map((r, i) => {
                const mbg = mbgEngine(r, category);
                const earning = parseFloat(r.total_earings || 0);
                const hours = parseFloat(r.hours_online || 0);
                const conf = parseFloat(r.confirmation_rate || 0);
                const trips = parseInt(r.trips_taken || 0);
                const cashDepositRow = parseFloat(r.deposit_amount || 0);
                const qrDepositRow = parseFloat(r.transaction_amount || 0) - parseFloat(r.discount_amount || 0);

                // Track which thresholds are met
                const metRules = thresholdRules.filter((rule) => {
                  const val = parseFloat(r[rule.condition_of] || 0);
                  return val >= parseFloat(rule.condition_amount);
                });
                const anyMet = metRules.length > 0;
                const allMet = thresholdRules.length > 0 && metRules.length === thresholdRules.length;

                return (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border p-2">
                      {moment(r.performance_date).format("DD-MM-YYYY") || "—"}
                    </td>
                    <td className="border p-2 text-right">
                      {hours.toFixed(2)}
                    </td>
                    <td className="border p-2 text-right">{fmtPct(conf)}</td>
                    <td className="border p-2 text-right">{trips}</td>
                    <td className="border p-2 text-right">{fmt(earning, 2)}</td>
                    <td className="border p-2 text-right">
                      {fmt(parseFloat(r.cash_collected || 0))}
                    </td>
                    <td className="border p-2 text-right font-semibold text-green-700">
                      {fmt(mbg)}
                    </td>
                    <td className="border p-2 text-right">
                      {fmt(cashDepositRow)}
                    </td>
                    <td className="border p-2 text-right">
                      {fmt(qrDepositRow)}
                    </td>
                    <td className="border p-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                        {category}
                      </span>
                      {anyMet ? (
                        <span className="text-green-600 font-medium">
                          {allMet ? "✓ All Conditions Met" : "✓ Partial MBG Met"}
                        </span>
                      ) : (
                        <span className="text-red-500 text-xs">
                          {thresholdRules.map((rule, idx) => {
                            const val = parseFloat(r[rule.condition_of] || 0);
                            const isMet = val >= parseFloat(rule.condition_amount);
                            if (isMet) return null;
                            return (
                              <span key={idx} className="block">
                                {rule.condition_of.replace("_", " ")} &lt; {rule.condition_amount}
                              </span>
                            );
                          })}
                          {thresholdRules.length === 0 && "Rate Applied"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-orange-100 font-bold text-[11px]">
                <td className="border p-2">Total</td>
                <td className="border p-2 text-right">
                  {rows
                    .reduce((acc, r) => acc + parseFloat(r.hours_online || 0), 0)
                    .toFixed(2)}
                </td>
                <td className="border p-2 text-right">
                  {fmtPct(
                    rows.reduce(
                      (acc, r) => acc + parseFloat(r.confirmation_rate || 0),
                      0,
                    ) / (rows.length || 1),
                  )}
                </td>
                <td className="border p-2 text-right">
                  {rows.reduce((acc, r) => acc + parseInt(r.trips_taken || 0), 0)}
                </td>
                <td className="border p-2 text-right">
                  {fmt(
                    rows.reduce(
                      (acc, r) => acc + parseFloat(r.total_earings || 0),
                      0,
                    ),
                    2,
                  )}
                </td>
                <td className="border p-2 text-right">
                  {fmt(
                    rows.reduce(
                      (acc, r) => acc + parseFloat(r.cash_collected || 0),
                      0,
                    ),
                  )}
                </td>
                <td className="border p-2 text-right text-orange-700">
                  {fmt(driver.mbgTotal)}
                </td>
                <td className="border p-2 text-right">
                  {fmt(
                    rows.reduce(
                      (acc, r) => acc + parseFloat(r.deposit_amount || 0),
                      0,
                    ),
                  )}
                </td>
                <td className="border p-2 text-right">
                  {fmt(
                    rows.reduce(
                      (acc, r) => acc + (parseFloat(r.transaction_amount || 0) - parseFloat(r.discount_amount || 0)),
                      0,
                    ),
                  )}
                </td>
                <td className="border p-2" />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {[
            [" MBG", `${fmt(driver.mbgTotal, 2)}`],
            [" Total Earning", `${fmt(driver.totalEarnings, 2)}`],
            [" Revenue Incentive", `${fmt(driver.revenueIncentive, 2)}`],
            [" Additional Incentive", `${fmt(driver.additionalIncentive, 2)}`],
            [" Cash Collection", `${fmt(driver.totalCashCollection, 2)}`],
            [" Cash Deposited", `${fmt(driver.cashDeposited)}`],
            [" Cash Balance ", `${fmt(driver.cashBalance, 2)}`],
            [" QR Deposited", `${fmt(driver.qrDeposited, 2)}`],
            [" Total Payout ", `${fmt(driver.totalPayout, 2)}`],
            [" Payout After Adj ", `${fmt(driver.payoutAfterAdj, 2)}`],
            [" Customer Trips Tip", `${fmt(driver.customerTripsTip, 2)}`],
            [" Final Payout ", `${fmt(driver.finalPayout, 2)}`],
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
      </DialogContent>
    </Dialog>
  );
};

const FleetReportView = ({ reportData, rules, calcEngines }) => {
  const [selectedDriver, setSelectedDriver] = useState(null);

  const driverGroups = useMemo(() => groupByDriver(reportData), [reportData]);
  const fleetRows = useMemo(
    () =>
      Object.entries(driverGroups).map(([name, rows]) =>
        computeFleetRow(name, rows, calcEngines),
      ),
    [driverGroups, calcEngines],
  );

  if (!reportData || reportData.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No data available for the selected date range
      </p>
    );
  }

  const colHeaderClass =
    "border border-gray-300 p-2 text-center text-xs font-bold whitespace-nowrap bg-blue-900 text-white";
  const cellClass =
    "border border-gray-300 p-2 text-right text-xs whitespace-nowrap";
  const nameCellClass =
    "border border-gray-300 p-2 text-left text-xs font-semibold whitespace-nowrap sticky left-0 bg-white";

  return (
    <>
      {selectedDriver && (
        <MBGDetailModal
          driver={selectedDriver}
          rules={rules}
          mbgEngine={calcEngines.mbgEngine}
          onClose={() => setSelectedDriver(null)}
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th
                className={`${colHeaderClass} sticky left-0 z-auto bg-blue-900`}
              >
                Driver Name
              </th>
              <th
                className={`${colHeaderClass} bg-green-700`}
                title="Sum of MBG — click driver row to expand"
              >
                MBG
              </th>
              <th
                className={colHeaderClass}
                title="Weekly Acceptance Percentage"
              >
                Acc%
              </th>
              <th className={colHeaderClass} title="Total Earnings">
                Tot Earn
              </th>
              <th className={colHeaderClass} title="Revenue Incentive">
                Rev Inc
              </th>
              <th className={colHeaderClass} title="Additional Incentive">
                Add Inc
              </th>
              <th className={colHeaderClass} title="Total Collection">
                Tot Coll
              </th>
              <th className={colHeaderClass} title="Total Deposit">
                Tot CD
              </th>
              <th className={colHeaderClass} title="Total Deposit">
                Tot QD
              </th>
              <th
                className={`${colHeaderClass} bg-red-700`}
                title="Cash Balance"
              >
                Cash Bal
              </th>
              <th
                className={`${colHeaderClass} bg-orange-500`}
                title="Total Payout"
              >
                Tot Payout
              </th>
              <th className={colHeaderClass} title="Payout After Adjustments">
                Payout Adj
              </th>
              <th className={colHeaderClass}>Credit</th>
              <th className={colHeaderClass}>Debit</th>
              <th className={colHeaderClass} title="Customer Trips Completed">
                Cust Trips
              </th>
              <th className={`${colHeaderClass} bg-yellow-500 text-black`}>
                Final Payout
              </th>
            </tr>
          </thead>
          <tbody>
            {fleetRows.map((row, i) => {
              const isEven = i % 2 === 0;
              const rowBg = isEven ? "bg-white" : "bg-gray-50";

              return (
                <tr
                  key={row.driverName}
                  className={`${rowBg} hover:bg-blue-50`}
                >
                  <td className={`${nameCellClass} ${rowBg}`}>
                    {row.driverName}
                  </td>
                  <td
                    className={`${cellClass} text-green-700 font-bold cursor-pointer hover:underline`}
                    onClick={() => setSelectedDriver(row)}
                    title="Click to see daily breakdown"
                  >
                    {fmt(row.mbgTotal)}
                  </td>
                  <td className={cellClass}>{fmtPct(row.weeklyAcceptance)}</td>
                  <td className={cellClass}>{fmt(row.totalEarnings)}</td>
                  <td className={cellClass}>{fmt(row.revenueIncentive)}</td>
                  <td className={cellClass}>{fmt(row.additionalIncentive)}</td>
                  <td className={cellClass}>{fmt(row.totalCashCollection)}</td>
                  <td className={cellClass}>{fmt(row.cashDeposited)}</td>
                  <td className={cellClass}>{fmt(row.qrDeposited)}</td>
                  <td
                    className={`${cellClass} bg-red-100 text-red-700 font-semibold`}
                  >
                    {fmt(row.cashBalance)}
                  </td>
                  <td
                    className={`${cellClass} bg-orange-100 text-orange-700 font-semibold`}
                  >
                    {fmt(row.totalPayout)}
                  </td>
                  <td className={cellClass}>{fmt(row.payoutAfterAdj)}</td>
                  <td className={cellClass}>{fmt(row.credit)}</td>
                  <td className={cellClass}>{fmt(row.debit)}</td>
                  <td className={cellClass}>{fmt(row.customerTripsTip)}</td>
                  <td
                    className={`${cellClass} font-bold text-sm ${row.finalPayout >= 0
                      ? "text-green-700 bg-green-50"
                      : "text-red-700 bg-red-50"
                      }`}
                  >
                    {fmt(row.finalPayout)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

const NewDriverPerformanceReport = () => {
  const [reportData, setReportData] = useState(null);
  const [rules, setRules] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dates, setDates] = useState({
    fromDate: moment().subtract(6, "days").format("YYYY-MM-DD"),
    toDate: moment().format("YYYY-MM-DD"),
  });

  const token = Cookies.get("token");

  const calculateDynamicMBG = (dayData, category) => {
    if (!rules?.mbg) return 0;
    const catRules = rules.mbg.filter((r) => r.condition_for === category);
    if (!catRules.length) return 0;

    // 1. Check Threshold Rules (typically >=) for Full MBG
    const thresholdRules = catRules.filter((r) => r.condition_type === ">=");
    if (thresholdRules.length > 0) {
      const metThresholds = thresholdRules.filter((r) => {
        const val = parseFloat(dayData[r.condition_of] || 0);
        return val >= parseFloat(r.condition_amount);
      });

      if (metThresholds.length > 0) {
        // Return the highest reward amount among met conditions
        return Math.max(...metThresholds.map((r) => parseFloat(r.condition_amount_to_show)));
      }
    }

    // 2. Fallback to Multiplier/Rate Rules (typically * or <)
    const multiplierRule = catRules.find(
      (r) => r.condition_type === "*" || r.condition_type === "<",
    );
    if (multiplierRule) {
      const val = parseFloat(dayData[multiplierRule.condition_of] || 0);
      const cap = parseFloat(multiplierRule.condition_amount);
      const rate = parseFloat(multiplierRule.condition_amount_to_show);
      // If it's a "*" rule, it's usually cap-based: min(val, cap) * rate
      if (multiplierRule.condition_type === "*") {
        return Math.min(val, cap) * rate;
      }
      // Otherwise just val * rate
      return val * rate;
    }

    return 0;
  };

  const evaluateRevenueIncentive = (totalEarning, category) => {
    if (!rules?.revenue) return 0;
    const catRules = rules.revenue.filter(
      (r) => r.condition_revenue_for === category,
    );

    for (const rule of catRules) {
      const from = parseFloat(rule.condition_revenue_from_amount || 0);
      const to = rule.condition_revenue_to_amount
        ? parseFloat(rule.condition_revenue_to_amount)
        : Infinity;

      if (totalEarning >= from && totalEarning <= to) {
        const showVal = rule.condition_revenue_amount_to_show;
        if (showVal.includes("%")) {
          return totalEarning * (parseFloat(showVal) / 100);
        }
        return parseFloat(showVal);
      }
    }
    return 0;
  };

  const evaluateAdditionalIncentive = (rows, category) => {
    if (!rules?.additional) return 0;
    const catRules = rules.additional.filter(
      (r) => r.condition_additional_incentive_for === category,
    );

    for (const rule of catRules) {
      const metricField = rule.condition_additional_incentive_of;
      let val = 0;
      if (metricField === "confirmation_rate") {
        const sum = rows.reduce(
          (acc, r) => acc + parseFloat(r.confirmation_rate || 0),
          0,
        );
        val = (sum / (rows.length || 1)) * 100;
      } else if (metricField === "trips_count") {
        val = rows.reduce((acc, r) => acc + parseFloat(r.trips_taken || r.trips_count || 0), 0);
      }

      const from = parseFloat(rule.condition_additional_incentive_from || 0);
      const to = rule.condition_additional_incentive_to
        ? parseFloat(rule.condition_additional_incentive_to)
        : Infinity;

      if (val >= from && val <= to) {
        return parseFloat(rule.condition_additional_incentive_to_show);
      }
    }
    return 0;
  };

  const evaluateOtherConditions = (rows, category) => {
    if (!rules?.other) return 0;
    const catRules = rules.other.filter((r) => r.condition_for === category);
    let totalPenalty = 0;

    for (const rule of catRules) {
      if (rule.condition_other_type === "Week Off Leave") {
        // Typically 1 day off allowed in 7 days.
        const allowedOff = parseInt(rule.condition_other_amount);
        const daysInWeek = 7;
        const daysPresent = rows.length;
        const daysOff = daysInWeek - daysPresent;
        if (daysOff > allowedOff) {
          totalPenalty +=
            (daysOff - allowedOff) * parseFloat(rule.condition_other_to_show);
        }
      } else if (rule.condition_other_type === "Early Logout Policy") {
        const minHours = parseFloat(rule.condition_other_amount);
        const penaltyPerInstance = parseFloat(rule.condition_other_to_show);
        const earlyLogouts = rows.filter(
          (r) => parseFloat(r.hours_online || 0) < minHours,
        ).length;
        totalPenalty += earlyLogouts * penaltyPerInstance;
      }
    }
    return totalPenalty;
  };

  const handleDateSelect = (range, selectedDay) => {
    if (!selectedDay) return;

    const fromDate = moment(selectedDay).format("YYYY-MM-DD");
    const toDate = moment(selectedDay).add(6, "days").format("YYYY-MM-DD");
    setDates({ fromDate, toDate });
  };

  const exportToExcel = async () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Performance Report");

      const driverGroups = groupByDriver(reportData);
      const fleetData = Object.entries(driverGroups).map(([name, rows]) =>
        computeFleetRow(name, rows, {
          mbgEngine: calculateDynamicMBG,
          revenueEngine: evaluateRevenueIncentive,
          additionalEngine: evaluateAdditionalIncentive,
          otherEngine: evaluateOtherConditions,
        })
      );

      const exportRows = fleetData.map((row) => ({
        "Driver Name": row.driverName,
        Category: row.category,
        MBG: row.mbgTotal,
        "Acc%": (row.weeklyAcceptance * 100).toFixed(2) + "%",
        "Tot Earn": row.totalEarnings,
        "Rev Inc": row.revenueIncentive,
        "Add Inc": row.additionalIncentive,
        "Tot Coll": row.totalCashCollection,
        "Cash Dep": row.cashDeposited,
        "QR Dep": row.qrDeposited,
        "Cash Bal": row.cashBalance,
        "Tot Payout": row.totalPayout,
        "Payout Adj": row.payoutAfterAdj,
        Credit: row.credit,
        Debit: row.debit,
        "Cust Trips": row.customerTripsTip,
        "Final Payout": row.finalPayout,
      }));

      const headers = Object.keys(exportRows[0]);
      const maxCols = headers.length;

      worksheet.mergeCells(1, 1, 1, maxCols);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.value = "New Driver Performance Report";
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.mergeCells(2, 1, 2, maxCols);
      const subTitleCell = worksheet.getCell(2, 1);
      subTitleCell.value = `Range: ${dates.fromDate} to ${dates.toDate}`;
      subTitleCell.alignment = { horizontal: "center", vertical: "middle" };

      const headerRow = worksheet.getRow(4);
      headerRow.values = headers;
      headerRow.font = { bold: true };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2F2F2" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      exportRows.forEach((row) => {
        const rowData = Object.values(row);
        const newRow = worksheet.addRow(rowData);
        newRow.eachCell((cell, colNumber) => {
          if (colNumber > 2 && colNumber !== 4) {
            cell.alignment = { horizontal: "right" };
            cell.numFmt = "#,##0.00";
          }
        });
      });

      worksheet.columns.forEach((col, i) => {
        if (i === 0) col.width = 25;
        else col.width = 15;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `performance-report_${dates.fromDate}.xlsx`);
      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    }
  };

  const fetchDriverPerformanceReport = async () => {
    if (!dates.fromDate || !dates.toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/driver-performance-report`,
        {
          from_date: dates.fromDate,
          to_date: dates.toDate,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response?.data?.data) {
        setReportData(response.data.data);
        setRules({
          mbg: response.data.condition_mbg || [],
          revenue: response.data.condition_revenue_incentive || [],
          additional: response.data.condition_additionial_revenue || [],
          other: response.data.condition_other || [],
        });
        toast.success("Driver Performance Report fetched successfully");
      } else {
        setReportData([]);
        setRules(null);
        toast.error("No data found for the selected date range");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch Driver Performance Report",
      );
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Driver Performance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full flex-row gap-4 mb-6 items-end">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium">Select Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !dates.fromDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dates.fromDate ? (
                      moment(dates.fromDate).format("DD-MM-YYYY")
                    ) : (
                      <span>Pick a start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: new Date(dates.fromDate),
                      to: new Date(dates.toDate),
                    }}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={(date) =>
                      date >
                      moment().subtract(6, "days").startOf("day").toDate()
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Selected Range:</Label>
              <div className="flex items-center px-3 bg-blue-50 border border-blue-100 rounded-md h-11">
                {dates.fromDate ? (
                  <p className="text-xs text-blue-700 font-medium truncate">
                    <span className="font-bold">
                      {moment(dates.fromDate).format("DD-MM-YY")}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold">
                      {moment(dates.toDate).format("DD-MM-YY")}
                    </span>
                  </p>
                ) : (
                  <span className="text-xs text-gray-400">
                    No range selected
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <Button
                onClick={fetchDriverPerformanceReport}
                disabled={isLoading}
                className="h-11 w-full"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
              
              {reportData && reportData.length > 0 && (
                <Button onClick={exportToExcel} variant="outline" className="h-11 w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
              )}
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reportData && reportData.length > 0 ? (
              <FleetReportView
                reportData={reportData}
                rules={rules}
                calcEngines={{
                  mbgEngine: calculateDynamicMBG,
                  revenueEngine: evaluateRevenueIncentive,
                  additionalEngine: evaluateAdditionalIncentive,
                  otherEngine: evaluateOtherConditions,
                }}
              />
            ) : (
              reportData && (
                <p className="text-center text-muted-foreground py-8">
                  No data available for the selected date range
                </p>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewDriverPerformanceReport;
