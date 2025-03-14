import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

function Analytics() {
    const [attendanceData, setAttendanceData] = useState([]);
    const [studentAttendance, setStudentAttendance] = useState([]);
        const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState([]);

    // Fetch attendance per module (stacked bar chart)
    useEffect(() => {
        axios.get("http://localhost:5000/analytics")
            .then(response => setAttendanceData(response.data))
            .catch(error => console.error("Error fetching attendance by module:", error));
    }, []);

    // Fetch attendance by student
    useEffect(() => {
        axios.get("http://localhost:5000/analytics/students")
            .then(response => setStudentAttendance(response.data))
            .catch(error => console.error("Error fetching attendance by student:", error));
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            axios.get(`http://localhost:5000/analytics/${selectedStudent}`)
                .then(response => setAttendanceData(response.data))
                .catch(error => console.error("Error fetching attendance:", error));
        }
    }, [selectedStudent]);

    return (
        <div>
            <h2>Attendance Overview</h2>

            {/* Stacked Bar Chart for Attendance per Module */}
            <h3>Attendance per Module</h3>
            {attendanceData.length > 0 && (
                <BarChart width={700} height={400} data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(attendanceData[0]).filter(k => k !== "class_name").map((name, index) => (
                        <Bar key={name} dataKey={name} stackId="a" fill={getColor(index)} />
                    ))}
                </BarChart>
            )}

            {/* Bar Chart for Attendance by Student */}
            <h3>Attendance by Student</h3>
            {studentAttendance.length > 0 && (
                <BarChart width={700} height={400} data={studentAttendance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attendance" fill="#82ca9d" />
                </BarChart>
            )}

            <div>
                <label>Select Student</label>
                <select onChange={(e) => setSelectedStudent(e.target.value)}>
                    <option value="">Select a student</option>
                    {students.map(student => (
                        <option key={student.id} value={student.id}>
                            {student.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

// Function to assign different colors to students in the stacked chart
const getColor = (index) => {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];
    return colors[index % colors.length];
};

export default Analytics;
