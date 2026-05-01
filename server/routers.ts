import { TRPCError } from "@trpc/server";
import { z } from "zod";
import crypto from "crypto";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import {
  clearVisitPhoto,
  deleteAllVisits,
  deleteVisit,
  getVisitsForUser,
  updateVisitPhoto,
  upsertVisit,
  upsertUser,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    /** Returns 'pin' when self-hosted (PIN_HASH set), 'oauth' for Manus platform */
    authMode: publicProcedure.query(() => {
      return { mode: ENV.pinHash ? "pin" : "oauth" } as const;
    }),
    /**
     * PIN login for self-hosted deployments.
     * Compares SHA-256(pin) against PIN_HASH env var, issues a local JWT on success.
     */
    pinLogin: publicProcedure
      .input(z.object({ pin: z.string().min(1).max(32) }))
      .mutation(async ({ ctx, input }) => {
        if (!ENV.pinHash) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "PIN login is not configured on this server." });
        }
        const supplied = crypto.createHash("sha256").update(input.pin).digest("hex");
        if (supplied !== ENV.pinHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect PIN" });
        }
        const ownerOpenId = ENV.ownerOpenId || "pin-owner";
        await upsertUser({
          openId: ownerOpenId,
          name: "Owner",
          loginMethod: "pin",
          lastSignedIn: new Date(),
        });
        const token = await sdk.createSessionToken(ownerOpenId, {
          expiresInMs: ONE_YEAR_MS,
          name: "Owner",
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),
  }),

  visits: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getVisitsForUser(ctx.user.id);
    }),

    toggle: protectedProcedure
      .input(z.object({ stationId: z.string(), visited: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (input.visited) {
          return upsertVisit(ctx.user.id, input.stationId);
        } else {
          await deleteVisit(ctx.user.id, input.stationId);
          return null;
        }
      }),

    uploadPhoto: protectedProcedure
      .input(
        z.object({
          stationId: z.string(),
          base64: z.string(),
          mimeType: z.string(),
          filename: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif"];
        if (!allowed.includes(input.mimeType)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported image type" });
        }
        const buffer = Buffer.from(input.base64, "base64");
        if (buffer.byteLength > 20 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Image too large (max 20 MB)" });
        }
        const ext = input.mimeType.split("/")[1] ?? "jpg";
        const key = `station-photos/${ctx.user.id}/${input.stationId}-${nanoid(8)}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await upsertVisit(ctx.user.id, input.stationId);
        await updateVisitPhoto(ctx.user.id, input.stationId, key, url, input.filename);
        return { photoUrl: url, photoKey: key };
      }),

    removePhoto: protectedProcedure
      .input(z.object({ stationId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await clearVisitPhoto(ctx.user.id, input.stationId);
        return { success: true };
      }),

    resetAll: protectedProcedure.mutation(async ({ ctx }) => {
      await deleteAllVisits(ctx.user.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
