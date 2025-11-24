export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          rarity: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          rarity: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          rarity?: string
        }
        Relationships: []
      }
      chain_contributions: {
        Row: {
          chain_id: string
          created_at: string | null
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          chain_id: string
          created_at?: string | null
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          chain_id?: string
          created_at?: string | null
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chain_contributions_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "spotlight_chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chain_contributions_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
      chain_message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chain_message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chain_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chain_message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chain_messages: {
        Row: {
          audio_duration: number | null
          audio_url: string | null
          chain_id: string
          content: string | null
          created_at: string | null
          edited_at: string | null
          id: string
          image_url: string | null
          sender_id: string
        }
        Insert: {
          audio_duration?: number | null
          audio_url?: string | null
          chain_id: string
          content?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          image_url?: string | null
          sender_id: string
        }
        Update: {
          audio_duration?: number | null
          audio_url?: string | null
          chain_id?: string
          content?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          image_url?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chain_messages_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "spotlight_chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chain_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chain_participants: {
        Row: {
          chain_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          chain_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          chain_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chain_participants_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "spotlight_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "friend_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_submissions: {
        Row: {
          ai_feedback: string | null
          ai_score: number | null
          challenge_id: string
          id: string
          photo_id: string
          rank: number | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          ai_score?: number | null
          challenge_id: string
          id?: string
          photo_id: string
          rank?: number | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          ai_score?: number | null
          challenge_id?: string
          id?: string
          photo_id?: string
          rank?: number | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "friend_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          photo_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          photo_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          photo_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_challenges: {
        Row: {
          auto_judge_scheduled: boolean | null
          challenge_prompt: string
          created_at: string | null
          creator_id: string
          description: string
          end_date: string
          id: string
          judging_completed_at: string | null
          max_participants: number
          min_participants: number
          points_reward: number
          status: string
          title: string
          winner_id: string | null
        }
        Insert: {
          auto_judge_scheduled?: boolean | null
          challenge_prompt: string
          created_at?: string | null
          creator_id: string
          description: string
          end_date: string
          id?: string
          judging_completed_at?: string | null
          max_participants?: number
          min_participants?: number
          points_reward?: number
          status?: string
          title: string
          winner_id?: string | null
        }
        Update: {
          auto_judge_scheduled?: boolean | null
          challenge_prompt?: string
          created_at?: string | null
          creator_id?: string
          description?: string
          end_date?: string
          id?: string
          judging_completed_at?: string | null
          max_participants?: number
          min_participants?: number
          points_reward?: number
          status?: string
          title?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friend_challenges_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_challenges_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          audio_duration: number | null
          audio_url: string | null
          chain_id: string | null
          content: string | null
          created_at: string | null
          edited_at: string | null
          id: string
          image_url: string | null
          read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          audio_duration?: number | null
          audio_url?: string | null
          chain_id?: string | null
          content?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          image_url?: string | null
          read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          audio_duration?: number | null
          audio_url?: string | null
          chain_id?: string | null
          content?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          image_url?: string | null
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "spotlight_chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      photography_spots: {
        Row: {
          best_time: string
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          image_url: string | null
          latitude: number
          longitude: number
          name: string
          rating: number | null
          scene_types: string[]
          views_count: number | null
          weather_types: string[]
        }
        Insert: {
          best_time?: string
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          image_url?: string | null
          latitude: number
          longitude: number
          name: string
          rating?: number | null
          scene_types?: string[]
          views_count?: number | null
          weather_types?: string[]
        }
        Update: {
          best_time?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          image_url?: string | null
          latitude?: number
          longitude?: number
          name?: string
          rating?: number | null
          scene_types?: string[]
          views_count?: number | null
          weather_types?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "photography_spots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string | null
          filters: Json | null
          id: string
          image_url: string
          typography_data: Json | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          image_url: string
          typography_data?: Json | null
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          image_url?: string
          typography_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          privacy_settings: Json | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id: string
          privacy_settings?: Json | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          privacy_settings?: Json | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      spotlight_chains: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          max_participants: number
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          max_participants?: number
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          max_participants?: number
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          challenge_id: string | null
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          challenge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          challenge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ranks: {
        Row: {
          chains_created: number | null
          challenges_won: number | null
          id: string
          photos_count: number | null
          rank_level: number
          rank_name: string
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chains_created?: number | null
          challenges_won?: number | null
          id?: string
          photos_count?: number | null
          rank_level?: number
          rank_name?: string
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chains_created?: number | null
          challenges_won?: number | null
          id?: string
          photos_count?: number | null
          rank_level?: number
          rank_name?: string
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ranks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          photo_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          photo_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          photo_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_judge_ended_challenges: { Args: never; Returns: undefined }
      is_challenge_member: {
        Args: { _challenge_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
