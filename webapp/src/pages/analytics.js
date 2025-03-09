import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function Analytics() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);

    // Fetch student list on mount
    useEffect(() => {
        axios.get("http://localhost:5000/students")
            .then(response => setStudents(response.data))
            .catch(error => console.error("Error fetching students:", error));
    }, []);

    // Fetch attendance when a student is selected
    useEffect(() => {
        if (selectedStudent) {
            axios.get(`http://localhost:5000/analytics/${selectedStudent}`)
                .then(response => {
                    setAttendanceData(response.data);
                })
                .catch(error => console.error("Error fetching attendance:", error));
        }
    }, [selectedStudent]);

    return (
        <div>
            <h2>Student Attendance</h2>

            {/* Dropdown to select a student */}
            <select onChange={(e) => setSelectedStudent(Number(e.target.value))}>
                <option value="">Select a student</option>
                {students.map(student => (
                    <option key={student.id} value={student.id}>
                        {student.name}
                    </option>
                ))}
            </select>

            {/* Show chart only if a student is selected */}
            {selectedStudent && attendanceData.length > 0 && (
                <BarChart width={600} height={300} data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="class_id" fill="#8884d8" />
                </BarChart>
            )}
        </div>
    );
}

export default Analytics;
