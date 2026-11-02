import type { SavedItem, Preferences } from "@/lib/schema";
export type Database = {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          topic: string;
          source_type: string;
          created_at: string;
          updated_at: string;
          payload: SavedItem;
        };
        Insert: {
          id: string;
          user_id: string;
          title: string;
          topic: string;
          source_type: string;
          created_at?: string;
          updated_at?: string;
          payload: SavedItem;
        };
        Update: Partial<Database["public"]["Tables"]["analyses"]["Insert"]>;
        Relationships: [];
      };
      user_preferences: {
        Row: { user_id: string; preferences: Preferences; updated_at: string };
        Insert: {
          user_id: string;
          preferences: Preferences;
          updated_at?: string;
        };
        Update: { preferences?: Preferences; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
