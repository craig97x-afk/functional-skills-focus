# Logs and Release Notes

Use this file to keep a light audit trail of changes, incidents, and fixes.

Template
- Date:
- Version/Commit:
- Change summary:
- Impact:
- Follow-ups:
 
 --------------------

- Date: 2026-02-10
- Version/Commit: pending
- Change summary: Fixed mobile nav close behavior, improved shop text contrast, and relaxed login spacing.
- Impact: Mobile menu no longer sticks; shop buttons/labels readable in dark mode; sign-in form has more breathing room.
- Follow-ups: Verify mobile nav close on all routes and shop readability on both themes.

- Date: 2026-02-10
- Version/Commit: pending
- Change summary: Forced shop guide buttons to render white text and improved storage bucket checks.
- Impact: Shop CTAs stay readable across themes; dev checks correctly validate buckets when service role key is present.
- Follow-ups: Confirm bucket warnings clear in the Dev checks after redeploy.

- Date: 2026-02-10
- Version/Commit: pending
- Change summary: Dashboard default widgets limited to core blocks (Account, Quick Actions, Exam Countdowns, Shop).
- Impact: New users see a cleaner dashboard; other widgets remain optional via the picker.
- Follow-ups: None.

- Date: 2026-02-10
- Version/Commit: pending
- Change summary: Guardian access now normalizes names and accepts 4-digit (last-4) codes; header notifications run in parallel and message previews are capped.
- Impact: Fewer guardian login mismatches; header loads faster with less query overhead.
- Follow-ups: Consider adding copy to the guardian form explaining 6-digit vs last-4 code.
- Date: 2026-02-10
- Version/Commit: pending
- Change summary: Renamed Progress dropdown item to Overview and added a Mastery tab on the Progress page.
- Impact: Navigation copy clearer; progress area now links to mastery directly.
- Follow-ups: None.

- Date: 2026-02-12
- Version/Commit: pending
- Change summary: Added an accessibility control widget with reader/support tools and admin quick links on resource pages.
- Impact: Users can self-serve accessibility preferences; admins get faster access to manage resources.
- Follow-ups: Confirm accessibility presets feel right on mobile and adjust defaults if needed.

- Date: 2026-02-12
- Version/Commit: pending
- Change summary: Added a dedicated Accessibility Widget sales page and footer link.
- Impact: Users can discover and purchase the widget from a single landing page.
- Follow-ups: Set NEXT_PUBLIC_WIDGET_BUY_URL to the live checkout link.

- Date: 2026-02-12
- Version/Commit: pending
- Change summary: Moved the accessibility widget purchase link into the widget panel and removed the footer link.
- Impact: Purchase call-to-action now lives inside the widget itself; footer stays clean.
- Follow-ups: None.

- Date: 2026-02-12
- Version/Commit: pending
- Change summary: Capitalized the account role label on the dashboard (Admin/Student).
- Impact: Cleaner, more polished account widget labeling.
- Follow-ups: None.

- Date: 2026-02-16
- Version/Commit: pending
- Change summary: Added admin drag-and-drop ordering for topics, lessons, and worksheets plus bulk worksheet actions and scheduled publishing fields for worksheets/mocks/question sets.
- Impact: Admins can reorder content instantly, batch publish/unpublish/delete, and schedule content to go live without manual intervention.
- Follow-ups: Run the updated SQL in `docs/workbooks.sql` and `docs/exam-resources.sql` to add schedule columns and policy updates.

- Date: 2026-02-16
- Version/Commit: pending
- Change summary: Added media library uploads, worksheet bulk CSV import, worksheet analytics view, version history rollback, and admin audit log with undo.
- Impact: Admins can reuse assets, batch-create worksheets, track usage, roll back file changes, and undo edits from the audit log.
- Follow-ups: Run `docs/media-library.sql`, `docs/admin-audit.sql`, and updated `docs/workbooks.sql` for analytics/version tables.

- Date: 2026-02-16
- Version/Commit: pending
- Change summary: Expanded dashboard resource search coverage, added “View all results” page, and improved broad keyword handling (levels/resources).
- Impact: Search surfaces more results for common student keywords and offers a full results page.
- Follow-ups: None.
