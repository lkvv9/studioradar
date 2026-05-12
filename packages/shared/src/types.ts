export type UserRole = "artist" | "pro_studio" | "home_studio" | "music_lover";

export type StudioType = "pro" | "home";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  genres?: string[];
  location?: {
    lat: number;
    lng: number;
    city?: string;
  };
  created_at: string;
}

export interface Studio {
  id: string;
  owner_id: string;
  name: string;
  type: StudioType;
  description: string;
  hourly_rate?: number;
  is_free: boolean;
  is_available_now: boolean;
  lat: number;
  lng: number;
  address: string;
  city: string;
  photos: string[];
  equipment: string[];
  genres: string[];
  rating?: number;
  reviews_count?: number;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  studio_id: string;
  artist_id: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_price?: number;
  notes?: string;
  created_at: string;
}

export interface TimeSlot {
  hour: number;
  minute: 0 | 30;
  available: boolean;
}

export interface BookingDraft {
  studio_id: string;
  date: string;        // ISO date string "YYYY-MM-DD"
  start_hour: number;  // 0-23
  duration_hours: number; // 1-8
  notes?: string;
}

export interface BookingWithStudio extends Booking {
  studio: Pick<Studio, "id" | "name" | "type" | "hourly_rate" | "city" | "address">;
}

export interface Review {
  id:           string;
  studio_id:    string;
  booking_id:   string;
  author_id:    string;
  rating:       1 | 2 | 3 | 4 | 5;
  comment?:     string;
  created_at:   string;
}

export interface ReviewWithAuthor extends Review {
  author_name:   string;
  author_avatar?: string;
  author_role:   UserRole;
}

export interface Message {
  id:              string;
  conversation_id: string;
  sender_id:       string;
  content:         string;
  read_at?:        string;
  created_at:      string;
}

export interface Conversation {
  id:               string;
  other_id:         string;
  other_name:       string;
  other_avatar?:    string;
  other_role:       UserRole;
  last_message?:    string;
  last_message_at?: string;
  unread_count:     number;
}

export interface MusicMatch {
  id: string;
  user_id: string;
  matched_user_id: string;
  status: "pending" | "matched" | "rejected";
  created_at: string;
}

export interface SwipeProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  genres: string[];
  role: UserRole;
  distance_km?: number;
}
