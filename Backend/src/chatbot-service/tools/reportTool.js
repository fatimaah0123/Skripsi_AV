import pool from "../../config/pool.js";

export async function getLastReport(machineCode) {
  const { rows } = await pool.query(
    `
    SELECT
      mr.description,
      mr.created_at
    FROM maintenance_reports mr
    JOIN maintenance_tickets mt
      ON mt.id = mr.maintenance_ticket_id
    JOIN machines m
      ON m.id = mt.machine_id
    WHERE m.code = $1
    ORDER BY mr.created_at DESC
    LIMIT 1
    `,
    [machineCode],
  );

  return rows[0] || null;
}
