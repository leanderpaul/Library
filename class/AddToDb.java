import java.io.FileReader;
import java.io.BufferedReader;
import java.util.LinkedList;
import java.util.Queue;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

class AddToDb {

    public static FileReader fileReader;
    public static BufferedReader bufferedReader;
    public static boolean isReadComplete = false;
    public static String temp;

    AddToDb() {
        try {
            this.fileReader = new FileReader("/home/si180/Documents/Library/data/testDataOneGigaByte.txt");
            this.bufferedReader = new BufferedReader(fileReader);
            Class.forName("com.mysql.jdbc.Driver");  
            Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/library", "library", "library");
            Statement stmt = con.createStatement();
            stmt.execute("create table if not exists books(bookName varchar(32) primary key, author varchar(32), count int)");
            con.close();
        } catch (Exception e) {
            System.err.println(e);
        }
    }

    public void readAChunk() {
        Queue<String> queue = new LinkedList<>();
        // System.out.println("Queue size = " + queue.size());
        while (queue.size() < 11) {
            try {
                temp = bufferedReader.readLine();
                if (temp == null) {
                    this.isReadComplete = true;
                    break;
                }
                queue.add(temp);
            } catch(Exception e) {
                System.err.println(e);
            }
            
        }
        // System.out.println(queue);
        // System.out.println();
    }

    public void readFile() {
        while(this.isReadComplete == false)
            readAChunk();
    }

}
