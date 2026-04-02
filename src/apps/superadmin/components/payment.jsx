import React, { useEffect, useState } from "react";
import API from "../api";
import {
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaSync,
  FaSearch,
  FaTimes,
  FaRupeeSign,
  FaUserGraduate,
} from "react-icons/fa";

const Payment = () => {

  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);

  const [stats, setStats] = useState({
    totalSpent: 0,
    paidCount: 0,
    pendingCount: 0,
    totalAdmins: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [updatingRow, setUpdatingRow] = useState(null);

  const [authError, setAuthError] = useState(false);
  const [connectionError, setConnectionError] = useState(false);


  /* ---------------------------- */
  /* LOAD DATA */
  /* ---------------------------- */

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      setAuthError(true);
      setLoading(false);
      return;
    }

    fetchData();

  }, []);


  useEffect(() => {
    filterRows();
  }, [rows, searchTerm]);


  /* ---------------------------- */
  /* FETCH DATA */
  /* ---------------------------- */

  const fetchData = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const [salaryRes, statsRes] = await Promise.all([
        API.get("/api/salary", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/api/salary/stats/payments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const data = salaryRes.data || [];

      setRows(data);

      setStats({
        totalSpent: statsRes.data.totalSpent || 0,
        paidCount: statsRes.data.paidCount || 0,
        pendingCount: statsRes.data.pendingCount || 0,
        totalAdmins: data.length,
      });

    } catch (err) {

      console.error("Fetch error:", err);

      if (err.code === "ERR_NETWORK") setConnectionError(true);
      if (err.response?.status === 401) setAuthError(true);

    } finally {
      setLoading(false);
    }

  };


  /* ---------------------------- */
  /* FILTER */
  /* ---------------------------- */

  const filterRows = () => {

    let filtered = [...rows];

    if (searchTerm) {

      const term = searchTerm.toLowerCase();

      filtered = filtered.filter(
        (row) =>
          row.name?.toLowerCase().includes(term) ||
          row.batchName?.toLowerCase().includes(term) ||
          row.module?.toLowerCase().includes(term)
      );

    }

    setFilteredRows(filtered);

  };


  /* ---------------------------- */
  /* UPDATE MODULE PAYMENT */
  /* ---------------------------- */

  const updateSalaryStatus = async (row, newStatus) => {

    const rowKey = `${row.adminId}-${row.batchId}-${row.module}`;
    setUpdatingRow(rowKey);

    try {

      const token = localStorage.getItem("token");

      await API.patch(
        "/api/salary/payment",
        {
          adminId: row.adminId,
          batchId: row.batchId,
          module: row.module,
          status: newStatus === "credited" ? "paid" : "pending",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchData();

    } catch (err) {

      console.error(err);
      alert("Payment update failed");

    } finally {

      setUpdatingRow(null);

    }

  };


  /* ---------------------------- */
  /* BADGES */
  /* ---------------------------- */

  const salaryBadge = (status) => {

    if (status === "paid")
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded flex gap-1 items-center">
          <FaCheckCircle /> Paid
        </span>
      );

    return (
      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded flex gap-1 items-center">
        <FaClock /> Pending
      </span>
    );

  };


  /* ---------------------------- */
  /* LOADING */
  /* ---------------------------- */

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
      </div>
    );

  if (connectionError)
    return <div className="p-10 text-center">Cannot connect to server</div>;

  if (authError)
    return <div className="p-10 text-center">Please login again</div>;


  /* ---------------------------- */
  /* UI */
  /* ---------------------------- */

  return (

    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="max-w-7xl mx-auto p-6">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-2xl font-bold flex gap-2 items-center">
            <FaUserGraduate /> Salary Management
          </h1>

          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2 items-center"
          >
            <FaSync /> Refresh
          </button>

        </div>


        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <StatCard title="Modules" value={stats.totalAdmins} icon="📋" bg="bg-blue-50 dark:bg-blue-900/30" border="border-blue-200 dark:border-blue-700" text="text-blue-700 dark:text-blue-300" />
          <StatCard title="Total Spent" value={`₹${stats.totalSpent.toLocaleString()}`} icon="💰" bg="bg-purple-50 dark:bg-purple-900/30" border="border-purple-200 dark:border-purple-700" text="text-purple-700 dark:text-purple-300" />
          <StatCard title="Paid" value={stats.paidCount} icon="✅" bg="bg-green-50 dark:bg-green-900/30" border="border-green-200 dark:border-green-700" text="text-green-700 dark:text-green-300" />
          <StatCard title="Pending" value={stats.pendingCount} icon="⏳" bg="bg-yellow-50 dark:bg-yellow-900/30" border="border-yellow-200 dark:border-yellow-700" text="text-yellow-700 dark:text-yellow-300" />

        </div>


        {/* SEARCH */}

        <div className="relative mb-6">

          <FaSearch className="absolute left-3 top-3 text-gray-400" />

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search admin / batch / module..."
            className="pl-10 pr-10 py-2 border rounded w-full"
          />

          {searchTerm && (
            <FaTimes
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 cursor-pointer"
            />
          )}

        </div>


        {/* TABLE */}

        <div className="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-blue-900 text-white">

              <tr>
                <th className="p-4 text-left">Admin</th>
                <th className="p-4 text-left">Batch</th>
                <th className="p-4 text-left">Module</th>
                <th className="p-4 text-left">Salary</th>
                <th className="p-4 text-left">Payment</th>
              </tr>

            </thead>

            <tbody>

              {filteredRows.map((row, index) => {

                const rowKey = `${row.adminId}-${row.batchId}-${row.module}`;
                const updating = updatingRow === rowKey;

                return (

                  <tr key={index} className={`border-b transition-colors hover:bg-blue-50 dark:hover:bg-gray-700 ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`}>

                    <td className="p-4 font-semibold text-gray-800 dark:text-white">{row.name}</td>

                    <td className="p-4"><span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs font-semibold px-2 py-1 rounded-full">{row.batchName}</span></td>

                    <td className="p-4"><span className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-semibold px-2 py-1 rounded-full">{row.module}</span></td>

                    <td className="p-4 font-bold text-blue-700 dark:text-blue-300">
                      <span className="flex items-center gap-1"><FaRupeeSign />{row.salary?.toLocaleString() || 0}</span>
                    </td>

                    <td className="p-4">

                      <div className="flex gap-2 items-center">

                        {salaryBadge(row.salaryStatus)}

                        <select
                          value={row.salaryStatus === "paid" ? "credited" : "pending"}
                          onChange={(e) =>
                            updateSalaryStatus(row, e.target.value)
                          }
                          disabled={updating}
                          className="border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="credited">Paid</option>
                        </select>

                        {updating && (
                          <FaSpinner className="animate-spin text-blue-500" />
                        )}

                      </div>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

};


const StatCard = ({ title, value, icon, bg, border, text }) => (
  <div className={`rounded-xl border p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow ${bg} ${border}`}>
    <span className="text-3xl">{icon}</span>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
    </div>
  </div>
);

export default Payment;