- [ ] Replace the demo SMTP/OTP flow with real email delivery and persistent verification tokens; make resend send a verification email/code instead of using forgot-password. 
- [ ] Add route tests for likes, messages, and matches (60/69 route tests completed)
    - likes route: POST with auth/access control
    - messages route: GET/POST with match participant checks  
    - matches route: GET with filtering, POST with match creation

---

## Backend Review Action Items

- [x] Fix `apps/backend/src/messages/route.ts` to remove inconsistent route parameter usage and ownership checks.
    - GET `/messages/:id` currently validates `params.id` and `query.matchId` together, but uses mismatched semantics.
    - POST `/messages/:id/read` should use the message ID to mark the correct message and validate message/match membership.
- [x] Remove stale `// TODO: add cors plugin` comment from `apps/backend/src/index.ts` now that CORS is configured.
- [x] Clarify `/profiles/:id` access semantics versus `/profiles/me` and ensure non-admin users cannot access unauthorized profiles.
- [x] Add pagination support to `apps/backend/src/user/model.ts` listUsers and update corresponding user list route behavior.
- [x] Optimize `apps/backend/src/discovery/matching.ts` to reduce database queries and avoid loading all candidate/interests state in-memory.
- [ ] Review `apps/backend/src/profiles/schema.ts` and consider whether profile fields should be merged into the user meta table.
- [ ] Confirm the interest model design in `apps/backend/src/interests/schema.ts` and whether a dedicated interests table is necessary.
- [ ] Validate whether `apps/backend/src/interests/model.ts` still needs `createInterest` or if interest management should be removed/refactored.
- [x] Review `apps/backend/src/likes/model.ts` `getMutualLikes` query shape and return types for consumer alignment.
- [x] Update `API_ROUTES.md` and backend docs.
- [ ] Fix ALL backend tests since they're terribly outdated.