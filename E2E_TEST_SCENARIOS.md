E2E TEST SCENARIOS: /[id]/confirm Page Confirm Guard

Based on the implementation in src/app/[id]/confirm/page.tsx:

1. TEST: Confirmed guest stays on page (no redirect)
   - Navigate to /{id}/confirm with a confirmed guest
   - Expected: Page renders fully with Card, AuroraBackdrop, GuestInvitations, Footer
   - The useEffect guard at line 21-25 should NOT fire because guestData.isConfirmed = true
   - Verification: URL stays as /{id}/confirm, main content is visible

2. TEST: Unconfirmed guest gets redirected after load
   - Navigate to /{id}/confirm with an unconfirmed guest (isConfirmed = false)
   - Expected: After loading completes, useEffect fires and redirects to /{id}
   - The condition: !loading && (error || !findGuest || !guestData.isConfirmed)
   - Verification: URL changes to /{id}, no confirm page content visible

3. TEST: Loading state shows spinner
   - Navigate to /{id}/confirm initially
   - Expected: Loading state renders LoadingSpinner standalone
   - The component checks `if (loading)` at line 27-29 and returns <LoadingSpinner standalone />
   - Verification: Page shows spinner, no UI content yet

4. TEST: Error / unknown guest ID handles gracefully
   - Navigate to /{99999}/confirm with non-existent guest
   - Expected: Either redirects to /{99999} or returns null (empty page)
   - The component checks `if (error || !findGuest || !guestData.isConfirmed)` at line 31-33 and returns null
   - Verification: Page doesn't crash, shows either redirect or empty state

5. TEST: Reduced motion preference
   - With prefers-reduced-motion enabled
   - Expected: The page should still function, AuroraBackdrop falls back to static gradient
   - The AuroraBackdrop component uses useReducedMotion and shows StaticGradient when true
   - Verification: No animation runs, static gradient displayed

6. TEST: Confirm page with assigned card (admin dashboard feature)
   - If guest has assigned card via Firestore assignments collection
   - Expected: The [id] page (not confirm) renders CardRenderer with the assigned card config
   - This is separate from the confirm guard but part of the same flow
   - Verification: Card renders with custom background/effect per the assignment

CODE LOGIC VERIFICATION:
The guard condition at line 22: `if (!loading && (error || !findGuest || !guestData.isConfirmed))`
- Fires when loading is complete AND (there's an error OR guest not found OR guest not confirmed)
- Uses router.replace(`/${params.id}`) - replaces history entry, prevents back-loop
- This is the key behavior all E2E tests should verify

PRE-EXISTING TESTS CLEANUP:
Since this is a re-implementation, ensure no old tests reference the old behavior:
- Remove any tests that expect the old 500 error on /confirm under edge runtime
- Remove tests that don't account for the mounted gate + dynamic import pattern
- Keep only tests that verify the new guard behavior described above