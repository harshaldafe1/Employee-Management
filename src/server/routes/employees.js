import express from "express";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getMe
} from "../controllers/employeeController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, getMe);

router.route("/")
  .get(protect, getEmployees)
  .post(protect, authorize("Admin", "HR"), createEmployee);

router.route("/:id")
  .get(protect, getEmployeeById)
  .put(protect, authorize("Admin", "HR"), updateEmployee)
  .delete(protect, authorize("Admin"), deleteEmployee);

export default router;
