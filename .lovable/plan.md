Update `src/pages/Community.tsx` so the Feed/Featured/Recent grid stacks as one column on mobile and switches to the 3-column layout from the `md` breakpoint up (instead of `lg`).

Change the grid classes from `grid gap-6 lg:grid-cols-[1.4fr_1fr_1fr]` to `grid grid-cols-1 gap-6 md:grid-cols-[1.4fr_1fr_1fr]`.

No other layout, content, or styling changes.