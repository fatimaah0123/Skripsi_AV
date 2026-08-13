import pool from "../../config/pool.js";

export async function getMachineByCode(code) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      code,
      name,
      type,
      location,
      status
    FROM machines
    WHERE code = $1
    `,
    [code],
  );

  return rows[0] || null;
}

import pool from "../../config/pool.js";

export async function getCriticalMachines() {
  const { rows } = await pool.query(
    `
    SELECT
      m.code,
      m.name,
      mr.rul_days,
      mr.priority
    FROM maintenance_recommendations mr
    JOIN data_sensors ds
      ON ds.id = mr.data_sensors_id
    JOIN machines m
      ON m.id = ds.machine_id
    WHERE mr.rul_days <= 7
    ORDER BY mr.rul_days ASC
    `,
  );

  return rows;
}
