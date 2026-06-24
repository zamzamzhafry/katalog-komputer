import { test } from "node:test";
import assert from "node:assert/strict";
import { convertDriveLink } from "./drive.ts";

test("convertDriveLink: empty -> placeholder", () => {
  assert.equal(
    convertDriveLink(""),
    "https://placehold.co/1200x800?text=No+Photo",
  );
});

test("convertDriveLink: file/view URL -> thumbnail", () => {
  const url = "https://drive.google.com/file/d/1AX7srz6AbtMb15tgGJ7XXrI2_P4CBStf/view?usp=drive_link";
  assert.equal(
    convertDriveLink(url),
    "https://drive.google.com/thumbnail?id=1AX7srz6AbtMb15tgGJ7XXrI2_P4CBStf&sz=w1200",
  );
});

test("convertDriveLink: non-drive passthrough", () => {
  const url = "https://example.com/image.jpg";
  assert.equal(convertDriveLink(url), url);
});
