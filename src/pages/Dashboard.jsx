import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, Trash2 } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", department: "", salary: "" });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    if (user.role === "Employee") {
      try {
        const res = await fetch("/api/employees/me", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEmployees([data]);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
      return;
    }

    // Admin/HR
    try {
      const res = await fetch("/api/employees", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const isEditing = !!form.id;
      const endpoint = isEditing ? `/api/employees/${form.id}` : "/api/employees";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsAdding(false);
        setForm({ name: "", role: "", department: "", salary: 0 });
        fetchEmployees();
      } else {
        alert(isEditing ? "Failed to update employee" : "Failed to add employee");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this employee?")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        fetchEmployees();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalPayroll = employees.reduce((acc, curr) => acc + (curr.salary || 0), 0);
  const percentDone = 100;

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-200 shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">INDUS-CORE</span>
          </div>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-indigo-500 text-white rounded-md text-sm font-medium">Dashboard</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">Employees</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">Payroll</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">Security Logs</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">Settings</a>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-white text-xs font-semibold">{user.name}</p>
                <p className="text-indigo-400 text-[10px] uppercase tracking-wider font-bold">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-white transition-colors p-2"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-slate-800">Management Overview</h1>
          <div className="flex items-center gap-4">
            {(user.role === "Admin" || user.role === "HR") && (
              <button 
                onClick={() => {
                  setIsAdding(!isAdding);
                  if (isAdding) {
                    setForm({ name: "", role: "", department: "", salary: "" });
                  }
                }}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-indigo-700 transition"
              >
                {isAdding ? "Cancel" : "+ New Employee"}
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="p-8 flex-1 overflow-y-auto">
          
          {isAdding && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 max-w-4xl">
              <h2 className="text-lg font-bold text-slate-800 mb-4">{form.id ? "Edit Employee Record" : "Onboard New Employee"}</h2>
              <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                  <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                  <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Salary (USD)</label>
                  <input required type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={form.salary} onChange={e => setForm({...form, salary: Number(e.target.value)})} />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-indigo-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-indigo-700 transition">
                    {form.id ? "Update Employee" : "Save Employee"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bento Grid Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-6 gap-4 min-h-[600px]">
            
            {/* Card 1: Total Employees */}
            <div className="lg:col-span-1 lg:row-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Staff</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{loading ? "-" : employees.length}</span>
                {!loading && <span className="text-emerald-500 text-xs font-bold mb-1">Active</span>}
              </div>
            </div>

            {/* Card 2: Active Payroll */}
            <div className="lg:col-span-1 lg:row-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Payroll Health</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-emerald-600 uppercase">Stable</span>
              </div>
            </div>

            {/* Card 3: RBAC Status */}
            <div className="lg:col-span-2 lg:row-span-1 bg-indigo-600 p-5 rounded-2xl shadow-md text-white flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Security Framework</p>
                <p className="text-lg font-semibold">JWT Auth v2.4 Active</p>
              </div>
              <div className="px-3 py-1 bg-indigo-500 rounded-lg text-[10px] font-mono border border-indigo-400">
                ROLE: {user.role.toUpperCase()}
              </div>
            </div>

            {/* Card 4: Employee Data Grid */}
            <div className="lg:col-span-3 lg:row-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-slate-800">Recent Personnel Changes</h3>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left bg-white">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Payroll</th>
                      <th className="px-6 py-3">Status</th>
                      {(user.role === "Admin" || user.role === "HR") && <th className="px-6 py-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                         <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading workforce data...</td>
                      </tr>
                    ) : employees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No employees found.</td>
                      </tr>
                    ) : (
                      employees.map(emp => (
                        <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3 font-medium flex items-center gap-2">
                            {emp.name} 
                            <span className="text-[10px] text-slate-400 font-normal">#{emp._id.substring(emp._id.length - 4)}</span>
                          </td>
                          <td className="px-6 py-3 text-slate-600">{emp.department}</td>
                          <td className="px-6 py-3 text-slate-600">{emp.role}</td>
                          <td className="px-6 py-3 font-mono text-slate-600 text-xs">
                             ${emp.salary?.toLocaleString() || 0}
                          </td>
                          <td className="px-6 py-3">
                             <span className="flex items-center gap-1.5 text-xs text-slate-600">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> 
                                Active
                             </span>
                          </td>
                          {(user.role === "Admin" || user.role === "HR") && (
                            <td className="px-6 py-3 text-right">
                              <button
                                onClick={() => {
                                  setIsAdding(true);
                                  setForm({
                                    id: emp._id,
                                    name: emp.name,
                                    role: emp.role,
                                    department: emp.department,
                                    salary: emp.salary,
                                  });
                                }}
                                className="text-slate-400 hover:text-indigo-600 transition-colors mr-3"
                                title="Edit Employee"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil inline-block"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                              </button>
                              <button
                                onClick={() => handleDelete(emp._id)}
                                className="text-slate-400 hover:text-red-600 transition-colors"
                                title="Remove Employee"
                              >
                                <Trash2 className="w-4 h-4 inline-block" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card 5: Real-time Payroll Widget */}
            <div className="lg:col-span-1 lg:row-span-3 bg-slate-100 p-6 rounded-2xl border border-slate-200 flex flex-col">
              <h3 className="text-sm font-bold mb-4">Payroll Real-Time</h3>
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Next Pay Cycle</p>
                  <p className="text-lg font-bold">End of Month</p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Disbursed</p>
                  <p className="text-lg font-bold text-indigo-600">
                    ${loading ? "..." : employees.reduce((acc, curr) => acc + (curr.salary || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex-1 flex flex-col justify-end pt-4">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: "72%" }}></div>
                  </div>
                  <p className="text-[10px] mt-2 text-slate-500">72% processing complete</p>
                </div>
              </div>
            </div>

            {/* Card 6: Database Connection Status */}
            <div className="lg:col-span-1 lg:row-span-2 bg-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Atlas Connected</p>
                </div>
                <p className="text-slate-300 text-xs font-mono break-all line-clamp-2">cluster0.mongodb.net</p>
              </div>
              <button 
                onClick={() => fetchEmployees()}
                className="w-full py-2 mt-4 bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-600 transition-colors"
              >
                Refresh Data
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

