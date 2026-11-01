import java.io.*;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.*;

// The connection remains open for the entire operator session. No private values
// are written to stderr; protocol data flows only through the parent process pipe.
public final class AdventLocalH2 {
  static final String[] TABLES={"advent_member_answers","advent_member_attempts","advent_member_generations","advent_member_replays","advent_test_answers","advent_test_attempts","advent_test_generations","advent_test_replays"};
  static String encode(String s) { return s==null?"-":Base64.getEncoder().encodeToString(s.getBytes(StandardCharsets.UTF_8)); }
  static String decode(String s) { return s.equals("-")?null:new String(Base64.getDecoder().decode(s),StandardCharsets.UTF_8); }
  public static void main(String[] args) {
    try {
      if(args.length!=1)throw new Exception();
      Class.forName("org.h2.Driver");
      try(Connection c=DriverManager.getConnection("jdbc:h2:file:"+args[0]+";IFEXISTS=TRUE;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;LOCK_TIMEOUT=250","sa", "");
          BufferedReader in=new BufferedReader(new InputStreamReader(System.in,StandardCharsets.UTF_8));
          PrintWriter out=new PrintWriter(new OutputStreamWriter(System.out,StandardCharsets.UTF_8),true)) {
        c.setAutoCommit(false);out.println("READY");
        String line;
        while((line=in.readLine())!=null) {
          String[] p=line.split("\\t",-1);
          if(p[0].equals("CHECK")&&p.length==2) {
            int day=Integer.parseInt(p[1]);if(day<1||day>24)throw new Exception();
            try(PreparedStatement q=c.prepareStatement("SELECT display_name,portrait_ref,statement_0,statement_1,statement_2,false_choice,explanation FROM advent_quizzes WHERE quiz_day=?")) {
              q.setInt(1,day);try(ResultSet r=q.executeQuery()) {if(!r.next())out.println("ABSENT");else {StringJoiner j=new StringJoiner("\t","ROW\t","");for(int i=1;i<=7;i++)j.add(encode(r.getString(i)));out.println(j);}}
            }
          } else if(p[0].equals("ADD")&&p.length==9) {
            int day=Integer.parseInt(p[1]);if(day<1||day>24)throw new Exception();
            for(String table:TABLES)try(PreparedStatement q=c.prepareStatement("SELECT 1 FROM "+table+" WHERE quiz_day=? LIMIT 1")){q.setInt(1,day);try(ResultSet r=q.executeQuery()){if(r.next())throw new Exception();}}
            try(PreparedStatement q=c.prepareStatement("INSERT INTO advent_quizzes (quiz_day,display_name,portrait_ref,statement_0,statement_1,statement_2,false_choice,explanation) VALUES (?,?,?,?,?,?,?,?)")) {
              q.setInt(1,day);for(int i=2;i<=6;i++)q.setString(i,decode(p[i]));q.setInt(7,Integer.parseInt(decode(p[7])));q.setString(8,decode(p[8]));if(q.executeUpdate()!=1)throw new Exception();
            } out.println("OK");
          } else if(p[0].equals("REPLACE")&&p.length==16) {
            int day=Integer.parseInt(p[1]);if(day<1||day>24)throw new Exception();
            for(String table:TABLES)try(PreparedStatement q=c.prepareStatement("SELECT 1 FROM "+table+" WHERE quiz_day=? LIMIT 1")){q.setInt(1,day);try(ResultSet r=q.executeQuery()){if(r.next())throw new Exception();}}
            String sql="UPDATE advent_quizzes SET display_name=?,portrait_ref=?,statement_0=?,statement_1=?,statement_2=?,false_choice=?,explanation=? WHERE quiz_day=? AND display_name IS NOT DISTINCT FROM ? AND portrait_ref IS NOT DISTINCT FROM ? AND statement_0 IS NOT DISTINCT FROM ? AND statement_1 IS NOT DISTINCT FROM ? AND statement_2 IS NOT DISTINCT FROM ? AND false_choice IS NOT DISTINCT FROM ? AND explanation IS NOT DISTINCT FROM ?";
            try(PreparedStatement q=c.prepareStatement(sql)) {
              for(int i=0;i<7;i++){if(i==5)q.setInt(i+1,Integer.parseInt(decode(p[2+i])));else q.setString(i+1,decode(p[2+i]));}
              q.setInt(8,day);
              for(int i=0;i<7;i++){if(i==5)q.setInt(i+9,Integer.parseInt(decode(p[9+i])));else q.setString(i+9,decode(p[9+i]));}
              if(q.executeUpdate()!=1)throw new Exception();
            } out.println("OK");
          } else if(p[0].equals("RESERVATION")&&p.length==2) {
            int day=Integer.parseInt(p[1]);if(day<1||day>24)throw new Exception();
            try(PreparedStatement q=c.prepareStatement("SELECT character_key,display_name,portrait_ref FROM advent_character_reservations WHERE quiz_day=?")) {
              q.setInt(1,day);try(ResultSet r=q.executeQuery()){if(!r.next())out.println("ABSENT");else out.println("ROW\t"+encode(r.getString(1))+"\t"+encode(r.getString(2))+"\t"+encode(r.getString(3)));}
            }
          } else if((p[0].equals("CHARACTER") || p[0].equals("QUIZ")) && p.length==11) {
            int day=Integer.parseInt(p[1]);String key=decode(p[2]),name=decode(p[3]),portrait=decode(p[4]);
            if(day<1||day>24||key==null||name==null||portrait==null)throw new Exception();
            boolean found=false;String oldKey=null,oldName=null,oldPortrait=null;
            try(PreparedStatement q=c.prepareStatement("SELECT quiz_day,character_key,display_name,portrait_ref FROM advent_character_reservations WHERE quiz_day=? OR character_key=?")){
              q.setInt(1,day);q.setString(2,key);try(ResultSet r=q.executeQuery()){while(r.next()){
                if(r.getInt(1)!=day||found)throw new Exception();found=true;oldKey=r.getString(2);oldName=r.getString(3);oldPortrait=r.getString(4);
              }}
            }
            if(found && ((oldKey!=null&&!oldKey.equals(key))||(oldKey==null&&(!Objects.equals(oldName,name)||(!Objects.equals(oldPortrait,portrait)&&!p[10].equals("VERIFIED"))))))throw new Exception();
            if(p[0].equals("CHARACTER")){
              try(PreparedStatement q=c.prepareStatement("DELETE FROM advent_local_deleted_days WHERE quiz_day=?")){q.setInt(1,day);q.executeUpdate();}
              String sql=found?"UPDATE advent_character_reservations SET character_key=?,display_name=?,portrait_ref=? WHERE quiz_day=?":"INSERT INTO advent_character_reservations (character_key,display_name,portrait_ref,quiz_day) VALUES (?,?,?,?)";
              try(PreparedStatement q=c.prepareStatement(sql)){q.setString(1,key);q.setString(2,name);q.setString(3,portrait);q.setInt(4,day);q.executeUpdate();}
              try(PreparedStatement q=c.prepareStatement("UPDATE advent_quizzes SET display_name=?,portrait_ref=? WHERE quiz_day=?")){q.setString(1,name);q.setString(2,portrait);q.setInt(3,day);q.executeUpdate();}
            } else {
              if(!found)throw new Exception();
              try(PreparedStatement q=c.prepareStatement("UPDATE advent_character_reservations SET character_key=? WHERE quiz_day=?")){q.setString(1,key);q.setInt(2,day);q.executeUpdate();}
              try(PreparedStatement q=c.prepareStatement("UPDATE advent_quizzes SET statement_0=?,statement_1=?,statement_2=?,false_choice=?,explanation=? WHERE quiz_day=?")){
                for(int i=0;i<3;i++){String value=decode(p[5+i]);if(value==null)throw new Exception();q.setString(i+1,value);}int choice=Integer.parseInt(decode(p[8]));if(choice<0||choice>2)throw new Exception();q.setInt(4,choice);q.setString(5,decode(p[9]));q.setInt(6,day);
                if(q.executeUpdate()==0)try(PreparedStatement add=c.prepareStatement("INSERT INTO advent_quizzes (quiz_day,display_name,portrait_ref,statement_0,statement_1,statement_2,false_choice,explanation) VALUES (?,?,?,?,?,?,?,?)")){
                  add.setInt(1,day);add.setString(2,oldName);add.setString(3,oldPortrait);for(int i=0;i<3;i++)add.setString(4+i,decode(p[5+i]));add.setInt(7,choice);add.setString(8,decode(p[9]));add.executeUpdate();
                }
              }
            }
            out.println("OK");
          } else if(p[0].equals("DELETE") && p.length>=2) {
            Set<Integer> days=new TreeSet<>();
            for(int i=1;i<p.length;i++){int day=Integer.parseInt(p[i]);if(day<1||day>24||!days.add(day))throw new Exception();}
            Set<String> users=new HashSet<>();
            for(int day:days){
              try(PreparedStatement q=c.prepareStatement("SELECT DISTINCT user_id FROM advent_test_answers WHERE quiz_day=?")){q.setInt(1,day);try(ResultSet r=q.executeQuery()){while(r.next())users.add(r.getString(1));}}
              for(String table:TABLES)try(PreparedStatement q=c.prepareStatement("DELETE FROM "+table+" WHERE quiz_day=?")){q.setInt(1,day);q.executeUpdate();}
              for(String table:new String[]{"advent_offline_content_conflicts","advent_member_demo_quizzes","advent_quizzes"})try(PreparedStatement q=c.prepareStatement("DELETE FROM "+table+" WHERE quiz_day=?")){q.setInt(1,day);q.executeUpdate();}
              try(PreparedStatement marker=c.prepareStatement("MERGE INTO advent_local_deleted_days (quiz_day) KEY (quiz_day) VALUES (?)")){marker.setInt(1,day);marker.executeUpdate();}
              try(PreparedStatement q=c.prepareStatement("DELETE FROM advent_character_reservations WHERE quiz_day=?")){q.setInt(1,day);q.executeUpdate();}
            }
            for(String user:users){
              int streak=0;
              try(PreparedStatement q=c.prepareStatement("SELECT quiz_day,choice,correct_choice FROM advent_test_answers WHERE user_id=? ORDER BY quiz_day")){
                q.setObject(1,UUID.fromString(user));try(ResultSet r=q.executeQuery()){while(r.next()){
                  streak=r.getInt(2)==r.getInt(3)?streak+1:0;
                  try(PreparedStatement update=c.prepareStatement("UPDATE advent_test_answers SET bonus_points=? WHERE user_id=? AND quiz_day=?")){update.setInt(1,streak>0&&streak%3==0?2:0);update.setObject(2,UUID.fromString(user));update.setInt(3,r.getInt(1));update.executeUpdate();}
                }}
              }
              try(PreparedStatement q=c.prepareStatement("UPDATE advent_test_member_state SET correct_streak=? WHERE user_id=?")){q.setInt(1,streak);q.setObject(2,UUID.fromString(user));if(q.executeUpdate()==0)try(PreparedStatement add=c.prepareStatement("INSERT INTO advent_test_member_state (user_id,correct_streak) VALUES (?,?)")){add.setObject(1,UUID.fromString(user));add.setInt(2,streak);add.executeUpdate();}}
            }
            out.println("OK");
          } else if(p.length==1&&p[0].equals("COMMIT")){c.commit();out.println("COMMITTED");break;}
          else if(p.length==1&&p[0].equals("CANCEL")){c.rollback();out.println("CANCELLED");break;}
          else throw new Exception();
        }
      }
    } catch(Exception ignored) { System.err.println("Local target refused"); System.exit(1); }
  }
}
