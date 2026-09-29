import type { Session } from "../types/session";

export const mockSessions: Session[] = [
  {
    id: "C100-SES-00001",
    title: "Power",
    subtitle: "Full Body Strength",
    dateLabel: "Today • Mon, 14 Oct",
    date: "2026-10-14",
    startTime: "7:00 AM",
    endTime: "8:00 AM",
    trainer: "Gayatri",
    level: "Beginner",
    format: "Power",
    status: "Upcoming",
    equipment: ["Resistance band", "Dumbbells", "Water bottle"],
  },
  {
    id: "C100-SES-00002",
    title: "Flow",
    subtitle: "Mobility & Flexibility",
    dateLabel: "Wed, 16 Oct",
    date: "2026-10-16",
    startTime: "7:00 AM",
    endTime: "8:00 AM",
    trainer: "Rahul",
    level: "Beginner",
    format: "Flow",
    status: "Upcoming",
  },
];