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
<<<<<<< HEAD
<<<<<<< HEAD
=======
import PasswordChange from "./pages/PasswordChange";
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
import PasswordChange from "./pages/PasswordChange";
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
import Dashboard from "./pages/Dashboard";
import Exam from "./pages/Exam";
import ExamSubmitted from "./pages/ExamSubmitted";
import ExamCancelled from "./pages/ExamCancelled";
import ContactUs from "./pages/ContactUs";
import ForgotId from "./pages/ForgotId";
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
import VerbalReasoningQuiz from "./pages/VerbalReasoningQuiz";
import VerbalReasoning from "./pages/VerbalReasoning";
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Landing = lazy(() => import("./pages/Landing"));
<<<<<<< HEAD
=======
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));

>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6

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
<<<<<<< HEAD
<<<<<<< HEAD
=======
            <Route path="/password-change" element={<PasswordChange />} />
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exam/:id" element={<Exam />} />
            <Route path="/exam/:id/submitted" element={<ExamSubmitted />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/exam/:id/cancelled" element={<ExamCancelled />} />
            <Route path="/ContactUs" element={<ContactUs />} />
            <Route path="/ForgotId" element={<ForgotId />} />
            <Route path="/verbal-reasoning" element={<VerbalReasoningQuiz />} />
            <Route path="/verbal-reasoning/quiz" element={<VerbalReasoning />} />
<<<<<<< HEAD
=======
            <Route path="/password-change" element={<PasswordChange />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exam/:id" element={<Exam />} />
            <Route path="/exam/:id/submitted" element={<ExamSubmitted />} />
            <Route path="/exam/:id/cancelled" element={<ExamCancelled />} />
            <Route path="/ContactUs" element={<ContactUs />} />
            <Route path="/ForgotId" element={<ForgotId />} />
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

<<<<<<< HEAD
<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
export default App;
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
