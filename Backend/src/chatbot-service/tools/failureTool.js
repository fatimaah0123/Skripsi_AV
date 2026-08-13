import pool from "../../config/pool.js";

export async function getLatestFailure(machineCode) {
  const { rows } = await pool.query(
    `
    SELECT
      fs.type,
      fs.confidence,
      fs.heat_dissipation_failure,
      fs.random_failures,
      fs.overstrain_failure,
      fs.power_failure,
      fs.tool_wear_failure
    FROM failure_statistics fs
    JOIN maintenance_recommendations mr
      ON mr.id = fs.maintenance_recommendation_id
    JOIN data_sensors ds
      ON ds.id = mr.data_sensors_id
    JOIN machines m
      ON m.id = ds.machine_id
    WHERE m.code = $1
    ORDER BY fs.created_at DESC
    LIMIT 1
    `,
    [machineCode],
  );

  return rows[0] || null;
}
