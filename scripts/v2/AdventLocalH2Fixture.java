import java.sql.*;
public class AdventLocalH2Fixture {
 public static void main(String[] a)throws Exception{
 Class.forName("org.h2.Driver");try(Connection c=DriverManager.getConnection("jdbc:h2:file:"+a[0]+";MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE","sa", "")) {
 if(a[1].equals("init")){try(Statement s=c.createStatement()){
 s.execute("CREATE TABLE users(id UUID PRIMARY KEY)");
 s.execute("INSERT INTO users VALUES ('00000000-0000-0000-0000-000000000001')");
 java.nio.file.Path dir=java.nio.file.Paths.get(a[2]);
 try(java.util.stream.Stream<java.nio.file.Path> files=java.nio.file.Files.list(dir)){
  for(java.nio.file.Path file:(Iterable<java.nio.file.Path>)files.filter(p->p.getFileName().toString().matches("V(7[0-9]|8[0-4])__.*\\.sql")).sorted()::iterator)
   s.execute("RUNSCRIPT FROM '"+file.toAbsolutePath().toString().replace("'","''")+"'");
 }
 }}else if(a[1].equals("hold")){System.out.println("READY");System.out.flush();System.in.read();}
 else if(a[1].equals("legacy-valid")){try(Statement q=c.createStatement()){
 q.execute("INSERT INTO advent_quizzes (quiz_day,display_name,portrait_ref,statement_0,statement_1,statement_2,false_choice,explanation) VALUES (1,'Fiction','fiction.png','one','two','three',2,NULL)");
 q.execute("INSERT INTO advent_character_reservations(quiz_day,character_key,display_name,portrait_ref) VALUES (1,NULL,'Fiction','fiction.png')");
 }}
 else if(a[1].equals("legacy-fixture")){try(Statement q=c.createStatement()){
 q.execute("INSERT INTO advent_quizzes (quiz_day,display_name,portrait_ref,statement_0,statement_1,statement_2,false_choice,explanation) VALUES (1,'Fictional fixture','fixture.png','a','b','c',0,NULL)");
 q.execute("INSERT INTO advent_character_reservations(quiz_day,character_key,display_name,portrait_ref) VALUES (1,NULL,'Fictional fixture','fixture.png')");
 }}
 else if(a[1].equals("activity")){c.createStatement().execute("INSERT INTO advent_test_generations(user_id,quiz_day,generation) VALUES ('00000000-0000-0000-0000-000000000001',"+(a.length>2?Integer.parseInt(a[2]):1)+",'00000000-0000-0000-0000-000000000002')");}
 else if(a[1].equals("conflict")){c.createStatement().execute("INSERT INTO advent_quizzes (quiz_day,display_name,portrait_ref,statement_0,statement_1,statement_2,false_choice,explanation) VALUES (1,'other','other.png','a','b','c',0,NULL)");}
 else if(a[1].equals("score-seed")){try(Statement q=c.createStatement()){
 for(int day:new int[]{10,11,12,13})q.execute("INSERT INTO advent_test_answers(user_id,quiz_day,choice,correct_choice,response_points,participation_points,bonus_points,received_at,reveal_at) VALUES ('00000000-0000-0000-0000-000000000001',"+day+",0,0,10,1,"+(day==12?2:0)+",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
 q.execute("INSERT INTO advent_test_member_state(user_id,correct_streak) VALUES ('00000000-0000-0000-0000-000000000001',4)");
 }}
 else if(a[1].equals("score-check")){try(ResultSet r=c.createStatement().executeQuery("SELECT quiz_day,bonus_points FROM advent_test_answers ORDER BY quiz_day")){while(r.next())System.out.print(r.getInt(1)+":"+r.getInt(2)+",");}try(ResultSet r=c.createStatement().executeQuery("SELECT correct_streak FROM advent_test_member_state")){r.next();System.out.print("streak:"+r.getInt(1));}}
 else if(a[1].equals("name")){try(ResultSet r=c.createStatement().executeQuery("SELECT display_name FROM advent_quizzes WHERE quiz_day=1")){r.next();System.out.println(r.getString(1));}}
 else if(a[1].equals("deleted-count")){try(ResultSet r=c.createStatement().executeQuery("SELECT COUNT(*) FROM advent_local_deleted_days WHERE quiz_day=1")){r.next();System.out.println(r.getInt(1));}}
 else if(a[1].equals("count")){try(ResultSet r=c.createStatement().executeQuery("SELECT COUNT(*) FROM advent_quizzes")){r.next();System.out.println(r.getInt(1));}}
 }
 }
}
