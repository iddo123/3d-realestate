import { describe, it, expect, afterEach } from "vitest";
import { resolveScanUrl } from "../lib/scanUrl";

const ORIGINAL = process.env.NEXT_PUBLIC_SCAN_BASE_URL;
afterEach(() => {
  process.env.NEXT_PUBLIC_SCAN_BASE_URL = ORIGINAL;
});

describe("resolveScanUrl", () => {
  it("returns undefined for an empty value (falls back to sample)", () => {
    expect(resolveScanUrl(undefined)).toBeUndefined();
    expect(resolveScanUrl("")).toBeUndefined();
  });

  it("passes through a full URL unchanged", () => {
    const url = "https://abc.supabase.co/storage/v1/object/public/scans/m.ksplat";
    expect(resolveScanUrl(url)).toBe(url);
  });

  it("passes through a local /public path unchanged", () => {
    expect(resolveScanUrl("/scans/Model.ply")).toBe("/scans/Model.ply");
  });

  it("joins a bare filename with the configured base", () => {
    process.env.NEXT_PUBLIC_SCAN_BASE_URL =
      "https://abc.supabase.co/storage/v1/object/public/scans";
    expect(resolveScanUrl("model.ksplat")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/scans/model.ksplat"
    );
  });

  it("trims a trailing slash on the base when joining", () => {
    process.env.NEXT_PUBLIC_SCAN_BASE_URL =
      "https://abc.supabase.co/storage/v1/object/public/scans/";
    expect(resolveScanUrl("model.ksplat")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/scans/model.ksplat"
    );
  });

  it("returns undefined for a bare filename when no base is configured", () => {
    delete process.env.NEXT_PUBLIC_SCAN_BASE_URL;
    expect(resolveScanUrl("model.ksplat")).toBeUndefined();
  });
});
