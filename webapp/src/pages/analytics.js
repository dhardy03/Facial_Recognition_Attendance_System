import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

function Analytics() {
    const [attendanceData, setAttendanceData] = useState([]);
    const [studentNames, setStudentNames] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/analytics")
            .then(response => {
                setAttendanceData(response.data);

                // Extract unique student names from data
                const names = new Set();
                response.data.forEach(entry => {
                    Object.keys(entry).forEach(key => {
                        if (key !== "class_name") names.add(key);
                    });
                });

                setStudentNames([...names]);
            })
            .catch(error => console.error("Error fetching attendance:", error));
    }, []);

    return (
        <div>
            <h2>Attendance Per Module</h2>
            {attendanceData.length > 0 && (
                <BarChart width={700} height={400} data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    {studentNames.map((name, index) => (
                        <Bar key={name} dataKey={name} stackId="a" fill={getColor(index)} />
                    ))}
                </BarChart>
            )}
        </div>
    );
}

// Function to generate unique colors for each student
const getColor = (index) => {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];
    return colors[index % colors.length]; // Cycle through colors
};

export default Analytics;
