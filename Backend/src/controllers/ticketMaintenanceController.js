import ticketMaintenanceService from "../services/ticketMaintenanceService.js";
import InvariantError from "../exceptions/InvariantError.js";
import ticketMaintenanceValidator from "../validators/ticketMaintenance/index.js";

const ticketMaintenanceController = {
  getAllTickets: async (req, res, next) => {
    try {
      const { id_user, role } = req.user;

      const tickets = await ticketMaintenanceService.getAllTickets(
        id_user,
        role,
      );

      res.status(200).json({
        status: "success",
        data: {
          tickets,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getTicketById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id_user, role } = req.user;

      const ticket = await ticketMaintenanceService.getTicketById(
        id,
        id_user,
        role,
      );

      res.status(200).json({
        status: "success",
        data: {
          ticket,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Fitur 1 & 2: assign leader + (opsional) member, sekaligus catatan admin
  patchAssignTicket: async (req, res, next) => {
    try {
      const { id } = req.params;
      ticketMaintenanceValidator.patchAssignTicketPayload(req.body);
      const { leader_id, member_ids, notes } = req.body;

      const ticket = await ticketMaintenanceService.assignTicket(id, {
        leader_id,
        member_ids,
        notes,
      });

      res.status(200).json({
        status: "success",
        data: {
          ticket,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Fitur 3 + fitur tambah member digabung: leader mulai maintenance,
  // sekaligus bisa tambah member baru (opsional) dalam 1 request
  patchStartTicket: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id_user } = req.user;

      ticketMaintenanceValidator.patchStartTicketPayload(req.body);
      const { member_ids = [] } = req.body ?? {};

      const ticket = await ticketMaintenanceService.startTicket(
        id,
        id_user,
        member_ids ?? [],
      );

      res.status(200).json({
        status: "success",
        data: {
          ticket,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GANTI (alur baru): admin ubah/tambah/hapus leader & member saat tiket masih Assigned
  // (sebelum leader menekan tombol mulai/InProgress)
  patchManageAssignments: async (req, res, next) => {
    try {
      const { id } = req.params;

      ticketMaintenanceValidator.patchManageAssignmentsPayload(req.body);
      const { leader_id, add_member_ids, remove_member_ids } = req.body;

      const result = await ticketMaintenanceService.manageAssignments(id, {
        leader_id,
        add_member_ids,
        remove_member_ids,
      });

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  patchSubmitTicket: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id_user } = req.user;

      ticketMaintenanceValidator.patchSubmitTicketPayload(req.body);

      if (!req.file) {
        throw new InvariantError("Gambar wajib diunggah");
      }
      const ticket = await ticketMaintenanceService.submitTicket(
        id,
        id_user,
        req.body,
        req.file,
      );

      res.status(200).json({
        status: "success",
        data: {
          ticket,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  patchApproveTicket: async (req, res, next) => {
    try {
      const { id } = req.params;

      const ticket = await ticketMaintenanceService.approveTicket(id);

      res.status(200).json({
        status: "success",
        data: {
          ticket,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Fitur 4: admin menolak laporan
  patchRejectTicket: async (req, res, next) => {
    try {
      const { id } = req.params;
      ticketMaintenanceValidator.patchRejectTicketPayload(req.body);
      const { notes } = req.body;

      const ticket = await ticketMaintenanceService.rejectTicket(id, notes);

      res.status(200).json({
        status: "success",
        data: {
          ticket,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GANTI (alur baru): admin menghapus tiket selama belum InProgress
  // (WaitingAssignment atau Assigned)
  deleteTicket: async (req, res, next) => {
    try {
      const { id } = req.params;

      await ticketMaintenanceService.deleteTicket(id);

      res.status(200).json({
        status: "success",
        message: "Tiket berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  },

  // Endpoint khusus: detail laporan maintenance (report + seluruh foto)
  getTicketReport: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id_user, role } = req.user;

      const report = await ticketMaintenanceService.getTicketReport(
        id,
        id_user,
        role,
      );

      res.status(200).json({
        status: "success",
        data: {
          report,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default ticketMaintenanceController;