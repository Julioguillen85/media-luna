import psycopg2

try:
    conn = psycopg2.connect(
        dbname="msvc_cursos",
        user="postgres",
        password="Cyofeds8",
        host="localhost"
    )
    cur = conn.cursor()
    cur.execute("""
        SELECT p.name, t.min_guests, t.max_guests, t.price 
        FROM price_tier t 
        JOIN products p ON t.product_id = p.id 
        WHERE p.name ILIKE '%Elote%' 
        ORDER BY p.name, t.min_guests;
    """)
    rows = cur.fetchall()
    for row in rows:
        print(f"{row[0]}: {row[1]}-{row[2]} -> {row[3]}")
except Exception as e:
    print("Error:", e)
