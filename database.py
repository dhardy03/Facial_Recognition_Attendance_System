import mysql.connector
import pickle


def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host="192.168.1.208",
            user="dan",
            passwd="12345678",
            database="face_recognition",
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None


def save_face_db(student_number, face_encoding):
    connection = get_db_connection()
    if connection is None:
        print("Failed to connect to the database.")
        return

    cursor = connection.cursor()
    face_encoding_blob = pickle.dumps(face_encoding)

    try:
        # Check if the student already has a face encoding
        cursor.execute("SELECT student_number FROM faces WHERE student_number = %s", (student_number,))
        existing_record = cursor.fetchone()
        cursor.fetchall()  # Ensure any remaining results are cleared

        if existing_record:
            # Update existing face encoding
            cursor.execute("UPDATE faces SET face_encoding = %s WHERE student_number = %s",
                           (face_encoding_blob, student_number))
            print(f"Updated face encoding for student {student_number}.")
        else:
            # Insert new face encoding
            cursor.execute("INSERT INTO faces (student_number, face_encoding) VALUES (%s, %s)",
                           (student_number, face_encoding_blob))
            print(f"Saved new face encoding for student {student_number}.")

        connection.commit()
    except mysql.connector.Error as err:
        print(f"Error saving face encoding: {err}")
    finally:
        cursor.close()
        connection.close()