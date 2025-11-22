import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn(
      "relative flex touch-none select-none items-center",
      orientation === "vertical" ? "flex-col h-full w-5" : "w-full",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className={cn(
      "relative grow overflow-hidden rounded-full bg-gray-900 dark:bg-gray-800",
      orientation === "vertical" ? "w-1 h-full" : "h-1 w-full"
    )}>
      <SliderPrimitive.Range className={cn(
        "absolute bg-blue-600",
        orientation === "vertical" ? "w-full" : "h-full"
      )} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-blue-600 bg-white shadow-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
