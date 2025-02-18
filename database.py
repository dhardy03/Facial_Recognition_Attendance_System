import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="192.168.1.208",
        user="dan",
        passwd="12345678",
        database="face_recognition",  # Corrected 'databse' to 'database'
    )
    return connection

def save_face_db(student_id, face_encoding):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO faces (student_id, face_encoding) VALUES (%s, %s)", (student_id, face_encoding))
    connection.commit()
    cursor.close()
    connection.close()