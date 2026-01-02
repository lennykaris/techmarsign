import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const phases = [
  {
    number: "01",
    title: "Foundation",
    description: "Build strong fundamentals with core concepts and essential tools.",
    features: ["Core concepts", "Essential tools", "Basic projects"],
  },
  {
    number: "02",
    title: "Development",
    description: "Dive deeper into advanced topics and real-world applications.",
    features: ["Advanced techniques", "Industry standards", "Team projects"],
  },
  {
    number: "03",
    title: "Specialization",
    description: "Focus on your area of interest and build expertise.",
    features: ["Expert-level skills", "Portfolio projects", "Mentorship"],
  },
  {
    number: "04",
    title: "Career Launch",
    description: "Prepare for the job market with practical career support.",
    features: ["Resume building", "Interview prep", "Job placement"],
  },
];

export function LearningApproach() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <Badge variant="secondary" className="mb-4">
              Our Approach
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              A Structured Path to{" "}
              <span className="text-secondary">Mastery</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Our phased learning approach ensures you build skills progressively, 
              from fundamentals to job-ready expertise. Each phase builds on the 
              previous, creating a solid foundation for your tech career.
            </p>

            {/* Key Points */}
            <div className="space-y-4">
              {[
                "Hands-on projects at every stage",
                "Industry-aligned curriculum",
                "Personal mentorship from experts",
                "Flexible online and offline options",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                  <span className="text-foreground">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-6">
            {phases.map((phase, index) => (
              <div
                key={phase.number}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Connection line */}
                {index < phases.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-border" />
                )}

                <div className="flex gap-6">
                  {/* Number circle */}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-display font-bold shrink-0 group-hover:scale-110 transition-transform">
                    {phase.number}
                  </div>

                  {/* Content */}
                  <div className="pb-8">
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {phase.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {phase.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {phase.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
