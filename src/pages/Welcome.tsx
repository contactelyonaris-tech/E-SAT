import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Clock, IdCard, FileText, BookOpen, AlertCircle, Mail } from "lucide-react";
import logo from "@/assets/logo.png";
// ...existing code...
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();
  const [forgotOpen, setForgotOpen] = useState(false);
  const handleProceed = () => navigate('/registration');
  return (
  <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ELYONARIS Logo" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-primary">ELYONARIS</h1>
              <p className="text-xs text-muted-foreground">Imitated-Registration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/ForgotId')}>
              Forgot ID?
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/ContactUs')}>
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
            {/* Removed empty dialog for Forgot ID */}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="text-sm px-4 py-1.5">
              Meskaye Hizunan - 2026 Batch
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Welcome to{" "}
              <span className="text-primary">ELYONARIS</span>
              <br />
              Registration Portal
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join the 2026 batch of Meskaye Hizunan. Register now to receive your Admission ID for the online exam.
            </p>
            
            <Button size="lg" className="text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all" onClick={handleProceed}>
              <ArrowRight className="w-5 h-5 mr-2" />
              Proceed
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            <Card className="p-8 text-center space-y-4 hover:shadow-lg transition-all border-2 hover:border-primary/20">
              <div className="w-16 h-16 mx-auto bg-accent rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#14532d]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Easy Registration
              </h3>
              <p className="text-muted-foreground">
                Complete your registration quickly and easily
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 hover:shadow-lg transition-all border-2 hover:border-primary/20">
              <div className="w-16 h-16 mx-auto bg-accent rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-[#14532d]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Quick Process
              </h3>
              <p className="text-muted-foreground">
                Complete registration in less than 2 minutes
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 hover:shadow-lg transition-all border-2 hover:border-primary/20">
              <div className="w-16 h-16 mx-auto bg-accent rounded-2xl flex items-center justify-center">
                <IdCard className="w-8 h-8 text-[#14532d]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Admission ID
              </h3>
              <p className="text-muted-foreground">
                Receive your Admission ID for the online exam
              </p>
            </Card>
          </div>
        </section>

        {/* Exam Info Section */}
        <section className="py-20 px-6 bg-secondary/30">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-primary">About the Exam</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Learn everything you need to know about the ELYONARIS 2026 examination process
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Exam Format */}
              <Card className="p-8 space-y-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-[#14532d]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-primary">
                    Exam Format
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>Multiple Choice Questions (MCQ) format</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>Online examination platform</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>Mobile and Computer-based test with real-time monitoring</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>1 Day break and the results upon completion</span>
                  </li>
                </ul>
              </Card>

              {/* Duration & Structure */}
              <Card className="p-8 space-y-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#14532d]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-primary">
                    Duration & Structure
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>Total Duration: 2 hours (120 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>Number of Questions: 100 questions</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>Time per Question: Approximately 1.2 minutes</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>Marking: 1 for correct, 0 for incorrect marking</span>
                  </li>
                </ul>
              </Card>

              {/* Exam Topics */}
              <Card className="p-8 space-y-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-[#14532d]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-primary">
                    Exam Topics
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>English Grammar</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>English Vocabulary</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>Reading Comprehension</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>Punctuation</span>
                  </li>
                </ul>
              </Card>

              {/* Exam Guidelines */}
              <Card className="p-8 space-y-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-[#14532d]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-primary">
                    Exam Guidelines
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>Stable internet connection required</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>Quiet environment with no distractions</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>Read all instructions carefully before starting</span>
                  </li>
                </ul>
              </Card>
            </div>

            {/* Important Notes */}
            <Card className="p-8 bg-accent border-2 border-primary/20">
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Important Notes
              </h3>
              <ul className="space-y-3 text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                  <span>
                    All <strong>registered candidates</strong> will receive their{" "}
                    <strong>Admission ID</strong> for the online exam
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                  <span>
                    Use your <strong>Admission ID</strong> to log in to the main website for the exam and check your results
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                  <span>
                    For technical support or queries, <strong>please contact us through the Contact Us page</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                  <span>
                    <strong>Results will be announced within 1 Day</strong> after the examination date
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Welcome;
