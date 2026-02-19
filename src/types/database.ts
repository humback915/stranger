export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string;
          nickname: string;
          birth_year: number;
          gender: "male" | "female";
          occupation: string;
          mbti: string | null;
          activity_area: string;
          activity_lat: number;
          activity_lng: number;
          hobbies: string[];
          personality: string[];
          ideal_type: string[];
          photo_urls: string[];
          preferred_gender: "male" | "female" | "any";
          preferred_age_min: number;
          preferred_age_max: number;
          preferred_distance_km: number;
          status: "active" | "paused" | "banned";
          no_show_count: number;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          nickname?: string;
          birth_year: number;
          gender: "male" | "female";
          occupation: string;
          mbti?: string | null;
          activity_area: string;
          activity_lat: number;
          activity_lng: number;
          hobbies?: string[];
          personality?: string[];
          ideal_type?: string[];
          photo_urls?: string[];
          preferred_gender: "male" | "female" | "any";
          preferred_age_min?: number;
          preferred_age_max?: number;
          preferred_distance_km?: number;
          status?: "active" | "paused" | "banned";
          no_show_count?: number;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          nickname?: string;
          birth_year?: number;
          gender?: "male" | "female";
          occupation?: string;
          mbti?: string | null;
          activity_area?: string;
          activity_lat?: number;
          activity_lng?: number;
          hobbies?: string[];
          personality?: string[];
          ideal_type?: string[];
          photo_urls?: string[];
          preferred_gender?: "male" | "female" | "any";
          preferred_age_min?: number;
          preferred_age_max?: number;
          preferred_distance_km?: number;
          status?: "active" | "paused" | "banned";
          no_show_count?: number;
          is_admin?: boolean;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: number;
          category: "values" | "lifestyle" | "romance" | "personality" | "taste";
          question_text: string;
          option_a: string;
          option_b: string;
          weight: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          category: "values" | "lifestyle" | "romance" | "personality" | "taste";
          question_text: string;
          option_a: string;
          option_b: string;
          weight?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          category?: "values" | "lifestyle" | "romance" | "personality" | "taste";
          question_text?: string;
          option_a?: string;
          option_b?: string;
          weight?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      user_answers: {
        Row: {
          id: number;
          user_id: string;
          question_id: number;
          answer: "a" | "b";
          answered_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          question_id: number;
          answer: "a" | "b";
          answered_at?: string;
        };
        Update: {
          user_id?: string;
          question_id?: number;
          answer?: "a" | "b";
        };
        Relationships: [
          {
            foreignKeyName: "user_answers_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_answers_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          id: number;
          user_a_id: string;
          user_b_id: string;
          similarity_score: number;
          compatibility_score: number;
          distance_km: number | null;
          user_a_accepted: boolean | null;
          user_b_accepted: boolean | null;
          status: "pending" | "accepted" | "rejected" | "expired" | "completed";
          ai_description: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_a_id: string;
          user_b_id: string;
          similarity_score?: number;
          compatibility_score?: number;
          distance_km?: number | null;
          user_a_accepted?: boolean | null;
          user_b_accepted?: boolean | null;
          status?: "pending" | "accepted" | "rejected" | "expired" | "completed";
          ai_description?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          similarity_score?: number;
          compatibility_score?: number;
          distance_km?: number | null;
          user_a_accepted?: boolean | null;
          user_b_accepted?: boolean | null;
          status?: "pending" | "accepted" | "rejected" | "expired" | "completed";
          ai_description?: string | null;
          expires_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "matches_user_a_id_fkey";
            columns: ["user_a_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_user_b_id_fkey";
            columns: ["user_b_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      missions: {
        Row: {
          id: number;
          match_id: number;
          place_name: string;
          place_address: string;
          place_lat: number;
          place_lng: number;
          place_category: "cafe" | "bookstore" | "park" | "museum" | "library" | "mall" | "restaurant";
          user_a_prop_category: "clothing_color" | "phone_screen" | "convenience_item" | "accessory" | "book_magazine";
          user_a_prop_name: string;
          user_a_prop_description: string | null;
          user_b_prop_category: "clothing_color" | "phone_screen" | "convenience_item" | "accessory" | "book_magazine";
          user_b_prop_name: string;
          user_b_prop_description: string | null;
          user_a_action: string | null;
          user_b_action: string | null;
          meeting_date: string;
          meeting_time: string;
          user_a_departure_confirmed: boolean;
          user_b_departure_confirmed: boolean;
          status: "scheduled" | "in_progress" | "completed" | "cancelled";
          ai_place_rationale: string | null;
          ai_prop_rationale_a: string | null;
          ai_prop_rationale_b: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          match_id: number;
          place_name: string;
          place_address: string;
          place_lat: number;
          place_lng: number;
          place_category: "cafe" | "bookstore" | "park" | "museum" | "library" | "mall" | "restaurant";
          user_a_prop_category: "clothing_color" | "phone_screen" | "convenience_item" | "accessory" | "book_magazine";
          user_a_prop_name: string;
          user_a_prop_description?: string | null;
          user_b_prop_category: "clothing_color" | "phone_screen" | "convenience_item" | "accessory" | "book_magazine";
          user_b_prop_name: string;
          user_b_prop_description?: string | null;
          user_a_action?: string | null;
          user_b_action?: string | null;
          meeting_date: string;
          meeting_time: string;
          user_a_departure_confirmed?: boolean;
          user_b_departure_confirmed?: boolean;
          status?: "scheduled" | "in_progress" | "completed" | "cancelled";
          ai_place_rationale?: string | null;
          ai_prop_rationale_a?: string | null;
          ai_prop_rationale_b?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          place_name?: string;
          place_address?: string;
          place_lat?: number;
          place_lng?: number;
          place_category?: "cafe" | "bookstore" | "park" | "museum" | "library" | "mall" | "restaurant";
          user_a_prop_category?: "clothing_color" | "phone_screen" | "convenience_item" | "accessory" | "book_magazine";
          user_a_prop_name?: string;
          user_a_prop_description?: string | null;
          user_b_prop_category?: "clothing_color" | "phone_screen" | "convenience_item" | "accessory" | "book_magazine";
          user_b_prop_name?: string;
          user_b_prop_description?: string | null;
          user_a_action?: string | null;
          user_b_action?: string | null;
          meeting_date?: string;
          meeting_time?: string;
          user_a_departure_confirmed?: boolean;
          user_b_departure_confirmed?: boolean;
          status?: "scheduled" | "in_progress" | "completed" | "cancelled";
          ai_place_rationale?: string | null;
          ai_prop_rationale_a?: string | null;
          ai_prop_rationale_b?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "missions_match_id_fkey";
            columns: ["match_id"];
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      safety_reports: {
        Row: {
          id: number;
          reporter_id: string;
          reported_user_id: string;
          mission_id: number | null;
          report_type: "harassment" | "inappropriate" | "no_show" | "safety" | "other";
          description: string | null;
          reporter_lat: number | null;
          reporter_lng: number | null;
          status: "pending" | "reviewing" | "resolved" | "dismissed";
          created_at: string;
        };
        Insert: {
          id?: number;
          reporter_id: string;
          reported_user_id: string;
          mission_id?: number | null;
          report_type: "harassment" | "inappropriate" | "no_show" | "safety" | "other";
          description?: string | null;
          reporter_lat?: number | null;
          reporter_lng?: number | null;
          status?: "pending" | "reviewing" | "resolved" | "dismissed";
          created_at?: string;
        };
        Update: {
          report_type?: "harassment" | "inappropriate" | "no_show" | "safety" | "other";
          description?: string | null;
          reporter_lat?: number | null;
          reporter_lng?: number | null;
          status?: "pending" | "reviewing" | "resolved" | "dismissed";
        };
        Relationships: [
          {
            foreignKeyName: "safety_reports_reporter_id_fkey";
            columns: ["reporter_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "safety_reports_reported_user_id_fkey";
            columns: ["reported_user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "safety_reports_mission_id_fkey";
            columns: ["mission_id"];
            referencedRelation: "missions";
            referencedColumns: ["id"];
          },
        ];
      };
      custom_questions: {
        Row: {
          id: number;
          author_id: string;
          question_text: string;
          option_a: string;
          option_b: string;
          preferred_answer: "a" | "b";
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          author_id: string;
          question_text: string;
          option_a: string;
          option_b: string;
          preferred_answer: "a" | "b";
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          question_text?: string;
          option_a?: string;
          option_b?: string;
          preferred_answer?: "a" | "b";
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "custom_questions_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      custom_question_answers: {
        Row: {
          id: number;
          question_id: number;
          user_id: string;
          answer: "a" | "b";
          answered_at: string;
        };
        Insert: {
          id?: number;
          question_id: number;
          user_id: string;
          answer: "a" | "b";
          answered_at?: string;
        };
        Update: {
          answer?: "a" | "b";
        };
        Relationships: [
          {
            foreignKeyName: "custom_question_answers_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "custom_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "custom_question_answers_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          type: "match_new" | "match_accepted" | "match_rejected" | "mission_created" | "match_expired";
          title: string;
          body: string;
          related_match_id: number | null;
          related_mission_id: number | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          type: "match_new" | "match_accepted" | "match_rejected" | "mission_created" | "match_expired";
          title: string;
          body: string;
          related_match_id?: number | null;
          related_mission_id?: number | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_related_match_id_fkey";
            columns: ["related_match_id"];
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_related_mission_id_fkey";
            columns: ["related_mission_id"];
            referencedRelation: "missions";
            referencedColumns: ["id"];
          },
        ];
      };
      no_show_checks: {
        Row: {
          id: number;
          mission_id: number;
          user_id: string;
          status: "pending" | "confirmed" | "no_show";
          check_deadline: string;
          confirmed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          mission_id: number;
          user_id: string;
          status?: "pending" | "confirmed" | "no_show";
          check_deadline: string;
          confirmed_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: "pending" | "confirmed" | "no_show";
          confirmed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "no_show_checks_mission_id_fkey";
            columns: ["mission_id"];
            referencedRelation: "missions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "no_show_checks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: {
          id: number;
          user_id: string;
          fcm_token: string;
          device_info: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          fcm_token: string;
          device_info?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          fcm_token?: string;
          device_info?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: number;
          match_id: number;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          match_id: number;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey";
            columns: ["match_id"];
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      question_category: "values" | "lifestyle" | "romance" | "personality" | "taste";
      match_status: "pending" | "accepted" | "rejected" | "expired" | "completed";
      report_type: "harassment" | "inappropriate" | "no_show" | "safety" | "other";
      notification_type: "match_new" | "match_accepted" | "match_rejected" | "mission_created" | "match_expired";
    };
    CompositeTypes: Record<string, never>;
  };
};
