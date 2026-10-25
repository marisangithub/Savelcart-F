
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MyProfile from "./pages/MyProfile";
import SellBird from "./pages/SellBird";
import BirdListings from "./pages/BirdListings";
import Checkout from "./pages/Checkout";
// import BirdDetails from "./pages/BirdDetails";
import MyOrders from "./pages/MyOrders";
import SellerOrders from "./pages/SellerOrders";
import OrdersHub from "./pages/OrdersHub";
import BirdDetailsV2 from "./pages/BirdDetailsV2";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
   
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/sell-bird" element={<SellBird />} />
        <Route path="/birds" element={<BirdListings />} />
        {/* <Route path="/birds/:id" element={<BirdDetails />} /> */}
        <Route path="/birds/:id" element={<BirdDetailsV2 />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/seller-orders" element={<SellerOrders />} />
        <Route path="/orders" element={<OrdersHub />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  
  );
}
