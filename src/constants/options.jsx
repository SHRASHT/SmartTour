import {
  UserCircle,
  Heart,
  Users,
  UsersRound,
  Briefcase,
  UserCheck,
  Wallet,
  CreditCard,
  Crown,
  Backpack,
} from "lucide-react";

export const SelectTravellersList = [
  {
    id: 1,
    title: "Solo Trip",
    description: "Explore the world on your own terms, at your own pace.",
    people: 1,
    icon: () => <UserCircle size={24} />,
  },
  {
    id: 2,
    title: "Couple Getaway",
    description: "Romantic escapes tailored for two hearts.",
    people: 2,
    icon: () => <Heart size={24} fill="currentColor" />,
  },
  {
    id: 3,
    title: "Family Vacation",
    description: "Memorable journeys for the whole family.",
    people: 3,
    icon: () => <Users size={24} />,
  },
  {
    id: 4,
    title: "Trip with Friends",
    description: "Unforgettable adventures with your favorite people.",
    people: 4,
    icon: () => <UsersRound size={24} />,
  },
  {
    id: 5,
    title: "Business Travel",
    description: "Efficient travel plans to keep you on track.",
    people: 1,
    icon: () => <Briefcase size={24} />,
  },
  {
    id: 6,
    title: "Group Tour",
    description: "Organized trips for large groups and communities.",
    people: 5,
    icon: () => <UserCheck size={24} />,
  },
];

export const SelectBudgetOptions = [
  {
    id: 1,
    title: "Cheap",
    des: "Affordable trips without compromising on experience.",
    icon: () => <Wallet size={24} />,
  },
  {
    id: 2,
    title: "Standard",
    des: "A balanced experience with comfort and value.",
    icon: () => <CreditCard size={24} />,
  },
  {
    id: 3,
    title: "Luxury",
    des: "Premium stays and unforgettable luxuries.",
    icon: () => <Crown size={24} />,
  },
  {
    id: 4,
    title: "Backpacker",
    des: "Minimalist and adventurous travel on a tight budget.",
    icon: () => <Backpack size={24} />,
  },
  {
    id: 5,
    title: "Corporate",
    des: "Professional and efficient travel for work.",
    icon: () => <Briefcase size={24} />,
  },
];

export const AI_PROMPT = `You are a travel planner AI. I am planning a trip for {noOfDays} days for {location} for {totalPeople} people with a {budget} budget.`;
