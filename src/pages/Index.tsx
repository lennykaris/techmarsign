import { PageLayout } from "@/components/layout/PageLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { CoursesOverview } from "@/components/home/CoursesOverview";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { LearningApproach } from "@/components/home/LearningApproach";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <PageLayout>
      <HeroSection />
      <CoursesOverview />
      <WhyChooseUs />
      <LearningApproach />
      <CTASection />
    </PageLayout>
  );
};

export default Index;
