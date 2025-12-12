import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { LoadingPage } from "./components/ui/loading";
import { PageTitle } from "./components/PageTitle";
const Index = lazy(() => import("./pages/Index"));
const Welcome = lazy(() => import("./pages/Welcome"));
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import PasswordChange from "./pages/PasswordChange";
import Dashboard from "./pages/Dashboard";
import Exam from "./pages/Exam";
import ExamSubmitted from "./pages/ExamSubmitted";
import ExamCancelled from "./pages/ExamCancelled";
import ContactUs from "./pages/ContactUs";
import ForgotId from "./pages/ForgotId";
import VerbalReasoningQuiz from "./pages/VerbalReasoningQuiz";
import VerbalReasoning from "./pages/VerbalReasoning";
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Landing = lazy(() => import("./pages/Landing"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageTitle />
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/password-change" element={<PasswordChange />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exam/:id" element={<Exam />} />
            <Route path="/exam/:id/submitted" element={<ExamSubmitted />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/exam/:id/cancelled" element={<ExamCancelled />} />
            <Route path="/ContactUs" element={<ContactUs />} />
            <Route path="/ForgotId" element={<ForgotId />} />
            <Route path="/verbal-reasoning" element={<VerbalReasoningQuiz />} />
            <Route path="/verbal-reasoning/quiz" element={<VerbalReasoning />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
