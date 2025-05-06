import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend} from "recharts";

function AttendanceInsights() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [studentAttendance, setStudentAttendance] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:5000/analytics/students")
            .then(response => setStudents(response.data))
            .catch(error => console.error("Error fetching student list:", error));
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            axios.get(`http://localhost:5000/analytics/overall/${selectedStudent}`)
                .then(response => setStudentAttendance(response.data))
                .catch(error => console.error("Error fetching student attendance:", error));
        }
    }, [selectedStudent]);


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
                    {students.map(student => (
                    <option key={student.student_number} value={student.student_number}>
                        {student.first_name} {student.last_name} ({student.student_number})
                    </option>
                ))}
                    </select>
                </div>
            </div>

            {studentAttendance && studentAttendance.length > 0 && (
            <div className="bg-light p-4 mt-3 rounded shadow">
                <h3 className="text-center">Attendance for Student {studentAttendance[0].student_number}</h3>
                <div className="d-flex justify-content-center">
                    <BarChart width={600} height={400} data={studentAttendance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="class_name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="attendance_count" fill="#8884d8" />
                    </BarChart>
                </div>
            </div>
            )}
        </div>
    );
}

export default AttendanceInsights;
