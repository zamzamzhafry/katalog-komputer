export type Database = {
  public: {
    Tables: {
      catalog_items: {
        Row: {
          id: string;
          product_id: string;
          kategori: string;
          brand: string;
          model: string;
          processor: string | null;
          ram: string | null;
          storage: string | null;
          harga: string;
          harga_number: number | null;
          stok: number;
          foto_url: string | null;
          image_path: string | null;
          deskripsi: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          kategori: string;
          brand: string;
          model: string;
          processor?: string | null;
          ram?: string | null;
          storage?: string | null;
          harga?: string;
          harga_number?: number | null;
          stok?: number;
          foto_url?: string | null;
          image_path?: string | null;
          deskripsi?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          kategori?: string;
          brand?: string;
          model?: string;
          processor?: string | null;
          ram?: string | null;
          storage?: string | null;
          harga?: string;
          harga_number?: number | null;
          stok?: number;
          foto_url?: string | null;
          image_path?: string | null;
          deskripsi?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
