import { CTASection } from "@/components/CTASection";
import { FeatureSection } from "@/components/FeatureSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { TestimonialSection } from "@/components/TestimonialSection";

const IndexPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <HeroSection />
                <FeatureSection />
                <TestimonialSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
};

export default IndexPage;
