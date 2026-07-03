-- Remove static "Home" header link; logo already links to /.
DELETE FROM "storefront_nav_links"
WHERE "id" = '00000000-0000-0000-0000-00000000e001'
   OR ("href" = '/' AND "zone" = 'header' AND "label" = 'Home');
