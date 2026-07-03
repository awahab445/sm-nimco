-- Seed product descriptions for live deployment.
-- Matches products by SKU so IDs do not need to be identical across environments.
-- Safe to re-run: overwrites description fields for the listed SKUs only.

UPDATE "products"
SET
  "description" = '"Euro Fruity Soap — Burst of Natural Orange Freshness"
Experience an instant burst of citrus rejuvenation with Euro Fruity Soap. Enriched with premium natural orange extracts, this refreshing formula washes away impurities while charging your skin with vital antioxidants. Its vibrant, natural fragrance combats dullness and odor, leaving you feeling active, crisp, and clean after every shower.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-001'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Tibet Deluxe — Classic Care, Extra Creamy Fragrance"
Classic care with an extra creamy fragrance! Enriched with deep-moisturizing agents to leave your skin soft, smooth, and refreshed all day long.Give your skin the time-tested nourishing care it truly deserves. Tibet Deluxe Beauty Soap features a signature extra creamy formula that gently cleanses without stripping away your skin’s natural moisture. Specially crafted for daily use, its rich lather and luxurious, timeless fragrance keep you feeling crisp, clean, and completely rejuvenated after every wash.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-002'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Refresh & Protect: Three Scents, One Powerful Defense — Antibacterial and Gentle"
Shield your family with the ultimate combination of protection and care using the M. Essa Chemical Hand Wash Collection. Specially engineered to offer premium antibacterial defense, this formula eliminates everyday pathogens on contact while nourishing your skin. Perfect for regular use, it keeps hands incredibly soft, smooth, and revitalized without causing dry patches or irritation.
Long-Lasting Fine Fragrances: Offers a selection of premium, captivating aromatic variations that keep your hands feeling fresh for hours.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-003'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Unveil Your Natural Glow — Ultra Creamy Complexion Care"
Indulge in the luxurious care of Viva Beauty Soap. Formulated to provide deep structural hydration, this premium beauty bar builds into a rich, creamy lather that gently purifies without stripping away your skin''s essential protective oils. Infused with a delicate, captivating fragrance, it transforms your daily routine into a refreshing spa-like experience.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-004'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Unbeatable Brightness, Captivating Scent — Discover the New Khaleej Special Soap."
Bring premium export quality into your daily laundry routine with Khaleej Special Soap. Formulated by M. Essa Chemicals, this premium soap bar pairs rigorous deep-cleaning power with an unforgettable, refreshing floral aroma. It actively targets fabric dullness, working deeply within threads to release trapped particles and restore an immaculate, bright-as-new look to your laundry.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-005'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Unmatched Cleaning Power — Discover the Misaal Horizontal Strength."
Set a new example of pure cleanliness with Misaal Laundry Soap. Crafted utilizing our signature high-density processing, this unique laundry bar provides unrivaled horizontal structural integrity, meaning it won''t dissolve quickly or turn mushy in your soap dish. It works rapidly to strip grime away during bucket or hand washes, keeping your white linens crisp and colored garments completely striking.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-006'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Powerful Brightness For Fabrics — Feel the Fatty Difference!"
Experience industrial-grade fabric stain extraction with Fatty Brown Laundry Soap by M. Essa Chemicals. Engineered with an advanced stain-lifting matrix, this heavy-duty laundry bar cuts deeply into thick collars, cuffs, grease marks, and embedded dirt without degrading the core fabric fibers. Its long-lasting formula ensures maximum usability, providing excellent economy for everyday household laundry.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-007'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Scent Your Sanctuary: Unlock Your Bathroom’s True Fragrance"
Transform your home environment with the premium Perfume Phenyl Collection by M. Essa Chemicals. Specially crafted to target tough bathroom odors, dampness, and surface grime, this advanced multi-surface formula goes beyond standard cleaning to deeply sanitize your floors while infusing the air with an exquisite, long-lasting luxury fragrance. Perfect for marble, ceramic tiles, and washroom surfaces, it gives you a pristine clean you can see and a refreshing aroma you can instantly feel.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-008'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Thick Power Gel: Kills Germs, Removes Rust, No Unpleasant Smell"
Keep your bathroom spotless and thoroughly sanitized with M. Essa Chemicals Toilet Bowl Cleaner. Engineered with an advanced Thick Power Gel formula, it clings strongly to vertical porcelain surfaces to break down stubborn scale and stains without scrubbing. Unlike harsh alternatives, it sanitizes completely while eliminating bad odors, leaving behind a completely fresh, clean atmosphere.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-009'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Strong Tile Wash Power! Antibacterial, Removes Stains, Deep Disinfect Action"
Restore the pristine, sparkling look of your floors and walls with M. Essa Chemicals Tile Wash. This heavy-duty, high-performance cleaning solution targets deeply embedded dirt, grease, and discoloration on tiled surfaces. Perfect for bathrooms, kitchens, and living areas, its defensive antibacterial formula purifies surfaces to keep your home healthy, germ-free, and immaculately bright.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-010'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Bleach Strong: Your Ultimate Clean. 99.9% Germ-Free & Powerful Stain Removal."
Your ultimate clean! Kills 99.9% of germs and provides powerful stain removal for immaculate whites and pristine, disinfected surfaces.Whether it''s restoring the brilliant shine of your white fabrics or maintaining a perfectly disinfected home, M. Essa Chemicals Bleach Strong delivers industrial-grade performance. This advanced formulation targets and breaks down the toughest organic stains, bringing back original fabric brightness while remaining completely fabric-safe.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-011'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Redefining Cleanliness: Unmatched Clarity. Streaks Gone."
Restore complete visibility and crystalline reflection to your home with Clean 360 Glass Cleaner by M. Essa Chemicals. Engineered to act rapidly on hard-to-clean glass frames, it effortlessly dissolves stubborn grease films, fingerprints, smudge paths, and water drops. Its specialized anti-fogging shield guarantees a long-lasting clarity that elevates regular maintenance windows with minimal manual wiping.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-012'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Sparkling Deep Cleaning Power — Ultimate Antibacterial Surface Protection"
Protect your home and restore absolute clarity to your living space with Panda Perfume Phenyl by M. Essa Chemicals. This advanced cross-functional disinfectant floor wash cuts through thick grease tracks, dirt films, and sticky residues while wiping away hidden pathogens on contact. Ideal for marble, tile, and stone surfaces, it leaves behind a streak-free gloss and an amazing premium scent.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-013'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Redefining Whiteness: The Liquid Neel Stronghold. For Sparkling Whiteness, Streaks Gone."
Revitalize your dull fabrics using Panda Liquid Neel by M. Essa Chemicals. This extra strong laundry blue treatment features an ultra-concentrated formula that safely counters fabric yellowing. It disperses evenly across deep water buckets to treat white school uniforms, linens, and cotton items, delivering a bright finish without leaving patchy blue streaks or color spots.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-014'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = 'One Consumes, All Eliminate — Fast and Guaranteed Eradication!"
The ultimate defense against cockroaches! An advanced domino-effect formula engineered for rapid elimination and complete eradication of pests from their nests.
Are you tired of persistent cockroach infestations disrupting your kitchen and home? M. Essa Chemicals introduces Warrior Cockroach Killer Gel, your premium line of defense against stubborn pests. This high-efficacy gel contains an advanced attractant formula that draws cockroaches out from their deepest hiding spots. Once a single cockroach consumes the gel, it carries the active ingredient back to the nest, destroying the entire colony through a powerful chain reaction.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-015'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Redefining Cleanliness: The Bleach Stronghold — Extra Strong Liquid for Natural Freshness & Sanitation."
Achieve the ultimate standard of heavy-duty deep purification with Clean 360 Bleach Extra Strong by M. Essa Chemicals. This commercial-grade, multi-purpose liquid bleach delivers intense stain elimination and multi-surface purification. It effortlessly restores stained fabrics while working as a high-potency sanitizer for non-porous bathroom floors, kitchen countertops, and drainage pipes.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-016'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Powerful Formula, Redefined Clean — From Floor to Drain: Your Complete Solution"
Simplify your home maintenance with Clean 360 Sweep-O by M. Essa Chemicals. This advanced, heavy-duty liquid agent functions as an all-in-one tile and floor cleaner, toilet sanitizer, and powerful drain opener. It dissolves tough organic blockages in your pipes while cutting through thick grout stains and floor grime, delivering deep disinfection and a sparkling finish wherever it is applied.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-017'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Redefining Kitchen Hygiene: Unmatched Grease Power. Gentle On Skin."
Upgrade your daily kitchen sanitation with the M. Essa Dish Wash Liquid Collection. Formulated to streamline washing routines, this highly concentrated fluid attacks thick fat deposits, oily cooking glazes, and dried residues immediately upon contact. Its quick-rinsing chemical structure prevents soapy residues from binding to your high-end cutlery, guaranteeing sparkling finishes.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-018'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Redefining Kitchen Hygiene: The Super Sony Stronghold"
Bring unmatched grease-cutting power to your kitchen with the Super Sony Lemon Dishwash Bar. Formulated by M. Essa Chemicals, this highly effective dishwashing bar cuts through stubborn oil, baked-on grease, and tough food residues instantly, ensuring your plates and cookware shine brighter. Packed with natural citrus properties, it thoroughly sanitizes your dishes while remaining completely gentle on your hands.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-019'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Tough on Grease, Gentle on Hands — Unrivaled Kitchen Cleaning Power"
Master your kitchen cleanup with 777 Sony Dish Wash Soap by M. Essa Chemicals. Engineered with an ultra-concentrated grease-cutting formulation, this premium dishwashing bar slices through dried-on food particles, heavy cooking oils, and stubborn burnt marks instantly. It sheets water away cleanly to prevent unsightly water spots on your premium cutlery.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-020'
  AND "deleted_at" IS NULL;

UPDATE "products"
SET
  "description" = '"Industrial Strength Scouring Power — Rust-Resistant & Heavy Duty"
Conquer the absolute toughest scrubbing challenges with the M. Essa Chemicals Heavy Duty Steel Scourer. Woven securely from premium-grade, rust-resistant stainless steel mesh strands, this high-performance scrub pad removes char, heavy carbon crusts, and baked-on grease residues from cast iron, ovens, and grills with minimal effort.',
  "short_description" = NULL,
  "updated_at" = NOW()
WHERE "sku" = 'SKU-021'
  AND "deleted_at" IS NULL;
