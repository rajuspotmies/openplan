"use client";

import RoverExplorer from "@/components/rover-3d/RoverExplorer";
import RoverAnatomy from "@/components/rover-anatomy/RoverAnatomy";

export default function TestRoverAnatomy() {
  return (
    <main className="min-h-screen bg-background">
      <RoverExplorer nextId="blueprint" />
      <div id="blueprint" className="rv-band">
        <header className="rv-band-head">
          <p>Sheet 01 · Blueprint view</p>
          <h2>The same rover, drawn to scale</h2>
          <span>Every part from the 3D model as a technical drawing. Keep scrolling and it comes apart again, assembly by assembly.</span>
        </header>
        <RoverAnatomy variant="blueprint" />
      </div>
    </main>
  );
}
