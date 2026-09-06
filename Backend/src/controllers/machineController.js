import machineService from "../services/machineService.js";
import machineValidator from "../validators/machine/index.js";

const machineController = {
  getAllMachines: async (req, res, next) => {
    try {
      const search = req.query.search || "";
      const machines = await machineService.getAllMachines(search);
      res.status(200).json({
        status: "success",
        data: {
          machines,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getMachineById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const machine = await machineService.getMachineById(id);
      res.status(200).json({
        status: "success",
        data: {
          machine,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  postMachine: async (req, res, next) => {
    try {
      machineValidator.postMachinePayload(req.body);
      const { name, code, type, location, install_date } = req.body;
      const machine = await machineService.createMachine(
        code,
        name,
        type,
        location,
        install_date,
      );
      res.status(201).json({
        status: "success",
        data: {
          machine,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  putMachine: async (req, res, next) => {
    try {
      const { id } = req.params;
      machineValidator.putMachinePayload(req.body);
      const { name, code, type, location, install_date } = req.body;
      const machine = await machineService.updateMachine(
        id,
        code,
        name,
        type,
        location,
        install_date,
      );
      res.status(200).json({
        status: "success",
        data: {
          machine,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  deleteMachineById: async (req, res, next) => {
    try {
      const { id } = req.params;
      await machineService.deleteMachineById(id);
      res.status(200).json({
        status: "success",
        message: "Machine deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

export default machineController;