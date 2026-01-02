import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-hero text-primary-foreground relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-8">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Limited Seats Available</span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Start Your{" "}
            <span className="text-secondary">Tech Journey?</span>
          </h2>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Join thousands of successful graduates who transformed their careers 
            with Tecmarsign Academy. Enroll today and take the first step toward 
            your dream career.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/enroll">
                Enroll Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/contact">Talk to an Advisor</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-primary-foreground/10">
            <p className="text-sm text-primary-foreground/60 mb-4">
              Trusted by leading companies
            </p>
            <div className="flex flex-wrap justify-center gap-8 opacity-60">
              {["TechCorp", "DigitalFirst", "CreativeHub", "StartupXYZ"].map(
                (company) => (
                  <span
                    key={company}
                    className="font-display font-semibold text-lg"
                  >
                    {company}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
