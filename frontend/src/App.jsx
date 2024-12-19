import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignUp from "./pages/signup";
import SignIn from "./pages/login";
import VerifyOTP from "./pages/verify-otp";
import ResetPassword from "./pages/reset-password";
import ForgotPassword from "./pages/forgot-password";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp/:randomString" element={<VerifyOTP />} />
        <Route
          path="/reset-password/:randomToken"
          element={<ResetPassword />}
        />
        <Route path="/" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
