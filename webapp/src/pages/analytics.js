import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";

function AttendanceInsights() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [studentAttendance, setStudentAttendance] = useState(null);
    const [dailyTrends, setDailyTrends] = useState([]);
    const [classWiseAttendance, setClassWiseAttendance] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/analytics/students")
            .then(response => setStudents(response.data))
            .catch(error => console.error("Error fetching student list:", error));

        axios.get("http://localhost:5000/analytics/daily-trends")
            .then(response => setDailyTrends(response.data))
            .catch(error => console.error("Error fetching daily trends:", error));

        axios.get("http://localhost:5000/analytics/class-wise")
            .then(response => setClassWiseAttendance(response.data))
            .catch(error => console.error("Error fetching class-wise attendance:", error));
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            axios.get(`http://localhost:5000/analytics/overall/${selectedStudent}`)
                .then(response => setStudentAttendance(response.data))
                .catch(error => console.error("Error fetching student attendance:", error));
        }
    }, [selectedStudent]);

    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

    return (
<div className="container py-5">
            <div className="header text-center p-4" style={{ backgroundColor: "#d30031", color: "white", borderRadius: "8px" }}>
                <h2>Attendance Insights</h2>
            </div>

            <div className="bg-light p-4 mt-3 rounded shadow">
                <h3 className="text-center">Select Student</h3>
                <div className="text-center mt-4">
                    <label className="fw-bold">Student:</label>
                    <select
                        className="form-select w-50 mx-auto mt-2"
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                        <option value="">Select a Student</option>
                        {students.map(student => (
                            <option key={student.id} value={student.id}>
                                {student.first_name} {student.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>


            {/* Student-specific Attendance */}
            {studentAttendance && studentAttendance.length > 0 && (
                <div className="bg-light p-4 mt-3 rounded shadow">
                    <h3 className="text-center">Attendance for Student {studentAttendance[0].student_number}</h3>
                    <div className="d-flex justify-content-center">
                        <PieChart width={400} height={400}>
                            <Pie data={studentAttendance} dataKey="attendance_count" nameKey="class_name" outerRadius={150} label>
                                {studentAttendance.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>
                </div>
            )}

            {/* Daily Attendance Trends */}
            <div className="bg-light p-4 mt-3 rounded shadow">
                <h3 className="text-center">Daily Attendance Trends</h3>
                {dailyTrends.length > 0 && (
                    <div className="d-flex justify-content-center">
                        <LineChart width={700} height={400} data={dailyTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="attendance" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                    </div>
                )}
            </div>

            {/* Class-wise Attendance */}
            <div className="bg-light p-4 mt-3 rounded shadow">
                <h3 className="text-center">Class-wise Attendance</h3>
                {classWiseAttendance.length > 0 && (
                    <div className="d-flex justify-content-center">
                        <BarChart width={700} height={400} data={classWiseAttendance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="class_name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="attendance" fill="#82ca9d" />
                        </BarChart>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AttendanceInsights;
