import Hero from '@/components/landing/Hero';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import LiveTickers from '@/components/landing/LiveTickers';
import PlansSection from '@/components/landing/PlansSection';
import WhatWeProvide from "@/components/landing/WhatWeProvide";
import CalculatorSection from '@/components/landing/CalculatorSection';
import Testimonials from '@/components/landing/Testimonials';
import FAQSection from '@/components/landing/FAQSection';
import ReferralSection from "@/components/landing/ReferralSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LiveTickers />
      <WhyChooseUs />
      <PlansSection />
      <WhatWeProvide />
      <CalculatorSection />
      <Testimonials />
      <ReferralSection />
      <FAQSection />

    </>
  );
}
