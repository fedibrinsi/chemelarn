import { Atom, Beaker, FlaskConical, Microscope, Orbit, Pipette, Syringe, TestTubeDiagonal } from "lucide-react";

const doodles = [
  { Icon: FlaskConical, className: "left-[4%] top-[10%] h-24 w-24 float-slow", rotation: "-8deg" },
  { Icon: TestTubeDiagonal, className: "left-[18%] top-[14%] h-18 w-18 float-mid", rotation: "12deg" },
  { Icon: Atom, className: "left-[42%] top-[8%] h-20 w-20 float-slower", rotation: "8deg" },
  { Icon: Pipette, className: "right-[14%] top-[9%] h-24 w-24 float-fast", rotation: "20deg" },
  { Icon: Beaker, className: "right-[7%] top-[28%] h-24 w-24 float-mid", rotation: "6deg" },
  { Icon: Orbit, className: "left-[8%] top-[43%] h-20 w-20 float-fast", rotation: "14deg" },
  { Icon: Microscope, className: "left-[19%] top-[63%] h-24 w-24 float-slower", rotation: "-12deg" },
  { Icon: TestTubeDiagonal, className: "right-[25%] top-[60%] h-20 w-20 float-slow", rotation: "6deg" },
  { Icon: Syringe, className: "right-[9%] bottom-[8%] h-28 w-28 float-mid", rotation: "-15deg" },
  { Icon: Beaker, className: "left-[4%] bottom-[10%] h-24 w-24 float-fast", rotation: "9deg" },
];

export function ChemistryBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 chem-wallpaper opacity-45" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_rgba(244,251,253,0.86)_58%,_rgba(239,249,252,0.94))]" />
      <div className="absolute inset-0">
        {doodles.map(({ Icon, className, rotation }, index) => (
          <div
            key={index}
            className={`absolute text-[#11437b]/85 ${className}`}
            style={{ ["--rotation" as string]: rotation }}
          >
            <Icon strokeWidth={1.4} className="h-full w-full drop-shadow-[0_8px_18px_rgba(17,67,123,0.08)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
