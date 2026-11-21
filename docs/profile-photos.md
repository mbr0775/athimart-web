# Profile photos

The account page now supports editing the display name and uploading a JPG,
PNG or WebP photo up to 5 MB for customers and sellers through **Your account**.
Selecting a photo opens an editor with a circular avatar preview. Drag to
reposition, use the zoom and position sliders, rotate in 90-degree steps, or
reset to the original framing. Choose **Use photo** to apply the crop locally,
then **Save profile** to upload it. **Edit crop** reopens the original selected
file before saving. Cancel or Escape leaves the previous selection unchanged.
The browser exports the chosen crop as a 512px square and compresses it before
sending it to the server. The server verifies the
authenticated owner, decodes and re-encodes the photo to a 512px WebP, then
saves the public URL in `public.profiles.avatar_url`. Only `full_name` and
`avatar_url` are written; authentication metadata is not used for permissions.

Uploaded photos take precedence over Google photos. Without a saved photo,
the account and navigation use Google's `avatar_url` / `picture` metadata.
Signing in again does not overwrite a chosen photo. The “Use Google photo”
button restores the provider photo. Missing or failed images show initials.
Successful saves refresh the shared storefront layout, including the desktop
header, mobile profile tab, and account sidebar.

The Home **Shop by seller** card also subscribes to the shared saved profile.
The root supplies the verified account ID so only that seller's own card uses
their current name and photo, including their Google fallback. This avoids stale
home-card props after saving and never matches accounts by display name. Other
sellers and signed-out visitors keep the existing approved-shop directory and
public uploaded-photo lookup. Unsaved crop previews remain confined to the
profile editor; no private profile fields or authentication metadata are exposed
through the public directory.

## Supabase setup

The website is configured for project `rawwckfkugrcodpvvffc`.
Run [sql/profile-avatars.sql](sql/profile-avatars.sql) in **that project's** SQL
Editor. It adds `avatar_url` if missing and creates the public `profile-avatars`
bucket. Users may insert, select and delete only files under their own UUID
folder. Public access is limited to serving the avatar images; the existing
private document buckets are unchanged. Existing profile SELECT/UPDATE
ownership policies must allow the authenticated owner to edit their profile.
The script ends with verification queries to inspect those policies.

On 2026-11-13 the user applied the setup statements manually. All six supplied
verification results passed: avatar column, bucket configuration, profile RLS,
avatar read privilege, name/photo update privileges, and the three Storage
policies. A subsequent request using the website's configured key to
`/auth/v1/settings` returned HTTP 200, confirming that the earlier invalid-key
error is resolved. That response reported Google sign-in disabled. Configure
and enable the Google provider in Supabase before testing Google sign-in.
Do not put a service-role key in any `NEXT_PUBLIC_` variable.

## Verification

Run `node --test tests/profile-identity.test.mjs`, `npm run test:delivery-profile`,
`npm run lint` and `npm run build`.

Verify with an authorized account (enable Google first for steps 1, 3 and 4):

1. Google sign-in shows the Google photo in the profile and both navigation views.
2. Save a display name and uploaded photo; account and navigation update together.
3. Refresh, sign out, and sign in with Google again; the chosen photo remains.
4. Choose “Use Google photo” and save; the Google photo appears again.
5. Invalid files are rejected; a failed save preserves the previous photo.
6. A second user cannot upload or delete files in the first user's folder.
7. On customer and seller accounts, choose portrait and landscape photos;
   drag, zoom, rotate and reset. Confirm the applied avatar matches the preview.
8. Reopen **Edit crop** and confirm the framing is retained. Adjust it and cancel
   with the button or Escape; the previously applied preview must remain.
9. On a narrow mobile screen, drag with touch and reach all editor controls.
   With a keyboard, adjust all three sliders and confirm focus returns to
   **Change photo** when the editor closes.

No real customer accounts or profile records were changed during local tests.

## Upload integrity fix

A reported save failure was traced to a saved URL whose public object returned
HTTP 200 and `image/webp`, but contained corrupted bytes and could not be decoded.
Uploads now use a WebP Blob so the Storage SDK sends multipart form data. Before
updating the profile, the server downloads the new object with the user's session
and checks that its bytes exactly match the encoded photo. Failed verification
removes only the new object and leaves the previous profile photo unchanged.
An existing damaged image must be selected and uploaded again.

Regression tests exercise the installed Storage SDK's multipart serialization,
WebP decoding, and rejection of corrupted or unreadable uploaded files.
