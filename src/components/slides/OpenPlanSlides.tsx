"use client";

// The three dark hairline slides that follow "Why OpenPlan exists" (DemoVideo):
// 1. the stack, 2. the system map, 3. the sticky tour. Modelled on caveman.so.
import "./slides.css";
import StackSlide from "./StackSlide";
import SystemSlide from "./SystemSlide";
import TourSlide from "./TourSlide";

export default function OpenPlanSlides() {
  return (
    <div className="ops">
      <div className="ops-frame">
        <StackSlide />
        <SystemSlide />
        <TourSlide />
      </div>
    </div>
  );
}
