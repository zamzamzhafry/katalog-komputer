"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  productId: string;
  currentPath: string | null;
  onUploaded: (newPath: string) => void;
}

export function ImageUpload({ productId, currentPath, onUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const supabase = createClient();

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = "products/" + productId + "." + ext;

    const { error } = await supabase.storage
      .from("catalog-images")
      .upload(storagePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      alert("Upload gagal: " + error.message);
      setPreview(null);
    } else {
      // Update the catalog item image_path
      await supabase
        .from("catalog_items")
        .update({ image_path: storagePath })
        .eq("product_id", productId);

      onUploaded(storagePath);
    }
    setUploading(false);
  }

  return (
    <div className="image-upload">
      <button
        className="btn-upload"
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Foto"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        style={{ display: "none" }}
      />
      {preview && (
        <img src={preview} alt="Preview" className="upload-preview" />
      )}
    </div>
  );
}
