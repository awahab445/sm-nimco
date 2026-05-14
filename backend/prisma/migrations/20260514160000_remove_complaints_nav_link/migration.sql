-- Remove legacy "Complaints" header link (/complain) that is not a real storefront page.
DELETE FROM "storefront_nav_links"
WHERE "id" = '00000000-0000-0000-0000-00000000e004'
   OR ("href" = '/complain' AND "zone" = 'header');
