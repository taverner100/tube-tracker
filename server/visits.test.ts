import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db helpers so tests don't need a real database
vi.mock("./db", () => ({
  getVisitsForUser: vi.fn(async () => []),
  upsertVisit: vi.fn(async (_userId: number, stationId: string) => ({
    id: 1,
    userId: _userId,
    stationId,
    photoKey: null,
    photoUrl: null,
    photoFilename: null,
    visitedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  deleteVisit: vi.fn(async () => {}),
  updateVisitPhoto: vi.fn(async () => {}),
  clearVisitPhoto: vi.fn(async () => {}),
  deleteAllVisits: vi.fn(async () => {}),
}));

// Mock S3 storage
vi.mock("./storage", () => ({
  storagePut: vi.fn(async (key: string) => ({
    key,
    url: `https://cdn.example.com/${key}`,
  })),
}));

function makeCtx(): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("visits.list", () => {
  it("returns an empty array when no visits exist", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.visits.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});

describe("visits.toggle", () => {
  it("creates a visit record when visited=true", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.visits.toggle({ stationId: "bak-01", visited: true });
    expect(result).not.toBeNull();
    expect(result?.stationId).toBe("bak-01");
  });

  it("returns null when visited=false", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.visits.toggle({ stationId: "bak-01", visited: false });
    expect(result).toBeNull();
  });
});

describe("visits.uploadPhoto", () => {
  it("rejects unsupported mime types", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.visits.uploadPhoto({
        stationId: "bak-01",
        base64: "aGVsbG8=",
        mimeType: "application/pdf",
        filename: "test.pdf",
      })
    ).rejects.toThrow("Unsupported image type");
  });

  it("accepts a valid jpeg and returns a photo URL", async () => {
    const caller = appRouter.createCaller(makeCtx());
    // 1x1 white JPEG in base64
    const tinyJpeg =
      "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=";
    const result = await caller.visits.uploadPhoto({
      stationId: "bak-01",
      base64: tinyJpeg,
      mimeType: "image/jpeg",
      filename: "harrow.jpg",
    });
    expect(result.photoUrl).toContain("cdn.example.com");
    expect(result.photoKey).toContain("bak-01");
  });
});

describe("visits.removePhoto", () => {
  it("returns success", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.visits.removePhoto({ stationId: "bak-01" });
    expect(result.success).toBe(true);
  });
});

describe("visits.resetAll", () => {
  it("returns success", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.visits.resetAll();
    expect(result.success).toBe(true);
  });
});
