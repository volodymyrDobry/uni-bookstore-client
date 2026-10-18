import {ApiError} from "./apiUtils.ts";

export function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

export function hasStatus(error: unknown, status: number): boolean {
    return error instanceof ApiError && error.status === status;
}
