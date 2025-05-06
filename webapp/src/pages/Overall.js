import { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    LineChart,
    Line,
} from "recharts";

function OverallAttendanceInsights() {
    const [dailyTrends, setDailyTrends] = useState([]);

    const fetchDailyTrends = async () => {
        try {
            const res = await fetch("http://localhost:5000/analytics/daily-trends");
            const data = await res.json();
            setDailyTrends(data);
        } catch (err) {
            console.error("Error fetching daily trends", err);
        }
    };

    const [overallModuleAttendance, setOverallModuleAttendance] = useState([]);

    const fetchOverallModuleAttendance = async () => {
        try {
            const res = await fetch("http://localhost:5000/analytics/overall-module-attendance");
            const data = await res.json();
            setOverallModuleAttendance(data);
        } catch (err) {
            console.error("Error fetching module attendance", err);
        }
    };

    useEffect(() => {
        fetchOverallModuleAttendance();
    }, []);

    useEffect(() => {
        fetchDailyTrends();
    }, []);

    return (
<div className="container py-5">
    <div
        className="header text-center p-4"
        style={{ backgroundColor: "#d30031", color: "white", borderRadius: "8px" }}
    >
        <h2>Overall Attendance Insights</h2>
    </div>

    {/* Daily Attendance Trend */}
    <div className="bg-light p-4 mt-4 rounded shadow">
        <h3 className="text-center">Daily Attendance (Cohort-wide)</h3>

        <div className="d-flex justify-content-center">
            {dailyTrends.length > 0 ? (
                <LineChart width={800} height={400} data={dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="attendance"
                        stroke="#82ca9d"
                        strokeWidth={2}
                    />
                </LineChart>
            ) : (
                <p className="text-center text-muted">Loading daily attendance data...</p>
            )}
        </div>
    </div>

    {/* Overall Module Attendance */}
    <div className="bg-light p-4 mt-4 rounded shadow">
        <h3 className="text-center">Overall Attendance per Module</h3>

        <div className="d-flex justify-content-center">
            {overallModuleAttendance.length > 0 ? (
                <BarChart width={800} height={400} data={overallModuleAttendance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="attendance_count" fill="#8884d8" />
                </BarChart>
            ) : (
                <p className="text-center text-muted">Loading module attendance data...</p>
            )}
        </div>
    </div>
</div>
    );
}

export default OverallAttendanceInsights;
