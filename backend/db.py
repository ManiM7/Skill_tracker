import psycopg2

DB_HOST = "localhost"
DB_NAME = "tracker_db"
DB_USER = "postgres"
DB_PASS = "Mani2605#"
DB_PORT = "5432"

def get_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT,
    )
