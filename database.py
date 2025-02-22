import mysql.connector
import pickle  # ✅ Import pickle to serialize NumPy arrays

def get_db_connection():
    connection = mysql.connector.connect(
        host="192.168.1.208",
        user="dan",
        passwd="12345678",
        database="face_recognition",
    )
    return connection

def save_face_db(student_id, face_encoding):
    connection = get_db_connection()
    cursor = connection.cursor()

    # ✅ Convert NumPy array to binary (BLOB storage)
    face_encoding_blob = pickle.dumps(face_encoding)

    try:
        cursor.execute("INSERT INTO faces (student_id, face_encoding) VALUES (%s, %s)", (student_id, face_encoding_blob))
        connection.commit()
    except mysql.connector.Error as err:
        print(f"Error saving face encoding: {err}")
    finally:
        cursor.close()
        connection.close()
