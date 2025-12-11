import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/elyon-logo.png";
import {
  Menu,
  X,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Brain,
  Target,
  Clock,
  BarChart3,
  Shield,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Sparkles,
} from "lucide-react";

// ==================== HEADER ====================
const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 border-b border-primary-foreground/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center shadow-soft group-hover:shadow-lg transition-all duration-300 overflow-hidden">
              <img src={logo} alt="Elyon Logo" className="h-8 w-auto" />
            </div>
            <span className="font-display font-bold text-xl text-primary-foreground">
              ELYON<span className="text-accent">-TEST</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/forgotid')}
            >
              Forgot ID
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/contactus')}
            >
              Contact Us
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white text-primary hover:bg-gray-50"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white text-primary hover:bg-gray-50"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <button
              className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
              <X className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-primary-foreground" />
            )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-primary-foreground/10">
            <div className="flex flex-col space-y-2">
              <Button 
                variant="ghost" 
                className="justify-start text-primary-foreground/80 hover:bg-primary-foreground/10"
                onClick={() => {
                  navigate('/forgotid');
                  setIsMenuOpen(false);
                }}
              >
                Forgot ID
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start text-primary-foreground/80 hover:bg-primary-foreground/10"
                onClick={() => {
                  navigate('/contactus');
                  setIsMenuOpen(false);
                }}
              >
                Contact Us
              </Button>
              <Button 
                variant="outline" 
                className="justify-start bg-white text-primary hover:bg-gray-50"
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
              >
                Sign In
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

// ==================== HERO SECTION ====================
const HeroSection = () => {
  const navigate = useNavigate();
  const trustIndicators = [
    { icon: Users, label: "88+ Students" },
    { icon: Award, label: "All Subjects Covered" },
    { icon: Award, label: "For the Elyonaris Batch" },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-primary">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full border border-primary-foreground/20 mb-8">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground">
              For Meskaye 12vers 
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 text-balance">
            Master E-Exams with{" "}
            <span className="text-accent">Real Practice</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Meskaye's official exam simulation platform to help Grade 12 students conquer exam anxiety through realistic E-Exam practice.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              variant="accent" 
              size="xl" 
              className="hover:bg-accent/90"
              onClick={() => navigate('/registration')}
            >
              Register For The Exams
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="heroOutline" 
              size="xl"
              onClick={() => navigate('/login')}
            >
              Login To The Exams
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {trustIndicators.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-primary-foreground/70">
                <item.icon className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

// ==================== FEATURES SECTION ====================
const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Real Exam Simulation",
      description: "Practice with an interface that mirrors the actual E-Exam environment.",
    },
    {
      icon: Target,
      title: "Focused Preparation",
      description: "Target your weak areas with personalized practice tests and analytics.",
    },
    {
      icon: Clock,
      title: "Time Management",
      description: "Get comfortable with exam timing through timed practice sessions.",
    },
    {
      icon: BarChart3,
      title: "Performance Tracking",
      description: "Monitor your progress with detailed performance reports.",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data and progress are protected with enterprise-grade security.",
    },
    {
      icon: UserPlus,
      title: "Dedicated Support",
      description: "Get help whenever you need it from our team of experts.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted-foreground">
            Our comprehensive platform provides all the tools and resources to help you excel in your E-Exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== HOW IT WORKS SECTION ====================
const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Create an Account",
      description: "Sign up and verify your email to get started with your exam preparation.",
    },
    {
      number: "02",
      title: "Choose Your Subject",
      description: "Select from a wide range of subjects and topics to focus your practice.",
    },
    {
      number: "03",
      title: "Take Practice Tests",
      description: "Simulate real exam conditions with timed practice tests and instant feedback.",
    },
    {
      number: "04",
      title: "Track Your Progress",
      description: "Monitor your improvement with detailed analytics and performance reports.",
    },
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes and be on your way to exam success with our simple process.
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
          
          <div className="space-y-12 md:space-y-16">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`relative flex flex-col md:flex-row items-center gap-6 md:gap-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {step.number}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== CTA SECTION ====================
const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative py-20 bg-primary overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Ace Your E-Exams?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have improved their exam performance with our platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="accent" 
              size="xl" 
              className="hover:bg-accent/90"
              onClick={() => navigate('/registration')}
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== FOOTER ====================
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Careers", href: "/careers" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Tutorials", href: "/tutorials" },
        { label: "Webinars", href: "/webinars" },
        { label: "Documentation", href: "/docs" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "GDPR", href: "/gdpr" },
      ],
    },
  ];
  
  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com" },
    { icon: Twitter, href: "https://twitter.com" },
    { icon: Instagram, href: "https://instagram.com" },
    { icon: Youtube, href: "https://youtube.com" },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <a href="/" className="flex items-center gap-3 group mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-soft group-hover:shadow-lg transition-all duration-300 overflow-hidden">
                <img src={logo} alt="Elyon Logo" className="h-8 w-auto" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                ELYON<span className="text-accent">-TEST</span>
              </span>
            </a>
            <p className="text-muted-foreground mb-6">
              Empowering students with the tools they need to succeed in their E-Exams through realistic practice and comprehensive preparation.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((column, index) => (
            <div key={index}>
              <h4 className="font-semibold text-foreground mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href} 
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} Elyon Test Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ==================== MAIN LANDING PAGE ====================
const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
