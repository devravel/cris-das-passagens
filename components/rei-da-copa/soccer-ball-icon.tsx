import { cn } from "@/lib/utils";

type SoccerBallIconProps = {
  className?: string;
};

export function SoccerBallIcon({ className }: SoccerBallIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" className="fill-[#f5d565] stroke-[#1f5f3a] stroke-[1.5]" />
      <path d="M12 4.5 14.8 9.2 12 12.5 9.2 9.2 12 4.5Z" className="fill-[#1f5f3a]" />
      <path
        d="M16.8 10.2 19.2 14.5 15.8 16.8 13.2 12.8 16.8 10.2Z"
        className="fill-[#1f5f3a]"
      />
      <path
        d="M8.2 10.2 10.8 12.8 8.2 16.8 4.8 14.5 8.2 10.2Z"
        className="fill-[#1f5f3a]"
      />
      <path
        d="M9.5 18.2 12 20.5 14.5 18.2 13.5 15.2 10.5 15.2 9.5 18.2Z"
        className="fill-[#1f5f3a]"
      />
      <path d="M6.2 7.2 9.2 9.2 8.2 6.2 6.2 7.2Z" className="fill-[#1f5f3a]" />
      <path d="M17.8 7.2 15.8 6.2 14.8 9.2 17.8 7.2Z" className="fill-[#1f5f3a]" />
    </svg>
  );
}
