-- Preserve historical answers whose original offline demo quiz cannot be matched
-- to the shared catalogue. No content or answers are copied or changed.
CREATE TABLE advent_offline_content_conflicts (quiz_day INTEGER PRIMARY KEY);
INSERT INTO advent_offline_content_conflicts (quiz_day)
SELECT DISTINCT a.quiz_day FROM advent_member_answers a
LEFT JOIN advent_member_demo_quizzes d ON d.quiz_day = a.quiz_day
LEFT JOIN advent_quizzes q ON q.quiz_day = a.quiz_day
WHERE d.quiz_day IS NULL OR q.quiz_day IS NULL
   OR d.display_name <> q.display_name OR d.statement_0 <> q.statement_0
   OR d.statement_1 <> q.statement_1 OR d.statement_2 <> q.statement_2
   OR d.false_choice <> q.false_choice;
