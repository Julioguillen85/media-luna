import java.sql.*;

public class TestElote {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/msvc_cursos";
        try (Connection conn = DriverManager.getConnection(url, "postgres", "Cyofeds8");
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(
                        "SELECT p.name, t.min_guests, t.max_guests, t.price FROM price_tier t JOIN products p ON t.product_id = p.id WHERE p.name ILIKE '%Elote%' ORDER BY p.name, t.min_guests;")) {
            while (rs.next()) {
                System.out
                        .println(rs.getString(1) + " | " + rs.getInt(2) + "-" + rs.getInt(3) + " | " + rs.getDouble(4));
            }
        }
    }
}
