import { test } from "node:test";
import assert from "node:assert/strict";
import { getImageUrl } from "./image-url.ts";

const BASE = "https://demo.supabase.co/storage/v1/object/public/catalog-images/";

test("getImageUrl: image_path + env -> storage URL", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
  assert.equal(
    getImageUrl({ image_path: "products/LAP-001.jpg", foto_url: null }),
    `${BASE}products/LAP-001.jpg`,
  );
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
});

test("getImageUrl: no env, foto_url -> foto_url (legacy)", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  assert.equal(
    getImageUrl({ image_path: "products/x.jpg", foto_url: "https://drive.google.com/x" }),
    "https://drive.google.com/x",
  );
});

test("getImageUrl: nothing -> placeholder", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  assert.equal(
    getImageUrl({ image_path: null, foto_url: null }),
    "https://placehold.co/1200x800?text=No+Photo",
  );
});

test("getImageUrl: env set, no image_path, has foto_url -> foto_url", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
  assert.equal(
    getImageUrl({ image_path: null, foto_url: "https://legacy.com/x.jpg" }),
    "https://legacy.com/x.jpg",
  );
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
});
