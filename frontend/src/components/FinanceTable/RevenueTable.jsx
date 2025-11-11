//RevenueTable.jsx
import React from "react";
import { Line } from "react-chartjs-2";

const RevenueTable = ({ revenueData, revenueOptions }) => {
    return (
        <>
            <h6 className="fw-bold mb-0">Revenue Trend</h6>
            <small className="text-muted">Monthly revenue over time</small>
            <div style={{ height: "420px" }} className="w-100">
                <Line data={revenueData} options={revenueOptions} />
            </div>
        </>
    );
};

export default RevenueTable;
