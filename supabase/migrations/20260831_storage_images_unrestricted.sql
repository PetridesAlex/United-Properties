-- Allow broader image uploads for property media (HEIC, AVIF, etc.) and larger files.
update storage.buckets
set
  file_size_limit = 52428800, -- 50 MB
  allowed_mime_types = null   -- no MIME whitelist; accept any image the client sends
where id in ('properties', 'site-assets');
