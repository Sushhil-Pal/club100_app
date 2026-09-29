export type Session = {
  id: string;
  title: string;
  subtitle: string;

  date: string;
  startTime: string;
  endTime: string;

  trainer: string;

  level:
    | "Beginner"
    | "Intermediate"
    | "Advanced";

  format:
    | "Power"
    | "Flow"
    | "Pulse"
    | "Play";

  status:
    | "Upcoming"
    | "Scheduled"
    | "Live"
    | "Completed"
    | "Cancelled";

  deliveryMode?: "Online" | "Offline" | "Hybrid";

  meetingProvider?: string | null;
  meetingUrl?: string | null;

  equipment?: string[];

  workout?: {
    id: string;
    videoUrl?: string | null;
    durationMinutes?: number;
    instructions?: string | null;
  } | null;
};