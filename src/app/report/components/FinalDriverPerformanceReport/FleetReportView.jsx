import { useState } from "react";
import MBGDetailModal from "./MBGDetailModal";

const FleetReportView = ({
  reportData,
  fetchMBGdata,
  popupData,
  mbgLoading,
}) => {
  const [selectedDriver, setSelectedDriver] = useState(null);

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
      <MBGDetailModal
        driver={selectedDriver}
        fetchMBGdata={fetchMBGdata}
        popupData={popupData}
        mbgLoading={mbgLoading} // ✅ new prop
        onClose={() => setSelectedDriver(null)}
      />

      <div className="max-h-[500px] overflow-y-auto rounded-lg w-full">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-blue-900">
            <tr>
              <th
                className={`${colHeaderClass} sticky left-0 z-auto bg-blue-900`}
              >
                Driver Name
              </th>
              <th className={colHeaderClass} title="Opening Balance">
                Opening
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
              <th className={colHeaderClass} title="Paid Amount">
                Paid
              </th>
              <th className={`${colHeaderClass} bg-yellow-500 text-black`}>
                Closing
              </th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, i) => {
              const isEven = i % 2 === 0;
              const rowBg = isEven ? "bg-white" : "bg-gray-50";

              const calculatedClosingBalance =
                Number(row.opening_balance) +
                Number(row.finalPayout) -
                Number(row.driver_payment);

              return (
                <tr
                  key={row.driver_full_name}
                  className={`${rowBg} hover:bg-blue-50`}
                >
                  <td className={`${nameCellClass} ${rowBg}`}>
                    {row.driver_full_name}
                  </td>
                  <td className={cellClass}>{row.opening_balance}</td>
                  <td
                    className={`${cellClass} text-green-700 font-bold cursor-pointer hover:underline`}
                    onClick={() => setSelectedDriver(row)}
                    title="Click to see daily breakdown"
                  >
                    {row.mbg}
                  </td>
                  <td className={cellClass}>{row.acceptence}%</td>
                  <td className={cellClass}>{row.totalearings}</td>
                  <td className={cellClass}>{row.totalrevenue}</td>
                  <td className={cellClass}>{row.additionalIncentive}</td>
                  <td className={cellClass}>{row.totalCashCollected}</td>
                  <td className={cellClass}>{row.totalCashDepositAmount}</td>
                  <td className={cellClass}>{row.totalQRDepositAmount}</td>
                  <td
                    className={`${cellClass} bg-red-100 text-red-700 font-semibold`}
                  >
                    {row.cashBalance}
                  </td>
                  <td
                    className={`${cellClass} bg-orange-100 text-orange-700 font-semibold`}
                  >
                    {row.totalPayout}
                  </td>
                  <td className={cellClass}>{row.payoutAdj}</td>
                  <td className={cellClass}>{row.totalCreditAmount}</td>
                  <td className={cellClass}>{row.totalDebiitAmount}</td>
                  <td className={cellClass}>{row.totalCustomerTipsAmount}</td>
                  <td
                    className={`${cellClass} font-bold text-sm ${
                      row.finalPayout >= 0
                        ? "text-green-700 bg-green-50"
                        : "text-red-700 bg-red-50"
                    }`}
                  >
                    {row.finalPayout}
                  </td>
                  <td className={cellClass}>{row.driver_payment}</td>
                  <td
                    className={`${cellClass} font-bold text-sm ${
                      calculatedClosingBalance >= 0
                        ? "text-green-700 bg-green-50"
                        : "text-red-700 bg-red-50"
                    }`}
                  >
                    {calculatedClosingBalance}
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

export default FleetReportView;
