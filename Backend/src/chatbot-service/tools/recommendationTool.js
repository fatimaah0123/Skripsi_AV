import pool from "../../config/pool.js";

export async function getLatestRecommendation(machineCode) {
  const { rows } = await pool.query(
    `
    SELECT
      mr.rul_hours,
      mr.rul_days,
      mr.status,
      mr.priority,
      mr.action
    FROM maintenance_recommendations mr
    JOIN data_sensors ds
      ON ds.id = mr.data_sensors_id
    JOIN machines m
      ON m.id = ds.machine_id
    WHERE m.code = $1
    ORDER BY mr.created_at DESC
    LIMIT 1
    `,
    [machineCode],
  );

  return rows[0] || null;
}
