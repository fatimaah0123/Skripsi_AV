import pool from "../config/pool.js";
import ForbiddenError from "../exceptions/ForbiddenError.js";
import NotFoundError from "../exceptions/NotFoundError.js";
import InvariantError from "../exceptions/InvariantError.js";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// === HELPERS ===

const syncEngineerStatus = async (client, engineer_id) => {
  const { rows } = await client.query(
    `
    SELECT COUNT(*)::int AS total
    FROM maintenance_ticket_assignments mta
    JOIN maintenance_tickets mt ON mta.maintenance_ticket_id = mt.id
    WHERE mta.user_id = $1
    AND mt.status = 'InProgress'
    `,
    [engineer_id],
  );

  const status = rows[0].total > 0 ? "Onduty" : "Active";

  await client.query(
    `
    UPDATE users
    SET status = $1
    WHERE id = $2
    `,
    [status, engineer_id],
  );
};

const syncAllAssignedEngineersStatus = async (client, ticket_id) => {
  const { rows } = await client.query(
    `
    SELECT user_id
    FROM maintenance_ticket_assignments
    WHERE maintenance_ticket_id = $1
    `,
    [ticket_id],
  );

  await Promise.all(rows.map((row) => syncEngineerStatus(client, row.user_id)));
};

// Sync status sekumpulan engineer sekaligus (dedup) - dipakai saat manageAssignments
const syncEngineersStatus = async (client, user_ids) => {
  const uniqueIds = [...new Set(user_ids)];
  await Promise.all(uniqueIds.map((uid) => syncEngineerStatus(client, uid)));
};

const syncMachineStatus = async (client, machine_id) => {
  const { rows } = await client.query(
    `
    SELECT COUNT(*)::int AS total
    FROM maintenance_tickets
    WHERE machine_id = $1
    AND status = 'InProgress'
    `,
    [machine_id],
  );

  const status = rows[0].total > 0 ? "Maintenance" : "Active";

  await client.query(
    `
    UPDATE machines
    SET status = $1
    WHERE id = $2
    `,
    [status, machine_id],
  );
};

// Ambil semua user_id yang sedang assigned di tiket ini (leader + member)
const getAssignedUserIds = async (client, ticket_id) => {
  const { rows } = await client.query(
    `SELECT user_id FROM maintenance_ticket_assignments WHERE maintenance_ticket_id = $1`,
    [ticket_id],
  );
  return rows.map((r) => r.user_id);
};

const getLeaderRow = async (client, ticket_id) => {
  const { rows } = await client.query(
    `
    SELECT id, user_id
    FROM maintenance_ticket_assignments
    WHERE maintenance_ticket_id = $1
    AND role = 'Leader'
    `,
    [ticket_id],
  );
  return rows[0] ?? null;
};

// Cek apakah user adalah Leader pada tiket ini (hanya leader yang boleh start/submit)
const verifyLeader = async (ticket_id, user_id) => {
  const { rows } = await pool.query(
    `
      SELECT id
      FROM maintenance_ticket_assignments
      WHERE maintenance_ticket_id = $1
      AND user_id = $2
      AND role = 'Leader'
    `,
    [ticket_id, user_id],
  );

  return rows.length > 0;
};

// Cek apakah user termasuk assignment tiket ini (Leader ATAU Member) - dipakai untuk hak lihat detail
const verifyAssigned = async (ticket_id, user_id) => {
  const { rows } = await pool.query(
    `
      SELECT id
      FROM maintenance_ticket_assignments
      WHERE maintenance_ticket_id = $1
      AND user_id = $2
    `,
    [ticket_id, user_id],
  );

  return rows.length > 0;
};

const verifyEngineer = async (engineer_id) => {
  const { rows } = await pool.query(
    `
      SELECT id
      FROM users
      WHERE id = $1
      AND role = 'Engineer'
    `,
    [engineer_id],
  );

  if (!rows.length) {
    throw new NotFoundError("Engineer tidak ditemukan");
  }
};

const verifyStatus = async (ticket_id, expectedStatuses) => {
  const allowed = Array.isArray(expectedStatuses)
    ? expectedStatuses
    : [expectedStatuses];

  const { rows } = await pool.query(
    `
      SELECT status
      FROM maintenance_tickets
      WHERE id = $1
    `,
    [ticket_id],
  );

  if (!rows.length) {
    throw new NotFoundError("Tiket tidak ditemukan");
  }

  if (!allowed.includes(rows[0].status)) {
    throw new ForbiddenError(`Status tiket harus ${allowed.join(" atau ")}`);
  }
};

const deleteImageFile = async (imageUrl) => {
  try {
    await fs.unlink(path.resolve(`.${imageUrl}`));
  } catch {
    // file mungkin sudah tidak ada, abaikan
  }
};

// === SERVICE ===

const ticketMaintenanceService = {
  getAllTickets: async (user_id, role) => {
    let query = `
      SELECT
        mt.id,
        mt.status,
        m.name AS machine_name,
        fs.type,
        mr.priority,
        mt.created_at
      FROM maintenance_tickets mt
      JOIN machines m ON mt.machine_id = m.id
      JOIN failure_statistics fs ON mt.failure_statistic_id = fs.id
      JOIN maintenance_recommendations mr ON fs.maintenance_recommendation_id = mr.id
    `;

    const params = [];

    // GANTI (alur baru): Engineer sekarang melihat tiket di mana dia terdaftar sebagai
    // Leader ATAU Member (dulu cuma Leader) — supaya Member juga bisa menemukan tiket yang
    // ditugaskan kepadanya lewat halaman daftar. Hak submit laporan tetap eksklusif milik
    // Leader (diatur di verifyLeader saat startTicket & submitTicket), jadi Member yang lihat
    // tiket ini di daftarnya tetap read-only.
    if (role !== "Admin") {
      query += `
        WHERE EXISTS (
          SELECT 1 FROM maintenance_ticket_assignments mta_self
          WHERE mta_self.maintenance_ticket_id = mt.id
          AND mta_self.user_id = $1
        )
      `;
      params.push(user_id);
    }

    query += ` ORDER BY mt.created_at DESC `;

    const { rows } = await pool.query(query, params);

    return rows;
  },

  getTicketById: async (id, user_id, role) => {
    if (role !== "Admin" && !(await verifyAssigned(id, user_id))) {
      throw new ForbiddenError(
        "Anda tidak memiliki izin untuk melihat tiket ini",
      );
    }

    const { rows } = await pool.query(
      `
      SELECT
        mt.id,
        mt.status,
        mt.notes,
        m.id AS machine_id,
        m.name AS machine_name,
        mr.rul_hours,
        mr.rul_days,
        mr.status AS maintenance_status,
        mr.priority,
        mr.action,
        fs.confidence,
        fs.type,
        mt.created_at,
        (
          SELECT json_agg(
            json_build_object('id', u.id, 'name', u.name, 'role', mta.role)
            ORDER BY mta.role
          )
          FROM maintenance_ticket_assignments mta
          JOIN users u ON mta.user_id = u.id
          WHERE mta.maintenance_ticket_id = mt.id
        ) AS engineers
      FROM maintenance_tickets mt
      JOIN machines m ON mt.machine_id = m.id
      JOIN failure_statistics fs ON mt.failure_statistic_id = fs.id
      JOIN maintenance_recommendations mr ON fs.maintenance_recommendation_id = mr.id
      WHERE mt.id = $1
      `,
      [id],
    );

    if (!rows.length) {
      throw new NotFoundError("Tiket tidak ditemukan");
    }

    return rows[0];
  },

  // Fitur 1 & 2: admin kasih notes + assign leader & (opsional) member sebelum kerja dimulai
  assignTicket: async (id, { leader_id, member_ids = [], notes }) => {
    await verifyStatus(id, "WaitingAssignment");
    await verifyEngineer(leader_id);

    const uniqueMemberIds = [...new Set(member_ids)].filter(
      (memberId) => memberId !== leader_id,
    );

    for (const memberId of uniqueMemberIds) {
      await verifyEngineer(memberId);
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `
        UPDATE maintenance_tickets
        SET
          status = 'Assigned',
          notes = COALESCE($1, notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [notes ?? null, id],
      );

      const ticket = rows[0];

      // bersihkan assignment lama (jaga-jaga kalau re-assign)
      await client.query(
        `DELETE FROM maintenance_ticket_assignments WHERE maintenance_ticket_id = $1`,
        [id],
      );

      await client.query(
        `
        INSERT INTO maintenance_ticket_assignments
          (maintenance_ticket_id, user_id, role)
        VALUES ($1, $2, 'Leader')
        `,
        [id, leader_id],
      );

      for (const memberId of uniqueMemberIds) {
        await client.query(
          `
          INSERT INTO maintenance_ticket_assignments
            (maintenance_ticket_id, user_id, role)
          VALUES ($1, $2, 'Member')
          `,
          [id, memberId],
        );
      }

      // jaga-jaga: sync status engineer yang baru diassign
      // (baru benar-benar berefek kalau mereka sudah punya tiket InProgress lain)
      await syncEngineersStatus(client, [leader_id, ...uniqueMemberIds]);

      await client.query("COMMIT");

      return ticket;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Fitur 3: leader mulai maintenance, sekaligus bisa tambah member baru dalam 1 request
  startTicket: async (id, user_id, member_ids = []) => {
    if (!(await verifyLeader(id, user_id))) {
      throw new ForbiddenError(
        "Hanya leader tiket ini yang dapat memulai maintenance",
      );
    }

    await verifyStatus(id, "Assigned");

    // jaga-jaga: null atau bukan array dianggap kosong
    const safeMemberIds = Array.isArray(member_ids) ? member_ids : [];

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const existingUserIds = await getAssignedUserIds(client, id);

      const newMemberIds = [...new Set(safeMemberIds)].filter(
        (memberId) => !existingUserIds.includes(memberId),
      );

      for (const memberId of newMemberIds) {
        await verifyEngineer(memberId);
      }

      for (const memberId of newMemberIds) {
        await client.query(
          `
          INSERT INTO maintenance_ticket_assignments
            (maintenance_ticket_id, user_id, role)
          VALUES ($1, $2, 'Member')
          `,
          [id, memberId],
        );
      }

      const { rows } = await client.query(
        `
      UPDATE maintenance_tickets
      SET
        status = 'InProgress',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING machine_id
      `,
        [id],
      );

      const ticket = rows[0];

      await syncAllAssignedEngineersStatus(client, id);
      await syncMachineStatus(client, ticket.machine_id);

      await client.query("COMMIT");

      return { ...ticket, added_member_ids: newMemberIds };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // GANTI (alur baru): admin ubah/tambah/hapus leader & member saat tiket masih Assigned
  // (misal leader/member sedang sakit dan perlu digantikan) — SEBELUM leader menekan /start.
  // Begitu tiket InProgress, penugasan tidak boleh diubah lagi.
  manageAssignments: async (
    id,
    { leader_id, add_member_ids = [], remove_member_ids = [] },
  ) => {
    await verifyStatus(id, "Assigned");

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const leaderRow = await getLeaderRow(client, id);
      if (!leaderRow) {
        throw new NotFoundError("Leader tiket ini tidak ditemukan");
      }

      const affectedUserIds = new Set();

      const { rows: ticketRows } = await client.query(
        `SELECT machine_id FROM maintenance_tickets WHERE id = $1`,
        [id],
      );
      const machine_id = ticketRows[0]?.machine_id;

      // --- Ganti leader ---
      if (leader_id && leader_id !== leaderRow.user_id) {
        await verifyEngineer(leader_id);

        affectedUserIds.add(leaderRow.user_id); // leader lama, kemungkinan balik jadi Active
        affectedUserIds.add(leader_id); // leader baru, jadi Onduty

        // kalau leader baru kebetulan sedang jadi member di tiket ini, hapus dulu row membernya
        await client.query(
          `
          DELETE FROM maintenance_ticket_assignments
          WHERE maintenance_ticket_id = $1 AND user_id = $2 AND role = 'Member'
          `,
          [id, leader_id],
        );

        // ganti user_id di row Leader
        await client.query(
          `
          UPDATE maintenance_ticket_assignments
          SET user_id = $1
          WHERE id = $2
          `,
          [leader_id, leaderRow.id],
        );
      }

      // --- Hapus member ---
      const uniqueRemoveIds = [...new Set(remove_member_ids)];
      if (uniqueRemoveIds.length) {
        const { rows: removed } = await client.query(
          `
          DELETE FROM maintenance_ticket_assignments
          WHERE maintenance_ticket_id = $1
          AND user_id = ANY($2::int[])
          AND role = 'Member'
          RETURNING user_id
          `,
          [id, uniqueRemoveIds],
        );
        removed.forEach((r) => affectedUserIds.add(r.user_id));
      }

      // --- Tambah member ---
      const currentUserIds = await getAssignedUserIds(client, id);
      const effectiveLeaderId = leader_id ?? leaderRow.user_id;
      const uniqueAddIds = [...new Set(add_member_ids)].filter(
        (uid) => !currentUserIds.includes(uid) && uid !== effectiveLeaderId,
      );

      for (const memberId of uniqueAddIds) {
        await verifyEngineer(memberId);
      }

      for (const memberId of uniqueAddIds) {
        await client.query(
          `
          INSERT INTO maintenance_ticket_assignments
            (maintenance_ticket_id, user_id, role)
          VALUES ($1, $2, 'Member')
          `,
          [id, memberId],
        );
        affectedUserIds.add(memberId);
      }

      // --- Sync status engineer yang terdampak & mesin ---
      await syncEngineersStatus(client, [...affectedUserIds]);
      if (machine_id) {
        await syncMachineStatus(client, machine_id);
      }

      await client.query("COMMIT");

      return { ticket_id: id, affected_user_ids: [...affectedUserIds] };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Fitur 4: bisa submit pertama kali (InProgress) atau submit ulang setelah Rejected
  submitTicket: async (id, user_id, data, file) => {
    if (!(await verifyLeader(id, user_id))) {
      throw new ForbiddenError(
        "Hanya leader tiket ini yang dapat submit laporan",
      );
    }

    await verifyStatus(id, ["InProgress", "Rejected"]);

    const client = await pool.connect();

    let newImageUrl = null;
    let oldImageUrls = [];

    try {
      await client.query("BEGIN");

      const { rows: existingReports } = await client.query(
        `SELECT * FROM maintenance_reports WHERE maintenance_ticket_id = $1`,
        [id],
      );

      let report;

      if (existingReports.length) {
        // resubmit setelah reject -> update laporan yang sudah ada
        const { rows } = await client.query(
          `
          UPDATE maintenance_reports
          SET
            description = $1,
            action_taken = $2,
            notes = $3,
            duration_hours = $4,
            updated_at = CURRENT_TIMESTAMP
          WHERE maintenance_ticket_id = $5
          RETURNING *
          `,
          [
            data.description,
            data.action_taken,
            data.notes,
            data.duration_hours,
            id,
          ],
        );
        report = rows[0];

        const { rows: oldImages } = await client.query(
          `SELECT * FROM report_images WHERE report_id = $1`,
          [report.id],
        );
        oldImageUrls = oldImages.map((img) => img.image_url);

        await client.query(`DELETE FROM report_images WHERE report_id = $1`, [
          report.id,
        ]);
      } else {
        // submit pertama kali
        const { rows } = await client.query(
          `
          INSERT INTO maintenance_reports
          (maintenance_ticket_id, description, action_taken, notes, duration_hours)
          VALUES ($1,$2,$3,$4,$5)
          RETURNING *
          `,
          [
            id,
            data.description,
            data.action_taken,
            data.notes,
            data.duration_hours,
          ],
        );
        report = rows[0];
      }

      if (file) {
        const uploadDir = path.resolve("uploads/reports");

        await fs.mkdir(uploadDir, { recursive: true });

        const filename = `${Date.now()}-${report.id}.webp`;

        await sharp(file.buffer)
          .webp({ quality: 80 })
          .toFile(path.join(uploadDir, filename));

        newImageUrl = `/uploads/reports/${filename}`;

        await client.query(
          `
        INSERT INTO report_images (report_id, image_url)
        VALUES ($1,$2)
        `,
          [report.id, newImageUrl],
        );
      }

      const { rows } = await client.query(
        `
      UPDATE maintenance_tickets
      SET
        status='WaitingApproval',
        updated_at=CURRENT_TIMESTAMP
      WHERE id=$1
      RETURNING *
      `,
        [id],
      );

      await client.query("COMMIT");

      // hapus file lama setelah commit berhasil
      for (const oldUrl of oldImageUrls) {
        await deleteImageFile(oldUrl);
      }

      return rows[0];
    } catch (error) {
      await client.query("ROLLBACK");

      if (newImageUrl) {
        await deleteImageFile(newImageUrl);
      }

      throw error;
    } finally {
      client.release();
    }
  },

  approveTicket: async (id) => {
    await verifyStatus(id, "WaitingApproval");

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `
      UPDATE maintenance_tickets
      SET
        status = 'Done',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING machine_id
      `,
        [id],
      );

      const ticket = rows[0];

      await syncAllAssignedEngineersStatus(client, id);
      await syncMachineStatus(client, ticket.machine_id);

      await client.query("COMMIT");

      return ticket;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Fitur 4: admin reject laporan, tiket balik ke status Rejected agar engineer bisa perbaiki
  rejectTicket: async (id, notes) => {
    if (!notes) {
      throw new InvariantError("Alasan reject wajib diisi");
    }

    await verifyStatus(id, "WaitingApproval");

    const { rows } = await pool.query(
      `
      UPDATE maintenance_tickets
      SET
        status = 'Rejected',
        notes = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [notes, id],
    );

    return rows[0];
  },

  // GANTI (alur baru): admin bisa hapus tiket selama belum InProgress — baik yang belum
  // ditugaskan (WaitingAssignment) maupun yang sudah ditugaskan tapi teknisi belum mulai
  // mengerjakan (Assigned). Kalau tiket sudah Assigned, baris assignment (leader & member)
  // ikut dibersihkan dalam transaksi yang sama supaya tidak ada data nyangkut.
  deleteTicket: async (id) => {
    await verifyStatus(id, ["WaitingAssignment", "Assigned"]);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `DELETE FROM maintenance_ticket_assignments WHERE maintenance_ticket_id = $1`,
        [id],
      );

      const { rows } = await client.query(
        `
        DELETE FROM maintenance_tickets
        WHERE id = $1
        RETURNING id
        `,
        [id],
      );

      if (!rows.length) {
        throw new NotFoundError("Tiket tidak ditemukan");
      }

      await client.query("COMMIT");

      return rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Endpoint khusus: detail laporan maintenance (report + seluruh foto)
  // Endpoint khusus: detail laporan maintenance (report + seluruh foto + engineer pengerja)
  getTicketReport: async (id, user_id, role) => {
    if (role !== "Admin" && !(await verifyAssigned(id, user_id))) {
      throw new ForbiddenError(
        "Anda tidak memiliki izin untuk melihat laporan tiket ini",
      );
    }

    const { rows } = await pool.query(
      `
      SELECT
        mr.id,
        mr.maintenance_ticket_id,
        mr.description,
        mr.action_taken,
        mr.notes,
        mr.duration_hours,
        mr.created_at,
        mr.updated_at,
        (
          SELECT json_agg(ri.image_url ORDER BY ri.id)
          FROM report_images ri
          WHERE ri.report_id = mr.id
        ) AS image_urls,
        (
          SELECT json_agg(
            json_build_object('id', u.id, 'name', u.name, 'role', mta.role)
            ORDER BY mta.role
          )
          FROM maintenance_ticket_assignments mta
          JOIN users u ON mta.user_id = u.id
          WHERE mta.maintenance_ticket_id = mr.maintenance_ticket_id
        ) AS engineers
      FROM maintenance_reports mr
      WHERE mr.maintenance_ticket_id = $1
      `,
      [id],
    );

    if (!rows.length) {
      throw new NotFoundError("Laporan untuk tiket ini belum tersedia");
    }

    return rows[0];
  },
};

export default ticketMaintenanceService;