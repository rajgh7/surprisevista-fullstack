import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [tab, setTab] = useState("products");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [msg, setMsg] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Party",
    mrp: "",
    discount: 0,
    price: "",
    description: "",
    image: "",
    gallery: [""],
    isOnSale: false,
    sku: "",
    stock: 100,
  });

  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/admin-login");
    else {
      if (tab === "products") fetchProducts();
      if (tab === "orders") fetchOrders();
      if (tab === "contacts") fetchContacts();
    }
    // eslint-disable-next-line
  }, [tab]);

  // Universal headers with token
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  /* ================== FETCH PRODUCTS ================== */
  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("https://surprisevista-backend.onrender.com/api/products", { headers });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to load products:", err);
      setMsg("❌ Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  /* ================== FETCH ORDERS ================== */
  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("https://surprisevista-backend.onrender.com/api/orders", { headers });
      if (res.status === 401) return handleUnauthorized();
      setOrders(await res.json());
    } catch (err) {
      console.error("❌ Failed to load orders:", err);
      setMsg("❌ Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  /* ================== FETCH CONTACTS ================== */
  async function fetchContacts() {
    setLoading(true);
    try {
      const res = await fetch("https://surprisevista-backend.onrender.com/api/contact", { headers });
      if (res.status === 401) return handleUnauthorized();
      setContacts(await res.json());
    } catch (err) {
      console.error("❌ Failed to load contacts:", err);
      setMsg("❌ Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }

  /* ================== ADD PRODUCT ================== */
  async function addProduct(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("https://surprisevista-backend.onrender.com/api/products", {
        method: "POST",
        headers,
        body: JSON.stringify(newProduct),
      });
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Failed");
      await res.json();
      setMsg("✅ Product added successfully");
      setNewProduct({
        name: "",
        category: "Party",
        mrp: "",
        discount: 0,
        price: "",
        description: "",
        image: "",
        gallery: [""],
        isOnSale: false,
        sku: "",
        stock: 100,
      });
      fetchProducts(); // refresh list
    } catch (err) {
      console.error("❌ Add product error:", err);
      setMsg("❌ Could not add product");
    } finally {
      setSaving(false);
    }
  }

  /* ================== DELETE PRODUCT ================== */
  async function deleteProduct(id) {
    if (!window.confirm("Delete product?")) return;
    try {
      const res = await fetch(`https://surprisevista-backend.onrender.com/api/products/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Delete failed");
      setProducts((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      setMsg("✅ Product deleted successfully");
    } catch (err) {
      console.error("❌ Delete product error:", err);
      setMsg("❌ Delete failed");
    }
  }

  /* ================== EDIT PRODUCT ================== */
  function openEdit(p) {
    setEditing({
      ...p,
      mrp: p.mrp != null ? p.mrp : "",
      discount: p.discount != null ? p.discount : 0,
      price: p.price != null ? p.price : "",
    });
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setMsg("");
    try {
      const id = editing._id || editing.id;
      const payload = {
        name: editing.name,
        category: editing.category,
        description: editing.description,
        image: editing.image,
        gallery: editing.gallery,
        mrp: Number(editing.mrp) || 0,
        discount: Number(editing.discount) || 0,
        price: editing.price !== "" ? Number(editing.price) : undefined,
        isOnSale: Boolean(editing.isOnSale),
        sku: editing.sku,
        stock: Number(editing.stock) || 0,
      };
      const res = await fetch(`https://surprisevista-backend.onrender.com/api/products/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setEditing(null);
      setMsg("✅ Product updated successfully");
      setProducts((arr) =>
        arr.map((it) => (it._id === updated._id || it.id === id ? updated : it))
      );
    } catch (err) {
      console.error("❌ Update product error:", err);
      setMsg("❌ Update failed. Please re-login.");
    } finally {
      setSaving(false);
    }
  }

  /* ================== LOGOUT ================== */
  function handleLogout() {
    localStorage.removeItem("adminToken");
    navigate("/");
  }

  /* ================== TOKEN EXPIRED HANDLER ================== */
  function handleUnauthorized() {
    localStorage.removeItem("adminToken");
    alert("Session expired. Please log in again.");
    navigate("/admin-login");
  }

  /* ================== UI RENDER ================== */
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-yellow-50 to-white py-12 px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 ${tab === "products" ? "bg-white text-sv-purple border-b-2 border-sv-purple" : "text-gray-600"}`}
              onClick={() => setTab("products")}
            >
              Products
            </button>
            <button
              className={`px-4 py-2 ${tab === "orders" ? "bg-white text-sv-purple border-b-2 border-sv-purple" : "text-gray-600"}`}
              onClick={() => setTab("orders")}
            >
              Orders
            </button>
            <button
              className={`px-4 py-2 ${tab === "contacts" ? "bg-white text-sv-purple border-b-2 border-sv-purple" : "text-gray-600"}`}
              onClick={() => setTab("contacts")}
            >
              Contacts
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        <div className="p-6">
          {msg && (
            <div className={`${msg.startsWith("✅") ? "text-green-600" : "text-red-500"} mb-4`}>
              {msg}
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading...</div>
          ) : (
            <>
              {/* PRODUCTS TAB */}
              {tab === "products" && (
                <>
                  <h2 className="text-xl font-heading text-sv-purple mb-3">Products</h2>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm border">
                      <thead className="bg-pink-50">
                        <tr>
                          <th className="p-2">Image</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">MRP</th>
                          <th className="p-2">Price</th>
                          <th className="p-2">Discount</th>
                          <th className="p-2">Sale</th>
                          <th className="p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p._id || p.id} className="hover:bg-yellow-50">
                            <td className="p-2">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            </td>
                            <td className="p-2">{p.name}</td>
                            <td className="p-2">₹{p.mrp ?? "-"}</td>
                            <td className="p-2">₹{p.price ?? "-"}</td>
                            <td className="p-2">{p.discount ?? 0}%</td>
                            <td className="p-2">{p.isOnSale ? "Yes" : "No"}</td>
                            <td className="p-2">
                              <button className="text-blue-600 mr-3" onClick={() => openEdit(p)}>
                                Edit
                              </button>
                              <button
                                className="text-red-600"
                                onClick={() => deleteProduct(p._id || p.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-lg mb-2">Add Product</h3>
                  <form onSubmit={addProduct} className="grid md:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="Name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="border p-2 rounded"
                    />
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="border p-2 rounded"
                    >
                      <option>Party</option>
                      <option>Corporate</option>
                      <option>Retail</option>
                    </select>
                    <input
                      placeholder="MRP"
                      value={newProduct.mrp}
                      onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                      className="border p-2 rounded"
                    />
                    <input
                      placeholder="Discount %"
                      value={newProduct.discount}
                      onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                      className="border p-2 rounded"
                    />
                    <input
                      placeholder="Price"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="border p-2 rounded"
                    />
                    <input
                      placeholder="Image URL"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                      className="border p-2 rounded"
                    />
                    <textarea
                      placeholder="Description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="border p-2 rounded md:col-span-2"
                    />
                    <div className="md:col-span-2 flex gap-3">
                      <button disabled={saving} className="btn btn-primary">
                        {saving ? "Saving..." : "Add Product"}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* ORDERS TAB */}
              {tab === "orders" && (
                <>
                  <h2 className="text-xl font-heading text-sv-purple mb-3">Orders</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-yellow-50">
                        <tr>
                          <th className="p-2">Customer</th>
                          <th className="p-2">Total</th>
                          <th className="p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o._id} className="hover:bg-pink-50">
                            <td className="p-2">
                              {o.name} ({o.email})
                            </td>
                            <td className="p-2">₹{o.total}</td>
                            <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* CONTACTS TAB */}
              {tab === "contacts" && (
                <>
                  <h2 className="text-xl font-heading text-sv-purple mb-3">Contacts</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-yellow-50">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((c) => (
                          <tr key={c._id} className="hover:bg-pink-50">
                            <td className="p-2">{c.name}</td>
                            <td className="p-2">{c.email}</td>
                            <td className="p-2">{c.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={saveEdit} className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-heading">Edit Product</h3>
              <button type="button" className="text-gray-500" onClick={() => setEditing(null)}>
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="border p-2 rounded"
              />
              <select
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="border p-2 rounded"
              >
                <option>Party</option>
                <option>Corporate</option>
                <option>Retail</option>
              </select>
              <input
                value={editing.mrp}
                onChange={(e) => setEditing({ ...editing, mrp: e.target.value })}
                placeholder="MRP"
                className="border p-2 rounded"
              />
              <input
                value={editing.discount}
                onChange={(e) => setEditing({ ...editing, discount: e.target.value })}
                placeholder="Discount %"
                className="border p-2 rounded"
              />
              <input
                value={editing.price}
                onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                placeholder="Price (leave blank to compute)"
                className="border p-2 rounded"
              />
              <input
                value={editing.image}
                onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                placeholder="Image URL"
                className="border p-2 rounded"
              />
              <input
                value={editing.sku || ""}
                onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                placeholder="SKU"
                className="border p-2 rounded"
              />
              <input
                value={editing.stock || 0}
                type="number"
                onChange={(e) => setEditing({ ...editing, stock: e.target.value })}
                placeholder="Stock"
                className="border p-2 rounded"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.isOnSale}
                  onChange={(e) => setEditing({ ...editing, isOnSale: e.target.checked })}
                />{" "}
                Is On Sale
              </label>
              <textarea
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="border p-2 rounded md:col-span-2"
              />
            </div>

            <div className="mt-4 flex gap-3 justify-end">
              <button type="button" className="border px-4 py-2 rounded" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary px-4 py-2"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
