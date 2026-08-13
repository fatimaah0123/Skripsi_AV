import pool from "../../config/pool.js";

export async function getOpenTickets(machineCode) {
  const { rows } = await pool.query(
    `
    SELECT
      mt.id,
      mt.status,
      mt.created_at,
      u.name AS engineer_name
    FROM maintenance_tickets mt
    JOIN machines m
      ON m.id = mt.machine_id
    LEFT JOIN users u
      ON u.id = mt.assigned_engineer_id
    WHERE m.code = $1
      AND mt.status != 'Done'
    ORDER BY mt.created_at DESC
    `,
    [machineCode],
  );

  return rows;
}
