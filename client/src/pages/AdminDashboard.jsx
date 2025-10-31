import React from "react";

const AdminDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, Admin! Here you can manage products and view orders.</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Features Coming Soon:</h2>
        <ul className="list-disc pl-5">
          <li>Add or edit products</li>
          <li>View and manage orders</li>
          <li>Customer database view</li>
          <li>Email & WhatsApp alerts (Phase 2)</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
