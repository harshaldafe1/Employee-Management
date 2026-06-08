import { Employee } from "../models/Employee.js";

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin/HR
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get current employee profile
// @route   GET /api/employees/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const employee = await Employee.findOne({ name: req.user.name });
    if (!employee) {
      return res.status(404).json({ message: "Employee details not found" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private/Admin/HR
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private/Admin/HR
export const createEmployee = async (req, res) => {
  try {
    const { name, role, department, salary } = req.body;

    const employee = await Employee.create({
      name,
      role,
      department,
      salary,
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private/Admin/HR
export const updateEmployee = async (req, res) => {
  try {
    const { name, role, department, salary } = req.body;

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.name = name || employee.name;
    employee.role = role || employee.role;
    employee.department = department || employee.department;
    employee.salary = salary !== undefined ? salary : employee.salary;

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin/HR
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await Employee.findByIdAndDelete(employee._id);

    res.json({ message: "Employee removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
