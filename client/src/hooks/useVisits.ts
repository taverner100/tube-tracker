/**
 * useVisits — server-backed visit state.
 * Replaces the old localStorage-only useVisitedStations hook.
 * Requires the user to be logged in (protectedProcedure on the server).
 */
import { useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export type VisitRecord = {
  id: number;
  stationId: string;
  photoKey: string | null;
  photoUrl: string | null;
  photoFilename: string | null;
  visitedAt: Date;
};

export function useVisits() {
  const utils = trpc.useUtils();

  const { data: visits = [], isLoading } = trpc.visits.list.useQuery(undefined, {
    retry: false,
    // Don't refetch on window focus — the user may be offline on mobile
    refetchOnWindowFocus: false,
  });

  // Build a Map<stationId, VisitRecord> for O(1) lookups
  const visitMap = new Map<string, VisitRecord>(
    visits.map((v) => [v.stationId, v as VisitRecord])
  );

  const toggleMutation = trpc.visits.toggle.useMutation({
    onMutate: async ({ stationId, visited }) => {
      await utils.visits.list.cancel();
      const prev = utils.visits.list.getData();
      utils.visits.list.setData(undefined, (old = []) => {
        if (visited) {
          // Optimistically add
          return [
            ...old,
            {
              id: -1,
              userId: -1,
              stationId,
              photoKey: null,
              photoUrl: null,
              photoFilename: null,
              visitedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
        } else {
          // Optimistically remove
          return old.filter((v) => v.stationId !== stationId);
        }
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.visits.list.setData(undefined, ctx.prev);
      toast.error("Failed to update visit. Please try again.");
    },
    onSettled: () => utils.visits.list.invalidate(),
  });

  const uploadPhotoMutation = trpc.visits.uploadPhoto.useMutation({
    onSuccess: () => {
      utils.visits.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to upload photo.");
    },
  });

  const removePhotoMutation = trpc.visits.removePhoto.useMutation({
    onMutate: async ({ stationId }) => {
      await utils.visits.list.cancel();
      const prev = utils.visits.list.getData();
      utils.visits.list.setData(undefined, (old = []) =>
        old.map((v) =>
          v.stationId === stationId
            ? { ...v, photoKey: null, photoUrl: null, photoFilename: null }
            : v
        )
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.visits.list.setData(undefined, ctx.prev);
      toast.error("Failed to remove photo.");
    },
    onSettled: () => utils.visits.list.invalidate(),
  });

  const resetAllMutation = trpc.visits.resetAll.useMutation({
    onSuccess: () => {
      utils.visits.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to reset progress.");
    },
  });

  const toggleStation = useCallback(
    (stationId: string) => {
      const isVisited = visitMap.has(stationId);
      toggleMutation.mutate({ stationId, visited: !isVisited });
    },
    [visitMap, toggleMutation]
  );

  const markAllOnLine = useCallback(
    (stationIds: string[]) => {
      stationIds.forEach((id) => {
        if (!visitMap.has(id)) {
          toggleMutation.mutate({ stationId: id, visited: true });
        }
      });
    },
    [visitMap, toggleMutation]
  );

  const unmarkAllOnLine = useCallback(
    (stationIds: string[]) => {
      stationIds.forEach((id) => {
        if (visitMap.has(id)) {
          toggleMutation.mutate({ stationId: id, visited: false });
        }
      });
    },
    [visitMap, toggleMutation]
  );

  const uploadPhoto = useCallback(
    async (stationId: string, file: File) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          // Strip the data URL prefix to get raw base64
          const base64 = dataUrl.split(",")[1] ?? "";
          uploadPhotoMutation.mutate(
            { stationId, base64, mimeType: file.type, filename: file.name },
            { onSuccess: () => resolve(), onError: reject }
          );
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    [uploadPhotoMutation]
  );

  const removePhoto = useCallback(
    (stationId: string) => {
      removePhotoMutation.mutate({ stationId });
    },
    [removePhotoMutation]
  );

  const resetAll = useCallback(() => {
    resetAllMutation.mutate();
  }, [resetAllMutation]);

  return {
    visitMap,
    isLoading,
    toggleStation,
    markAllOnLine,
    unmarkAllOnLine,
    uploadPhoto,
    removePhoto,
    resetAll,
    isUploading: uploadPhotoMutation.isPending,
  };
}
