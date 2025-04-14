import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CounterProps {
  value: number;
  isLoading?: boolean;
}

const Counter = ({ value, isLoading = false }: CounterProps) => {
  const [animate, setAnimate] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      setAnimate(true);
      
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 300);
      
      setPrevValue(value);
      
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  if (isLoading) {
    return <Skeleton className="h-20 w-32 mx-auto" />;
  }

  return (
    <div className="relative">
      <span 
        className={cn(
          "text-6xl md:text-7xl font-bold text-gray-800 block transition-transform duration-300",
          animate && "scale-110"
        )}
      >
        {value}
      </span>
    </div>
  );
};

export default Counter;
