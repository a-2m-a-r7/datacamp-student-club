# Effective roles and permissions

The supported database roles are user and admin; the UI calls these member and super_admin. This audit preserves the existing two-role product. Names such as hr, editor, event_manager, content_manager and club_leader are not independent implemented permission sets. Legacy capability labels must not be treated as separate authorization.

| Identity | Allowed behavior | Denied behavior |
|---|---|---|
| Visitor | Published courses/lessons, public club content and safe event projection; certificate/member-card verification; published anonymous forms when enabled; public compiler/chat subject to configured providers | Private profiles/directory, membership progress, administrative writes and server-only jobs |
| Active confirmed member | Own profile/photo, enrollment/progress, earned credentials, event registration, own notification reads, permitted forms, project proposals | Club member search/list; other private accounts/responses; role/status/XP forgery; administrator APIs; other avatar overwrite |
| Active confirmed administrator | Club administration, member directory and role operations through guarded workflows, forms/responses, moderation, scanner, settings and server endpoints | Reading server OAuth/upload/analysis secrets through the public Data API; treating editable Auth user metadata as authority |
| Unconfirmed/inactive/deleted identity | Authentication/verification/recovery routes and public content as applicable | Administrator privileges; active-account RPCs check their specific contract |

Profile privileges derive from persisted records, not user_metadata. The database is_admin() joins Auth confirmation and active status. Server authorizeAdmin validates the real user token. Requested negative variants and each RPC's exact behavior are recorded in the final matrix; this document does not assert all variants passed.

Email/password changes use emailed confirmation/recovery links. There is no typed OTP product interface. Quiz solutions are visible educational practice data, not a proctored assessment secret.
