"use client";

import { useState, useRef } from "react";
import { uploadCatalogImage } from "@/app/actions/catalog";
import { useToast } from "@/components/toast";

interface ImageUploadProps {
  productId: string;
  currentPath: string | null;
  onUploaded: () => void;
}

export function ImageUpload({ productId, currentPath, onUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview lokal (data-URL).
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    // Q16-C/Q18: Server Action upload + update DB + rollback orphan + cleanup old.
    const { success, error, path } = await uploadCatalogImage(
      productId,
      file,
      currentPath,
    );
    setUploading(false);

    if (!success) {
      toast(error ?? "Upload gagal.", "error");
      setPreview(null);
    } else {
      toast("Foto diunggah.", "success");
      onUploaded();
      void path;
    }
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
        // data-URL preview, bukan remote image -> eslint-disable (Q18).
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview" className="upload-preview" />
      )}
    </div>
  );
}
