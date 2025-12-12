// src/App.jsx
import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// NAVBAR (Correct import)
//import Navbar from "./components/NavbarMinimalblend";

//import Navbar from "./components/Navbar";
import Navbar from "./components/NavbarMinimal";
//import Navbar from "./components/NavbarBold";
//import Navbar from "./components/NavbarElegant";
//import Navbar from "./components/NavbarAdvanced";

// GLOBAL COMPONENTS
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import ChatbotWidget from "./components/ChatbotWidget";

// PUBLIC PAGES
import Home from "./pages/Home";
import Products from "./pages/Products";
import SingleProduct from "./pages/SingleProduct";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Blog from "./pages/Blog";
import Post from "./pages/Post";
import Tags from "./pages/Tags";
import TagPosts from "./pages/TagPosts";
import FAQ from "./pages/FAQ";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";

// ADMIN PAGES
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBlogEditor from "./pages/AdminBlogEditor";

/* ------------------------------------------------------------------ */
/*   PROTECTED ROUTE WRAPPER                                          */
/* ------------------------------------------------------------------ */
function PrivateRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin-login" />;
}

/* ------------------------------------------------------------------ */
/*   GLOBAL LAYOUT WITH NAVBAR OFFSET                                 */
/* ------------------------------------------------------------------ */
function Layout({ children }) {
  const location = useLocation();

  // Hide navbar and footer on admin pages
  const hideNavbar = location.pathname.startsWith("/admin");

  // Your fixed navbar height offset
  const NAVBAR_OFFSET = hideNavbar ? "0px" : "110px";

  return (
    <div
      className="min-h-screen"
      style={{
        paddingTop: NAVBAR_OFFSET, // GLOBAL OFFSET FIX
      }}
    >
      {!hideNavbar && <Navbar />}

      <main>{children}</main>

      {!hideNavbar && <Footer />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*   MAIN APP ROUTER                                                  */
/* ------------------------------------------------------------------ */
export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />

          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<SingleProduct />} />

          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Post />} />

          <Route path="/tags" element={<Tags />} />
          <Route path="/tags/:tag" element={<TagPosts />} />

          <Route path="/faq" element={<FAQ />} />
          <Route path="/thank-you" element={<ThankYou />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin-login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/blogs"
            element={
              <PrivateRoute>
                <AdminBlogEditor />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/blogs/edit/:id"
            element={
              <PrivateRoute>
                <AdminBlogEditor />
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>

      {/* Global Chatbot */}
      <ChatbotWidget />
    </Router>
  );
}
