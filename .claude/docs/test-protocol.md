# Test Protocol — NeonDash

> Tier 3 doc. Spec-first testing methodology.
> Load when writing new tests, refactoring tested code, or before implementing PRD acceptance criteria.

---

## Rule

Tests are written **before** implementation, derived directly from PRD acceptance criteria. A passing test must fail on the previous (pre-implementation) state — otherwise it is not testing the new behavior.

---

## Process (4 steps)

1. **Read acceptance criteria** from the PRD (`.claude/docs/prd-*.md` or `docs/PLAN-*.md`)
2. **Write a failing test** — one test per AC bullet, named after the AC phrase
3. **Implement** until the test passes — no more, no less (avoid scope creep)
4. **Run** `bun run test` — all tests green, then run the full commit protocol

---

## File Locations

| Surface | Location | Runner |
|---|---|---|
| Backend unit/integration | `apps/api/src/**/*.test.ts` | Vitest |
| Frontend components | `apps/web/src/**/*.test.tsx` | Vitest + Testing Library |
| E2E flows | `apps/web/e2e/**/*.spec.ts` | Playwright |

Existing Vitest setup files: `apps/api/src/test/setup.ts`, `apps/web/src/test/setup.ts`.

---

## tRPC Router Test Template

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext, TrpcUser } from "../../_core/context";
import { appRouter } from "../../routers";

// Helper to create a typed context for the caller
function createContext(
  role: "user" | "admin" = "user",
  mentoradoId: number | null = 1,
): TrpcContext {
  const user: TrpcUser = {
    id: 1,
    clerkId: "user_1",
    role,
    email: "test@test.com",
    name: "Test User",
  };
  return {
    user,
    mentorado: mentoradoId ? { id: mentoradoId } : null,
    req: new Request("http://localhost/test"),
    resHeaders: new Headers(),
  };
}

describe("exampleRouter.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns items scoped to the current mentorado", async () => {
    const ctx = createContext("user", 1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.example.list();

    expect(result).toHaveLength(2);
    expect(result.every((item) => item.mentoradoId === 1)).toBe(true);
  });

  it("throws UNAUTHORIZED when no session is present", async () => {
    const ctx = createContext("user", null);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.example.list()).rejects.toThrow(/UNAUTHORIZED/);
  });
});
```

---

## React Component Test Template

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "@/components/ui/button";

describe("<Button>", () => {
  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button", { name: /click me/i }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick} disabled>Click me</Button>);
    await user.click(screen.getByRole("button", { name: /click me/i }));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

---

## Forbidden Patterns

- **NEVER** write `test('it works', () => expect(true).toBe(true))` or similar smoke-only tests
- **NEVER** test implementation details (internal state, private methods) — test behavior via public API
- **NEVER** write tests that pass only because of the current (possibly wrong) implementation — the test must encode the *intended* behavior from the AC
- **NEVER** mock the database layer when an integration test hitting a real test DB is feasible
- **NEVER** use `any` in test files — the type discipline from `.claude/rules/backend.md` applies here too
- **NEVER** leave `.only` / `.skip` modifiers committed — CI should run the full suite
