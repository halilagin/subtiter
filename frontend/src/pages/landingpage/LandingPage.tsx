import LandingPageHero from "@/pages/landingpage/hero/HeroIndex";
import LandingPageFAQSection from "@/pages/landingpage/faq/FAQSection";
import Footer from "@/pages/landingpage/footer/Footer";
import LandingPageProductCarousel from "@/pages/landingpage/sections/AIReframe2";
import GetStarted from "@/pages/landingpage/sections/GetStarted";
import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import KlippersFeaturesAIDetection from "@/pages/landingpage/sections/FeatureAIDetection";
import TrimVideoSection from "@/pages/landingpage/sections/TrimVideoSection";


const LandingPage = () => {
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);

  // Fix background color for this page
  useEffect(() => {
    const originalBodyStyle = {
      backgroundColor: document.body.style.backgroundColor,
      margin: document.body.style.margin,
      padding: document.body.style.padding
    };

    document.body.style.backgroundColor = '#f5f5f5';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.backgroundColor = '#f5f5f5';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.overflowX = 'hidden';

    return () => {
      document.body.style.backgroundColor = originalBodyStyle.backgroundColor;
      document.body.style.margin = originalBodyStyle.margin;
      document.body.style.padding = originalBodyStyle.padding;
      document.documentElement.style.backgroundColor = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
    };
  }, []);

  const handleAlternativeSelect = (alternative: string) => {
    setSelectedAlternative(alternative);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', overflowX: 'hidden' }}>
      <LandingPageHero />
      <Box sx={{ px: { xs: 2, md: 0 } }}>
        <LandingPageProductCarousel />
        {/* <Features /> */}
        <KlippersFeaturesAIDetection />
        {/* <FeaturesNew2 /> */}
        {/* <UseCases />
        <Benefits /> */}
        {/* <StatsSection /> */}
        {/* <HowItWorksSection /> */}
        
        <TrimVideoSection />
        <LandingPageFAQSection />
        
        <GetStarted />
      </Box>
      <Footer
        selectedAlternative={selectedAlternative}
        onAlternativeSelect={handleAlternativeSelect}
      />
    </div>
  );
};

export default LandingPage;

