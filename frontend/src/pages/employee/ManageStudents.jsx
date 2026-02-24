import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import {
  registerStudent,
  bulkUploadStudents,
  getStudents,
} from "../../services/studentService";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    grade: "",
  });
  const [file, setFile] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [page, search, gradeFilter]);

  const fetchStudents = async () => {
    try {
      const res = await getStudents({
        page,
        limit: 10,
        search,
        grade: gradeFilter,
      });

      setStudents(res.data.data);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SINGLE REGISTER ================= */

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerStudent(form);
      setForm({ name: "", email: "", password: "", grade: "" });
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= BULK UPLOAD ================= */

  const handleBulkUpload = async () => {
    if (!file) return alert("Select Excel file");

    setLoading(true);
    try {
      const res = await bulkUploadStudents(file);
      alert(
        `Created: ${res.data.created}, Failed: ${res.data.failedCount}`
      );
      setFile(null);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Manage Students">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ================= REGISTER FORM ================= */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Register Student</h2>
          <form
            onSubmit={handleRegister}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <input
              placeholder="Name"
              required
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              placeholder="Email"
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              placeholder="Password"
              required
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="border p-2 rounded"
            />
            <select
              required
              value={form.grade}
              onChange={(e) =>
                setForm({ ...form, grade: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="">Select Grade</option>
              {["1","2","3","4","5","6","7","8","9","10","11","12"].map(
                (g) => (
                  <option key={g}>{g}</option>
                )
              )}
            </select>

            <button
              disabled={loading}
              className="col-span-1 md:col-span-4 bg-blue-600 text-white py-2 rounded"
            >
              {loading ? "Processing..." : "Register Student"}
            </button>
          </form>
        </div>

        {/* ================= BULK UPLOAD ================= */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Bulk Upload (Excel)
          </h2>
          <div className="flex gap-4">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button
              onClick={handleBulkUpload}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Upload
            </button>
          </div>
        </div>

        {/* ================= FILTERS ================= */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4">
          <input
            placeholder="Search name/email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Grades</option>
            {["1","2","3","4","5","6","7","8","9","10","11","12"].map(
              (g) => (
                <option key={g}>{g}</option>
              )
            )}
          </select>
        </div>

        {/* ================= STUDENTS TABLE ================= */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th>Email</th>
                <th>Grade</th>
                <th>Admission Date</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="p-3">{s.user?.name}</td>
                  <td>{s.user?.email}</td>
                  <td>{s.grade}</td>
                  <td>
                    {new Date(s.admissionDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="flex justify-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-1 bg-gray-200 rounded"
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-1 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default ManageStudents;