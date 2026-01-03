import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves conflicts", () => {
    const result = cn("px-2", "text-sm", ["px-4", false && "hidden"], { active: true, disabled: false });
    expect(result.split(" ").sort()).toEqual(["px-4", "text-sm", "active"].sort());
  });
});
