-- Seed: placeholder Product Detail Page (PDP) content for the 7 catalog SKUs
-- (Phase 1, feature 2 — product detail page).
--
-- The feature-1 catalog seed only populated name/tagline/rating/pack_tiers.
-- This fills the PDP-only columns so the detail page renders fully:
--   description, ingredients, bioactives, science_html, faqs,
--   who_for, who_not_for, badges.
--
-- ALL COPY HERE IS PLACEHOLDER, pending Avesthagen sign-off. It is written in
-- structure/function language ONLY ("supports", "helps maintain", "contributes
-- to") — no "cures/treats/prevents disease" claims, per conventions.md. The PDP
-- renders a visible "placeholder copy" notice so this is never mistaken for
-- final, approved claims.
--
-- `images` is intentionally left empty — real product photography is wired in
-- as separate future work; the gallery falls back to the type placeholder.
-- `reviews` is intentionally NOT seeded — the PDP shows an empty state rather
-- than fabricating testimonials.
--
-- Idempotent: plain UPDATEs keyed by slug; re-running overwrites with the same
-- values. Non-destructive (no drop/truncate/delete).
-- Rollback (run manually if needed) is documented at the bottom.

-- Badges shared by every SKU (placeholder trust marks).
-- Stored as a jsonb string array: ['FSSAI','Clinically tested','GMP','Secure checkout'].

-- 1. Daily Electrolyte (hydration) ------------------------------------------------
update products set
  description = 'A daily electrolyte mix with a glucose-optimised ratio, formulated to support everyday hydration and replace what routine activity depletes.',
  ingredients = '[
    {"name":"Sodium (as sodium citrate)","amount":"500","unit":"mg"},
    {"name":"Potassium (as potassium chloride)","amount":"300","unit":"mg"},
    {"name":"Magnesium","amount":"60","unit":"mg"},
    {"name":"Glucose","amount":"2","unit":"g"},
    {"name":"Vitamin C","amount":"40","unit":"mg"}
  ]'::jsonb,
  bioactives = '[
    {"name":"Sodium","role":"Supports fluid balance and water uptake","evidence_url":"https://example.org/research/electrolytes-hydration"},
    {"name":"Potassium","role":"Contributes to normal electrolyte balance","evidence_url":"https://example.org/research/potassium-balance"},
    {"name":"Magnesium","role":"Supports normal muscle function","evidence_url":"https://example.org/research/magnesium-muscle"}
  ]'::jsonb,
  science_html = '<p>Hydration is more than water. A balanced ratio of sodium, potassium and glucose supports how quickly fluid is taken up and retained.</p><ul><li>Sodium and glucose work together to support water uptake.</li><li>Potassium and magnesium contribute to normal electrolyte balance.</li></ul><p>Formulated and tested in-house. Linked references are placeholders pending review.</p>',
  faqs = '[
    {"q":"How do I use it?","a":"Mix one sachet into 250-300 ml of water, once daily or around activity."},
    {"q":"Can I take it every day?","a":"Yes — it is formulated for daily use as part of a balanced diet and adequate fluid intake."},
    {"q":"Is it vegetarian?","a":"Yes, the formulation is vegetarian."}
  ]'::jsonb,
  who_for = 'People looking to support everyday hydration — active routines, warm weather, or simply not drinking enough plain water.',
  who_not_for = 'Not a substitute for a balanced diet. If you are pregnant, nursing, or managing a medical condition, consult a healthcare professional first.',
  badges = '["FSSAI","Clinically tested","GMP","Secure checkout"]'::jsonb
where slug = 'daily-electrolyte';

-- 2. Energy Electrolyte (hydration + energy) -------------------------------------
update products set
  description = 'Electrolytes paired with a B-complex blend, formulated to support hydration and normal energy-yielding metabolism through the day.',
  ingredients = '[
    {"name":"Sodium (as sodium citrate)","amount":"450","unit":"mg"},
    {"name":"Potassium","amount":"300","unit":"mg"},
    {"name":"Vitamin B3 (Niacin)","amount":"16","unit":"mg"},
    {"name":"Vitamin B6","amount":"1.4","unit":"mg"},
    {"name":"Vitamin B12","amount":"2.5","unit":"mcg"}
  ]'::jsonb,
  bioactives = '[
    {"name":"B-complex vitamins","role":"Contribute to normal energy-yielding metabolism","evidence_url":"https://example.org/research/b-vitamins-metabolism"},
    {"name":"Sodium","role":"Supports fluid balance","evidence_url":"https://example.org/research/electrolytes-hydration"},
    {"name":"Vitamin B12","role":"Supports reduction of tiredness and fatigue","evidence_url":"https://example.org/research/b12-fatigue"}
  ]'::jsonb,
  science_html = '<p>B-vitamins are cofactors in the pathways that release energy from food. Pairing them with electrolytes supports both hydration and normal energy metabolism.</p><ul><li>B3, B6 and B12 contribute to normal energy-yielding metabolism.</li><li>Sodium and potassium support fluid and electrolyte balance.</li></ul><p>Linked references are placeholders pending review.</p>',
  faqs = '[
    {"q":"When is the best time to take it?","a":"Many people use it in the morning or before activity. Mix one sachet into 250-300 ml of water."},
    {"q":"Does it contain caffeine?","a":"No. The energy support comes from B-vitamins involved in normal metabolism, not stimulants."},
    {"q":"Can I take it daily?","a":"Yes, it is formulated for daily use alongside a balanced diet."}
  ]'::jsonb,
  who_for = 'People with active or demanding days who want hydration plus support for normal energy metabolism — without caffeine.',
  who_not_for = 'Not a substitute for sleep or a balanced diet. If you are pregnant, nursing, or sensitive to B-vitamins, consult a healthcare professional first.',
  badges = '["FSSAI","Clinically tested","GMP","Secure checkout"]'::jsonb
where slug = 'energy-electrolyte';

-- 3. Immunity Hydration (hydration + immunity) -----------------------------------
update products set
  description = 'A hydration mix with vitamin C and zinc, formulated to support hydration while helping maintain normal immune function.',
  ingredients = '[
    {"name":"Sodium (as sodium citrate)","amount":"450","unit":"mg"},
    {"name":"Potassium","amount":"280","unit":"mg"},
    {"name":"Vitamin C","amount":"80","unit":"mg"},
    {"name":"Zinc","amount":"10","unit":"mg"}
  ]'::jsonb,
  bioactives = '[
    {"name":"Vitamin C","role":"Supports the normal function of the immune system","evidence_url":"https://example.org/research/vitamin-c-immunity"},
    {"name":"Zinc","role":"Contributes to normal immune function","evidence_url":"https://example.org/research/zinc-immunity"},
    {"name":"Electrolytes","role":"Support fluid balance","evidence_url":"https://example.org/research/electrolytes-hydration"}
  ]'::jsonb,
  science_html = '<p>Vitamin C and zinc are well-studied micronutrients involved in the normal functioning of the immune system. Delivered in a hydrating base, they support daily resilience.</p><ul><li>Vitamin C supports normal immune function and is an antioxidant.</li><li>Zinc contributes to normal immune function.</li></ul><p>Linked references are placeholders pending review.</p>',
  faqs = '[
    {"q":"How do I use it?","a":"Mix one sachet into 250-300 ml of water, once daily."},
    {"q":"Can I take it with other supplements?","a":"Generally yes, but check total zinc and vitamin C intake across your supplements."},
    {"q":"Is it vegetarian?","a":"Yes, the formulation is vegetarian."}
  ]'::jsonb,
  who_for = 'People who want to support hydration and help maintain normal immune function as part of a daily routine.',
  who_not_for = 'Not a substitute for a balanced diet or medical care. If you are pregnant, nursing, or managing a condition, consult a healthcare professional first.',
  badges = '["FSSAI","Clinically tested","GMP","Secure checkout"]'::jsonb
where slug = 'immunity-hydration';

-- 4. Immunity Gummy (gummy + immunity) -------------------------------------------
update products set
  description = 'A daily gummy with vitamin C, vitamin D3 and zinc, formulated to help maintain normal immune function.',
  ingredients = '[
    {"name":"Vitamin C","amount":"40","unit":"mg"},
    {"name":"Vitamin D3","amount":"400","unit":"IU"},
    {"name":"Zinc","amount":"5","unit":"mg"}
  ]'::jsonb,
  bioactives = '[
    {"name":"Vitamin C","role":"Supports normal immune function","evidence_url":"https://example.org/research/vitamin-c-immunity"},
    {"name":"Vitamin D3","role":"Contributes to normal immune function","evidence_url":"https://example.org/research/vitamin-d-immunity"},
    {"name":"Zinc","role":"Contributes to normal immune function","evidence_url":"https://example.org/research/zinc-immunity"}
  ]'::jsonb,
  science_html = '<p>Three micronutrients with established roles in immune function, in a convenient daily gummy.</p><ul><li>Vitamins C and D3 both contribute to normal immune function.</li><li>Zinc contributes to normal immune function and to the protection of cells from oxidative stress.</li></ul><p>Linked references are placeholders pending review.</p>',
  faqs = '[
    {"q":"How many gummies per day?","a":"One gummy daily, or as directed on the pack."},
    {"q":"Is there added sugar?","a":"The gummies use a balanced sweetening system; see the pack for full nutrition information."},
    {"q":"Are they suitable for vegetarians?","a":"Yes, these gummies are vegetarian."}
  ]'::jsonb,
  who_for = 'Adults who prefer a gummy format and want daily support for normal immune function.',
  who_not_for = 'Not intended for children except as directed. Do not exceed the recommended daily intake. If pregnant or nursing, consult a healthcare professional first.',
  badges = '["FSSAI","Clinically tested","GMP","Secure checkout"]'::jsonb
where slug = 'immunity-gummy';

-- 5. Sleep Gummy (gummy + sleep) -------------------------------------------------
update products set
  description = 'A calming gummy with magnesium and L-theanine, formulated to support relaxation as part of a healthy wind-down routine.',
  ingredients = '[
    {"name":"Magnesium","amount":"60","unit":"mg"},
    {"name":"L-theanine","amount":"100","unit":"mg"},
    {"name":"Vitamin B6","amount":"1.4","unit":"mg"}
  ]'::jsonb,
  bioactives = '[
    {"name":"Magnesium","role":"Contributes to normal psychological function","evidence_url":"https://example.org/research/magnesium-relaxation"},
    {"name":"L-theanine","role":"An amino acid studied for its role in relaxation","evidence_url":"https://example.org/research/l-theanine-relaxation"},
    {"name":"Vitamin B6","role":"Contributes to normal nervous system function","evidence_url":"https://example.org/research/b6-nervous-system"}
  ]'::jsonb,
  science_html = '<p>A gentle, non-habit-forming blend to support a calm wind-down — no melatonin.</p><ul><li>Magnesium contributes to normal psychological and nervous system function.</li><li>L-theanine is widely studied for its role in supporting relaxation.</li></ul><p>Linked references are placeholders pending review.</p>',
  faqs = '[
    {"q":"When should I take it?","a":"Around 30-45 minutes before bed, as part of a consistent wind-down routine."},
    {"q":"Will it make me drowsy the next day?","a":"It contains no melatonin or sedatives. It is formulated to support relaxation, not to force sleep."},
    {"q":"Is it habit-forming?","a":"No, the ingredients are not habit-forming."}
  ]'::jsonb,
  who_for = 'People who want gentle, non-habit-forming support for a relaxing evening routine.',
  who_not_for = 'Not intended to treat sleep disorders. If you have a diagnosed sleep condition, are pregnant, nursing, or on medication, consult a healthcare professional first.',
  badges = '["FSSAI","Clinically tested","GMP","Secure checkout"]'::jsonb
where slug = 'sleep-gummy';

-- 6. Hair & Skin Gummy (gummy + hair-skin) ---------------------------------------
update products set
  description = 'A daily beauty gummy with biotin and amla bioactives, formulated to support the maintenance of normal hair and skin.',
  ingredients = '[
    {"name":"Biotin","amount":"5000","unit":"mcg"},
    {"name":"Vitamin C (from amla)","amount":"40","unit":"mg"},
    {"name":"Zinc","amount":"5","unit":"mg"}
  ]'::jsonb,
  bioactives = '[
    {"name":"Biotin","role":"Contributes to the maintenance of normal hair and skin","evidence_url":"https://example.org/research/biotin-hair-skin"},
    {"name":"Amla (Indian gooseberry)","role":"A traditional source of vitamin C and antioxidants","evidence_url":"https://example.org/research/amla-antioxidant"},
    {"name":"Zinc","role":"Contributes to the maintenance of normal hair, skin and nails","evidence_url":"https://example.org/research/zinc-hair-skin"}
  ]'::jsonb,
  science_html = '<p>Beauty starts with nutrition. Biotin and zinc have established roles in the maintenance of normal hair and skin, supported by vitamin C from amla.</p><ul><li>Biotin contributes to the maintenance of normal hair and skin.</li><li>Vitamin C contributes to normal collagen formation for the normal function of skin.</li></ul><p>Linked references are placeholders pending review.</p>',
  faqs = '[
    {"q":"How long until I notice a difference?","a":"Nutritional support works gradually. Consistent daily use over several weeks, alongside a balanced diet, is recommended."},
    {"q":"How many gummies per day?","a":"One gummy daily, or as directed on the pack."},
    {"q":"Are they vegetarian?","a":"Yes, these gummies are vegetarian."}
  ]'::jsonb,
  who_for = 'People who want to support the maintenance of normal hair and skin from within, as part of a balanced diet.',
  who_not_for = 'Not a treatment for hair or skin conditions. If you have a medical concern, are pregnant or nursing, consult a healthcare professional first.',
  badges = '["FSSAI","Clinically tested","GMP","Secure checkout"]'::jsonb
where slug = 'hair-skin-gummy';

-- 7. Daily Multivitamin Gummy (gummy + daily-nutrition) --------------------------
update products set
  description = 'A daily multivitamin gummy with 12 vitamins and minerals, formulated to help fill everyday nutritional gaps and support normal metabolism.',
  ingredients = '[
    {"name":"Vitamin A","amount":"400","unit":"mcg"},
    {"name":"Vitamin C","amount":"40","unit":"mg"},
    {"name":"Vitamin D3","amount":"400","unit":"IU"},
    {"name":"Vitamin E","amount":"6","unit":"mg"},
    {"name":"B-complex","amount":"blend","unit":""},
    {"name":"Zinc","amount":"5","unit":"mg"}
  ]'::jsonb,
  bioactives = '[
    {"name":"B-complex vitamins","role":"Contribute to normal energy-yielding metabolism","evidence_url":"https://example.org/research/b-vitamins-metabolism"},
    {"name":"Vitamins A, C and E","role":"Contribute to the protection of cells from oxidative stress","evidence_url":"https://example.org/research/antioxidant-vitamins"},
    {"name":"Vitamin D3","role":"Contributes to normal immune function","evidence_url":"https://example.org/research/vitamin-d-immunity"}
  ]'::jsonb,
  science_html = '<p>A broad daily foundation for people whose diets do not always cover every micronutrient.</p><ul><li>B-vitamins contribute to normal energy-yielding metabolism.</li><li>Vitamins A, C and E contribute to the protection of cells from oxidative stress.</li></ul><p>Linked references are placeholders pending review.</p>',
  faqs = '[
    {"q":"Can this replace a balanced diet?","a":"No. A multivitamin helps fill gaps but is not a substitute for a varied, balanced diet."},
    {"q":"How many gummies per day?","a":"One gummy daily, or as directed on the pack."},
    {"q":"Is it suitable for vegetarians?","a":"Yes, these gummies are vegetarian."}
  ]'::jsonb,
  who_for = 'Adults who want a simple daily nutritional foundation to complement an everyday diet.',
  who_not_for = 'Not a substitute for a balanced diet. Do not exceed the recommended daily intake. If pregnant, nursing, or on other supplements, consult a healthcare professional first.',
  badges = '["FSSAI","Clinically tested","GMP","Secure checkout"]'::jsonb
where slug = 'daily-multivitamin-gummy';

-- Rollback (run manually if needed) — clears the PDP content seeded above,
-- leaving the feature-1 catalog fields intact:
-- update products set description = null, ingredients = '[]'::jsonb,
--   bioactives = '[]'::jsonb, science_html = null, faqs = '[]'::jsonb,
--   who_for = null, who_not_for = null, badges = '[]'::jsonb
-- where slug in (
--   'daily-electrolyte','energy-electrolyte','immunity-hydration',
--   'immunity-gummy','sleep-gummy','hair-skin-gummy','daily-multivitamin-gummy'
-- );
