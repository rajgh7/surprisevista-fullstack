// src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Blog from "./pages/Blog";
import Post from "./pages/Post";
import AdminBlogEditor from "./pages/AdminBlogEditor";
import Tags from "./pages/Tags";
import TagPosts from "./pages/TagPosts";
import ThankYou from "./pages/ThankYou";



// Protect admin route
function PrivateRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin-login" />;
}

// Layout hides Navbar on admin-login page
function Layout({ children }) {
  const location = useLocation();
  const hideNavbar = location.pathname === "/admin-login";
  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className="pt-20">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/blog" element={<Blog />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/tags/:tag" element={<TagPosts />} />
          <Route path="/blog/:slug" element={<Post />} />
          <Route path="/admin/blogs" element={<PrivateRoute><AdminBlogEditor /></PrivateRoute>} />
          <Route path="/admin/blogs/edit/:id" element={<PrivateRoute><AdminBlogEditor /></PrivateRoute>} />
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/thank-you" element={<ThankYou />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
<Route path="/admin/blogs/edit/:id" element={
  <PrivateRoute>
    <AdminBlogEditor />
  </PrivateRoute>
}/>

        </Routes>
      </Layout>

      <footer className="bg-gray-100 text-center py-4 text-sm text-gray-600 border-t">
        © {new Date().getFullYear()} SurpriseVista. All rights reserved.
      </footer>
    </Router>
  );
}
