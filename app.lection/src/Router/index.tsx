import { Route, Routes } from "react-router-dom";

import { ForgotPassword } from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";
import { Questions } from "@/pages/Questions";
import { SignIn } from "../pages/SignIn";
import { SignUp } from "../pages/SignUp";
import { Statistics } from "../pages/Statistics";
import { AuthGuard } from "./AuthGuard";

export function Router() {
  return (
    <Routes>
      <Route path="/questions" element={<Questions />} />
      <Route element={<AuthGuard isPrivate />}>
        <Route path="/" element={<Statistics />} />
      </Route>

      <Route element={<AuthGuard isPrivate={false} />}>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
