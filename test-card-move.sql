-- Test script to check card positions in database
SELECT 
    c.id,
    c.title,
    c.column_id,
    c.order,
    bc.name as column_name,
    bc.board_id,
    c.moved_at
FROM cards c
JOIN board_columns bc ON c.column_id = bc.id
ORDER BY bc.board_id, bc.order, c.order;
