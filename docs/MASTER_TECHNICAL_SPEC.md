# MASTER TECHNICAL IMPLEMENTATION SPECIFICATION
## AI-Powered Indian Fashion Discovery & Price-Comparison Platform

**Document type:** Source-of-truth engineering specification  
**Version:** 1.0  
**Status:** Initial baseline — greenfield project  
**Date:** 16 October 2026  
**Audience:** Founder, Antigravity coding agent, engineers, QA, future collaborators

---

## 0. How to use this document

This document defines the initial product and technical contract. Use it as the primary reference when implementing the product. Do not silently change core architecture, data semantics, APIs, permissions, or acceptance criteria. If a requirement must change, update the relevant section and the decision log before implementation.

**Repository inspection status:** The project is confirmed as not started. No repository, source files, credentials, deployed services, or integrations were supplied for inspection. Therefore this is a greenfield specification, not a claim that any existing project has been audited.

**Implementation rule:** Build in phases. Keep the repository runnable after each phase. Do not attempt the entire platform in one code-generation pass. Implement a ticket, test it, document its status, and then proceed.

### Requirement labels
- **Confirmed:** Explicitly selected by the founder.
- **Recommended baseline:** Technical choice proposed to make the first version implementable.
- **Open decision:** Requires validation or a future explicit choice.
- **Later:** Not required to complete the first usable release.

---

## 1. Product definition

### 1.1 Vision

Build a responsive Indian fashion aggregation platform where users can describe clothing in natural language, discover relevant products across Indian homegrown brands, brand-owned stores, independent sellers and legitimate resellers, compare prices for the same item, and discover lower-priced similar-style alternatives.

The platform initially sends shoppers to the original seller's website to complete purchases. It does not hold inventory, process checkout, or manage shipping/returns at launch.

### 1.2 Confirmed product principles

1. Natural-language fashion discovery is a core feature, not a chatbot detached from the catalogue.
2. Aggregate homegrown Indian brands, direct-to-consumer brand stores, independent stores, and legitimate resellers.
3. Exact-product matches and similar-style matches must be clearly distinguished.
4. The platform must not claim that two visually similar garments are identical or equal in quality without evidence.
5. Prices and availability must be timestamped and freshness-aware. Never present stale or unknown data as live/confirmed.
6. Product data must come from brand uploads, authorised APIs/feeds, partnerships, or other sources for which the platform has a valid basis to use the data.
7. A listing can be a discovery result without being a confirmed exact-product comparison.
8. The initial commerce flow redirects to the original seller. Direct checkout is a later product decision.
9. Buyer, seller and admin permissions are distinct.
10. AI must retrieve from real catalogue records. It must not invent product listings, prices, sizes, seller identities, ratings, or purchase URLs.

### 1.3 User roles

- **Anonymous visitor:** Search, filter, view products/brands/offers, and follow seller links. May be rate-limited.
- **Buyer:** All visitor capabilities plus wishlist, saved searches and optional search history.
- **Seller/brand manager:** Manage only their own verified seller/brand records, submit products/offers, upload permitted catalogue files, and view basic listing/click analytics.
- **Admin/reviewer:** Review seller applications, catalogue submissions, data-source permissions, product matches, reports and moderation queues.
- **System worker:** Performs imports, scheduled refreshes, embedding generation and maintenance tasks using restricted service credentials. It is not a human user role.

### 1.4 Core user journeys

**Journey A — Natural-language search**
1. User enters: “A pastel blue co-ord set for college under ₹900, breathable fabric, from an Indian homegrown brand.”
2. Frontend sends query and optional structured filters to backend.
3. Backend interprets the request into validated filters and search terms.
4. Retrieval combines keyword/filter search with semantic retrieval.
5. Hard constraints are applied; candidate results are ranked.
6. Response includes real product IDs, seller offers, match reasons, price freshness and original seller URLs.
7. User opens a product or seller link.

**Journey B — Exact product comparison**
1. User opens a product.
2. Platform shows confirmed seller offers for the same canonical product.
3. Offers are compared by known total cost (item price + known shipping + known mandatory fees; discounts only when applicable and verifiable).
4. Unknown costs are clearly marked; stale offers are not described as current.
5. User selects a seller and is redirected.

**Journey C — Similar-style discovery**
1. User searches in natural language or uploads a reference image.
2. System retrieves products with similar category, visual appearance and attributes.
3. Results are labelled “similar style” or “visually similar,” not “same product.”
4. Ranking considers the user's budget and other constraints.
5. User can compare and open the original seller page.

**Journey D — Seller catalogue submission**
1. Seller applies for an account and verifies control of their business/brand.
2. Admin approves seller access.
3. Seller uploads a product form or supported CSV.
4. Data is validated and placed in review or published according to the seller's permission level.
5. Approved records are normalised and indexed.
6. Seller updates price/stock through the dashboard or an approved feed.

---

## 2. Scope and non-goals

### 2.1 MVP scope

The first usable release includes:
- Responsive homepage and category navigation.
- Natural-language search over a real, bounded catalogue.
- Keyword search and structured filters.
- Similar-style search using image embeddings, including image-upload search.
- Exact-product comparison where a match is confirmed.
- Product detail and seller-offer pages.
- Brand directory and brand profile pages.
- Buyer account, wishlist and saved searches.
- Seller application, seller dashboard and catalogue submission.
- Admin dashboard for seller review, product moderation and exact-match review.
- Authorised product ingestion via manual forms/CSV and at least one implemented source workflow.
- Price/stock freshness fields and scheduled refresh where source capability permits.
- Click-out event tracking for outbound seller links.
- Logging, error handling, tests and deployment instructions.

**MVP data reality:** The application may launch with a small, curated catalogue. Do not imply coverage of every Indian retailer. Coverage must be described honestly.

### 2.2 Explicit non-goals for launch

- Checkout, payment processing, refunds, order management or shipping orchestration.
- Holding inventory or acting as seller of record.
- Scraping sources that prohibit automated access or reuse.
- Circumventing login controls, CAPTCHAs, rate limits, robots controls, or anti-bot systems.
- Claiming universal live price coverage.
- Automated claims that similar-looking items have equivalent quality.
- Training a proprietary foundation model.
- Microservices, Kubernetes, event streaming platform, or a dedicated search cluster before scale requires it.
- Native iOS/Android apps. The initial platform is a responsive website.
- Automated seller payouts or affiliate accounting beyond what is required to record a referral/click.

---

## 3. Architecture baseline

### 3.1 Selected architecture

**Frontend:** Next.js App Router + TypeScript + Tailwind CSS  
**Backend:** Separate Node.js + Express + TypeScript API  
**Database:** PostgreSQL  
**Vector search:** pgvector extension in PostgreSQL  
**Keyword search:** PostgreSQL full-text search and indexed filters  
**File/object storage:** S3-compatible storage or a managed equivalent for catalogue images and temporary uploads  
**Background jobs:** Start with a separate worker process and a simple database-backed job table; add Redis/BullMQ only when needed  
**Authentication:** Managed authentication provider or a secure, well-maintained session/auth implementation. Do not implement password cryptography from scratch.  
**Hosting:** Frontend and API deployed separately; managed PostgreSQL; managed object storage. Keep services within a low-cost region/provider plan appropriate to early traffic.

### 3.2 Logical architecture

1. Browser / responsive web app
2. Next.js frontend
3. Express API
4. Search orchestration module
5. Product/catalogue module
6. Seller and admin modules
7. Ingestion and refresh worker
8. PostgreSQL + pgvector
9. Object storage
10. External LLM/image embedding provider, only where configured
11. Approved product sources: seller CSV, brand dashboard, authorised feeds/APIs and partnerships

### 3.3 Request flow

**Search request**
Browser → Next.js UI → Express `/api/v1/search` → query interpretation → lexical + vector retrieval → hard filters → ranking → offer freshness calculation → response → UI.

**Ingestion**
Seller/admin/authorised feed → ingestion adapter → raw import record → validation/normalisation → product matching → moderation where needed → database → embeddings/index update.

**Outbound purchase**
Product/offer card → click-out endpoint → record minimal referral event → validate active offer URL → HTTP redirect to original seller. Do not silently replace the destination with an untrusted URL.

### 3.4 Architectural constraints

- Keep one repository with clearly separated frontend, API and worker applications initially.
- Keep shared API contracts and domain types in a shared package.
- Business logic belongs in service/domain modules, not directly in Express route handlers.
- Never allow frontend clients to connect directly to the database with privileged credentials.
- Use migrations for schema changes; do not rely on production auto-sync.
- Use interfaces/adapters for LLMs, image embeddings, storage and feed providers so vendors can be replaced.
- If an AI provider is unavailable, degrade gracefully to keyword/filter search and explain the limitation.
- A database-backed job queue is acceptable for a low-traffic first release. Avoid adding Redis until operationally justified.

---

## 4. Repository structure

Recommended monorepo:

```text
fashion-aggregator/
├── apps/
│   ├── web/                         # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (public)/
│   │   │   │   ├── (auth)/
│   │   │   │   ├── buyer/
│   │   │   │   ├── seller/
│   │   │   │   ├── admin/
│   │   │   │   └── api/             # Only frontend/BFF endpoints if needed
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── search/
│   │   │   │   ├── products/
│   │   │   │   ├── brands/
│   │   │   │   ├── offers/
│   │   │   │   ├── wishlist/
│   │   │   │   └── seller/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   ├── public/
│   │   └── tests/
│   ├── api/                         # Express API
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── server.ts
│   │   │   ├── config/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── search/
│   │   │   │   ├── products/
│   │   │   │   ├── offers/
│   │   │   │   ├── brands/
│   │   │   │   ├── sellers/
│   │   │   │   ├── admin/
│   │   │   │   ├── wishlists/
│   │   │   │   └── analytics/
│   │   │   ├── integrations/
│   │   │   │   ├── llm/
│   │   │   │   ├── embeddings/
│   │   │   │   ├── storage/
│   │   │   │   └── sources/
│   │   │   ├── db/
│   │   │   ├── jobs/
│   │   │   └── utils/
│   │   └── tests/
│   └── worker/                      # Ingestion, refresh and embeddings
│       └── src/
├── packages/
│   ├── contracts/                   # Zod schemas and API types
│   ├── domain/                      # Shared domain types and constants
│   ├── config/                      # Shared lint/TS configuration
│   └── test-utils/
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schema-notes/
├── docs/
│   ├── MASTER_TECHNICAL_SPEC.md
│   ├── API.md
│   ├── DATA_SOURCES.md
│   ├── SECURITY.md
│   ├── RUNBOOK.md
│   └── DECISIONS.md
├── scripts/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.base.json
└── README.md
```

Use npm workspaces unless a strong reason arises to select another monorepo tool. Keep dependency versions pinned through the lockfile. Do not create every folder empty on day one; introduce modules as their phase begins.

### Naming conventions
- Database: `snake_case`, plural table names.
- TypeScript: `camelCase` variables/functions; `PascalCase` types/components.
- API: `/api/v1/...`; JSON camelCase field names.
- IDs: UUIDs for internal entities.
- Currency: store integer minor units (paise) plus ISO currency code. For INR, ₹999.00 is `99900` paise. Never use floating-point arithmetic for money.
- Timestamps: UTC `timestamptz`; render in the user's locale.

---

## 5. Domain model and database schema

The schema below is the baseline. Implement it through migrations and review the migration before applying it to any shared environment.

### 5.1 Core entities

#### `users`
- `id UUID PRIMARY KEY`
- `auth_provider_subject TEXT UNIQUE NOT NULL`
- `email TEXT`
- `display_name TEXT`
- `status TEXT NOT NULL` — `active`, `suspended`, `deleted`
- `created_at TIMESTAMPTZ NOT NULL`
- `updated_at TIMESTAMPTZ NOT NULL`

Authentication credentials should be owned by the selected auth provider; do not store raw passwords.

#### `user_roles`
- `user_id UUID REFERENCES users(id)`
- `role TEXT NOT NULL` — `buyer`, `seller`, `admin`
- `created_at TIMESTAMPTZ NOT NULL`
- Composite primary key `(user_id, role)`

Do not infer admin privileges from a user-editable profile field.

#### `buyer_profiles`
- `user_id UUID PRIMARY KEY REFERENCES users(id)`
- `preferred_sizes JSONB`
- `preferred_categories TEXT[]`
- `created_at`, `updated_at`

Collect only preferences needed for the service.

#### `brands`
- `id UUID PRIMARY KEY`
- `name TEXT NOT NULL`
- `slug TEXT UNIQUE NOT NULL`
- `description TEXT`
- `website_url TEXT`
- `country_code CHAR(2)`
- `origin_claim TEXT` — optional, subject to verification
- `verification_status TEXT NOT NULL` — `unverified`, `pending`, `verified`, `rejected`
- `created_by_user_id UUID REFERENCES users(id)`
- `created_at`, `updated_at`

“Indian homegrown” must not be inferred solely from a name or social profile. Display a verified badge only after defined review evidence.

#### `sellers`
- `id UUID PRIMARY KEY`
- `display_name TEXT NOT NULL`
- `seller_type TEXT NOT NULL` — `brand_owned`, `independent_store`, `reseller`, `marketplace_seller`, `other`
- `website_url TEXT`
- `contact_email TEXT`
- `verification_status TEXT NOT NULL` — `pending`, `verified`, `rejected`, `suspended`
- `created_at`, `updated_at`

#### `seller_memberships`
- `seller_id UUID REFERENCES sellers(id)`
- `user_id UUID REFERENCES users(id)`
- `membership_role TEXT NOT NULL` — `owner`, `manager`, `catalogue_editor`
- `created_at`
- Composite primary key `(seller_id, user_id)`

Membership must be checked server-side for every seller mutation.

#### `brand_seller_relationships`
- `brand_id UUID REFERENCES brands(id)`
- `seller_id UUID REFERENCES sellers(id)`
- `relationship_type TEXT NOT NULL` — `brand_owned`, `authorised_reseller`, `marketplace_listing`, `unknown`
- `evidence_reference TEXT`
- `status TEXT NOT NULL` — `pending`, `verified`, `rejected`
- `reviewed_by_user_id UUID REFERENCES users(id)`
- `reviewed_at TIMESTAMPTZ`
- Composite or UUID primary key

Do not label a reseller “authorised” unless the claim has been substantiated.

#### `products`
Canonical product identity, independent of sellers.
- `id UUID PRIMARY KEY`
- `brand_id UUID REFERENCES brands(id)`
- `canonical_name TEXT NOT NULL`
- `description TEXT`
- `category_id UUID REFERENCES categories(id)`
- `gender_target TEXT` — optional, inclusive taxonomy
- `colour_family TEXT[]`
- `fabric_attributes JSONB`
- `style_tags TEXT[]`
- `fit TEXT`
- `pattern TEXT`
- `origin_country_code CHAR(2)`
- `canonical_image_asset_id UUID`
- `identity_status TEXT NOT NULL` — `candidate`, `verified`, `rejected`
- `created_at`, `updated_at`

Product attributes may be unknown. Do not fabricate fabric, origin or quality claims.

#### `categories`
- `id UUID PRIMARY KEY`
- `parent_id UUID REFERENCES categories(id)`
- `name TEXT NOT NULL`
- `slug TEXT UNIQUE NOT NULL`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`

#### `product_variants`
- `id UUID PRIMARY KEY`
- `product_id UUID REFERENCES products(id)`
- `seller_sku TEXT`
- `size_label TEXT`
- `size_system TEXT`
- `colour_label TEXT`
- `variant_attributes JSONB`
- `created_at`, `updated_at`

A product may have multiple size/colour variants. Do not claim size availability based on a product-level stock flag if variant data is available.

#### `seller_offers`
An offer is a seller's listing of a canonical product.
- `id UUID PRIMARY KEY`
- `product_id UUID REFERENCES products(id)`
- `seller_id UUID REFERENCES sellers(id)`
- `external_product_id TEXT`
- `source_id UUID REFERENCES data_sources(id)`
- `product_url TEXT NOT NULL`
- `title_as_sold TEXT`
- `description_as_sold TEXT`
- `price_minor BIGINT`
- `currency CHAR(3) NOT NULL DEFAULT 'INR'`
- `shipping_minor BIGINT`
- `mandatory_fees_minor BIGINT`
- `discount_details JSONB`
- `availability_status TEXT NOT NULL` — `in_stock`, `out_of_stock`, `preorder`, `unknown`
- `last_checked_at TIMESTAMPTZ`
- `next_check_at TIMESTAMPTZ`
- `source_updated_at TIMESTAMPTZ`
- `status TEXT NOT NULL` — `pending_review`, `active`, `stale`, `unavailable`, `rejected`, `removed`
- `match_status TEXT NOT NULL` — `unmatched`, `candidate`, `confirmed_exact`, `rejected_match`
- `created_at`, `updated_at`

Constraints:
- Price values must be non-negative when present.
- Currency must be an ISO 4217 code.
- `product_url` must be HTTPS except for explicit local development fixtures.
- An offer may not be labelled active/current without a policy-defined freshness state.
- Unknown shipping is not the same as free shipping.
- Keep the original source listing title and product URL for auditability.

#### `offer_price_history`
- `id UUID PRIMARY KEY`
- `offer_id UUID REFERENCES seller_offers(id)`
- `price_minor BIGINT`
- `shipping_minor BIGINT`
- `availability_status TEXT`
- `observed_at TIMESTAMPTZ NOT NULL`
- `observation_source TEXT NOT NULL`

Record history at a sensible cadence and avoid storing redundant observations when nothing changed, unless needed for audit or analytics.

#### `product_match_candidates`
- `id UUID PRIMARY KEY`
- `left_product_id UUID REFERENCES products(id)`
- `right_product_id UUID REFERENCES products(id)`
- `match_type TEXT NOT NULL` — `exact_candidate`, `similar_style`
- `confidence NUMERIC`
- `evidence JSONB`
- `status TEXT NOT NULL` — `pending`, `confirmed`, `rejected`
- `reviewed_by_user_id UUID REFERENCES users(id)`
- `reviewed_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL`

Canonicalise the pair order to avoid duplicate `(A,B)` and `(B,A)` candidates. Exact match confirmation requires sufficient identity evidence; image similarity alone is not sufficient.

#### `product_embeddings`
- `id UUID PRIMARY KEY`
- `product_id UUID REFERENCES products(id)`
- `embedding_type TEXT NOT NULL` — `text`, `image`
- `model_name TEXT NOT NULL`
- `model_version TEXT`
- `embedding VECTOR(N)` — set N to the selected model's actual dimension in the migration
- `content_hash TEXT NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL`

Do not invent the vector dimension before selecting and testing a model. If multiple dimensions are required, use separate tables or a deliberately designed storage strategy rather than silently mixing incompatible vectors.

#### `data_sources`
- `id UUID PRIMARY KEY`
- `name TEXT NOT NULL`
- `source_type TEXT NOT NULL` — `seller_upload`, `authorised_api`, `affiliate_feed`, `partner_feed`, `manual_admin`
- `owner_seller_id UUID REFERENCES sellers(id)`
- `permission_status TEXT NOT NULL` — `pending`, `approved`, `restricted`, `revoked`
- `terms_reference TEXT`
- `allowed_fields JSONB`
- `refresh_policy JSONB`
- `last_success_at TIMESTAMPTZ`
- `last_failure_at TIMESTAMPTZ`
- `created_at`, `updated_at`

No production ingestion adapter should run unless its source is approved and its permitted scope is recorded.

#### `catalogue_import_jobs`
- `id UUID PRIMARY KEY`
- `source_id UUID REFERENCES data_sources(id)`
- `requested_by_user_id UUID REFERENCES users(id)`
- `status TEXT NOT NULL` — `queued`, `running`, `succeeded`, `partial`, `failed`, `cancelled`
- `input_asset_key TEXT`
- `rows_total INTEGER`
- `rows_accepted INTEGER`
- `rows_rejected INTEGER`
- `error_summary JSONB`
- `started_at`, `finished_at`, `created_at`

#### `wishlists` and `wishlist_items`
- `wishlists`: `id`, `user_id`, `name`, `created_at`
- `wishlist_items`: `wishlist_id`, `product_id`, `created_at`
- Unique constraint `(wishlist_id, product_id)`.

#### `saved_searches`
- `id UUID PRIMARY KEY`
- `user_id UUID REFERENCES users(id)`
- `query_text TEXT NOT NULL`
- `parsed_filters JSONB`
- `created_at`, `updated_at`

#### `clickout_events`
- `id UUID PRIMARY KEY`
- `user_id UUID NULL REFERENCES users(id)`
- `offer_id UUID REFERENCES seller_offers(id)`
- `clicked_at TIMESTAMPTZ NOT NULL`
- `referral_id TEXT`
- `campaign_parameters JSONB`
- Store minimal, privacy-conscious analytics. Do not store unnecessary IP/device fingerprints.

#### `audit_events`
- `id UUID PRIMARY KEY`
- `actor_user_id UUID NULL REFERENCES users(id)`
- `action TEXT NOT NULL`
- `entity_type TEXT NOT NULL`
- `entity_id UUID`
- `reason TEXT`
- `metadata JSONB`
- `created_at TIMESTAMPTZ NOT NULL`

Audit admin decisions, permission changes, source approvals and product-match confirmations. Do not put passwords, API keys, tokens or sensitive user data in audit metadata.

### 5.2 Important indexes

Implement indexes based on actual query patterns:
- Unique index on `brands.slug`, `categories.slug`.
- Index on `products.category_id`, `products.brand_id`, product status.
- Index on `seller_offers.product_id`, `seller_offers.seller_id`, `seller_offers.status`, `seller_offers.next_check_at`.
- Index on `seller_offers.last_checked_at`.
- GIN index for full-text search vector and selected array fields where appropriate.
- pgvector index appropriate to the selected distance metric and catalogue scale.
- Index on `product_match_candidates.status`, `match_type`.
- Index on `clickout_events.clicked_at`, `clickout_events.offer_id`.
- Index on seller membership lookups.

Do not add indexes to every JSON field automatically. Validate with `EXPLAIN ANALYZE` on representative queries.

---

## 6. API contract

### 6.1 General conventions

- Base path: `/api/v1`.
- JSON request and response bodies.
- UTC timestamps in ISO 8601.
- Internal IDs are UUIDs.
- Validate all inputs with shared schemas (e.g. Zod).
- Use consistent error responses.
- Pagination: cursor-based for large or changing result sets; limit/offset is acceptable for small admin tables.
- Public endpoints must have rate limits and bounded page sizes.
- Do not return internal source credentials, moderation notes, private seller contacts, or admin-only fields to buyers.

Example error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "requestId": "generated-request-id",
    "details": []
  }
}
```

### 6.2 Search

`POST /api/v1/search`

Request:
```json
{
  "query": "pastel blue co-ord set for college under 900",
  "filters": {
    "maxPriceMinor": 90000,
    "currency": "INR",
    "categories": ["co-ord-sets"],
    "colours": ["pastel blue"],
    "fabrics": ["cotton", "linen"],
    "brandOrigin": "india"
  },
  "sort": "relevance",
  "pageSize": 24,
  "cursor": null
}
```

Notes:
- `filters` are optional; parsed natural-language constraints are merged with explicit filters.
- Explicit user-selected filters take precedence over inferred filters.
- Conflicts must be reported or resolved transparently; do not silently ignore explicit constraints.
- `maxPriceMinor` uses paise. Example: ₹900 = `90000`.
- `brandOrigin: "india"` only matches records with verified evidence or clearly labels the origin as unverified.

Response fields:
- `requestId`
- `queryInterpretation` with extracted category/style/colour/budget and confidence
- `results[]`: product summary, match type, score/reasons, price range or best known offer, freshness state, brand, seller offers
- `pagination`
- `warnings[]`, such as stale prices or missing fabric data
- `searchMode`: `hybrid`, `keyword_fallback`, `degraded`

### 6.3 Image search

`POST /api/v1/search/image` — multipart upload or short-lived object-storage upload reference.

Fields:
- image file or upload reference
- optional text prompt
- optional filters and max price
- page size/cursor

Requirements:
- Validate MIME type by inspecting bytes, not trusting filename alone.
- Enforce size and dimension limits.
- Strip metadata where feasible.
- Store temporarily and delete under a documented retention policy.
- Rate-limit and prevent repeated expensive embedding requests.
- Do not use the image for model training unless separately and explicitly authorised.
- Return similar-style matches; do not assert exact identity based solely on image embeddings.

### 6.4 Products and offers

- `GET /api/v1/products/:productId`
- `GET /api/v1/products/:productId/offers`
- `GET /api/v1/products/:productId/similar`
- `GET /api/v1/brands`
- `GET /api/v1/brands/:brandId`
- `GET /api/v1/brands/:brandId/products`
- `GET /api/v1/categories`

Product offer responses must include:
- seller display name and verification status
- item price and currency
- shipping/fees where known
- total-cost calculation status
- availability status
- last checked timestamp
- freshness label
- original seller URL or safe click-out URL
- whether the match is confirmed exact or merely a candidate/similar alternative

### 6.5 Buyer endpoints

- `GET /api/v1/me`
- `GET /api/v1/wishlists`
- `POST /api/v1/wishlists`
- `POST /api/v1/wishlists/:wishlistId/items`
- `DELETE /api/v1/wishlists/:wishlistId/items/:productId`
- `POST /api/v1/saved-searches`
- `GET /api/v1/saved-searches`
- `DELETE /api/v1/saved-searches/:savedSearchId`

Enforce ownership on every request. A user must not read or alter another user's wishlist by changing an ID.

### 6.6 Seller endpoints

- `POST /api/v1/seller/applications`
- `GET /api/v1/seller/profile`
- `PATCH /api/v1/seller/profile`
- `GET /api/v1/seller/products`
- `POST /api/v1/seller/products`
- `PATCH /api/v1/seller/products/:productId`
- `POST /api/v1/seller/catalogue-imports`
- `GET /api/v1/seller/catalogue-imports/:jobId`
- `GET /api/v1/seller/offers`
- `PATCH /api/v1/seller/offers/:offerId`

A seller may only access entities belonging to a seller for which the authenticated user has a valid membership. High-impact changes (ownership, verified status, source permission, exact match) require admin review.

### 6.7 Admin endpoints

- `GET /api/v1/admin/seller-applications`
- `POST /api/v1/admin/sellers/:sellerId/approve`
- `POST /api/v1/admin/sellers/:sellerId/reject`
- `GET /api/v1/admin/catalogue-imports`
- `POST /api/v1/admin/offers/:offerId/approve`
- `POST /api/v1/admin/matches/:matchId/confirm`
- `POST /api/v1/admin/matches/:matchId/reject`
- `POST /api/v1/admin/data-sources/:sourceId/approve`
- `POST /api/v1/admin/data-sources/:sourceId/revoke`
- `GET /api/v1/admin/audit-events`

Admin endpoints require server-side role checks, audit events and reason fields for consequential moderation decisions. Do not create a public endpoint for self-assigning admin.

### 6.8 Click-out

`POST /api/v1/clickouts` records a click event and returns a safe redirect URL or a short-lived click-out identifier. Alternatively, use a route such as `GET /out/:offerId` that records the event and redirects. Validate the destination from the database; never accept an arbitrary destination URL from the client, to avoid open-redirect vulnerabilities.

---

## 7. Natural-language and visual search implementation

### 7.1 Query interpretation

Use an LLM with a strict structured-output schema, or a rules-first parser for basic constraints. Validate model output before use.

Example internal query object:

```json
{
  "category": "co-ord-set",
  "colours": ["pastel blue"],
  "styleTags": ["casual", "minimalist"],
  "fabricPreferences": ["cotton", "linen"],
  "occasion": "college",
  "maxPriceMinor": 90000,
  "currency": "INR",
  "brandOrigin": "india",
  "mustHave": [],
  "softPreferences": ["breathable fabric"],
  "unknowns": []
}
```

Rules:
- Parse budget and currency deterministically where possible.
- Treat explicit UI filters as authoritative.
- Preserve ambiguity rather than hallucinating a specific fabric or product category.
- If a phrase has multiple reasonable interpretations, use broad retrieval and expose adjustable filters.
- Do not ask the LLM to generate a product catalogue. It only interprets the query and may explain retrieved records.
- Validate all model output with a schema; reject or safely default invalid output.
- Set timeouts and token/output limits. Record provider latency and failure class without logging sensitive content unnecessarily.

### 7.2 Retrieval pipeline

1. Validate request and apply rate limits.
2. Parse query into structured constraints.
3. Run SQL filters and PostgreSQL full-text retrieval.
4. If a text embedding is available, run pgvector semantic retrieval.
5. Merge candidates by product ID; preserve retrieval evidence.
6. Apply hard constraints such as max price, category and availability where the data is sufficiently reliable.
7. Compute a relevance/value score.
8. Validate offer freshness and current status.
9. Return results with reasons, uncertainty and source timestamps.
10. If semantic search fails, fall back to keyword search.

### 7.3 Ranking baseline

Use a two-stage system: candidate retrieval first, ranking second.

Candidate retrieval can combine:
- exact keyword/category matches
- full-text relevance
- semantic similarity
- image similarity for image queries
- attribute matches

Initial ranking features:
- query relevance
- category/attribute agreement
- budget fit
- availability
- offer freshness
- seller verification/trust evidence
- completeness of product attributes
- exact-match confidence, when comparison is requested

Recommended initial normalized score:

`score = 0.40 * relevance + 0.20 * attribute_match + 0.15 * budget_fit + 0.10 * freshness + 0.10 * seller_trust + 0.05 * attribute_completeness`

This is a starting hypothesis, not a universal truth. All feature values must be normalized to a documented range. Tune weights against a small, human-labelled evaluation set. For exact-product price sorting, use a distinct sort path rather than this generic relevance score.

Hard constraints must not be overridden by ranking. For example, a product above an explicit maximum budget should not be shown as a qualifying result merely because its semantic relevance is high. If the user chooses “show close alternatives,” above-budget results may be placed in a clearly separate section with explicit labelling.

### 7.4 Price and budget logic

- Store all monetary values in integer paise for INR.
- Total known cost = item price + known shipping + known mandatory fees − verified applicable discounts.
- If shipping/fees are unknown, total cost is “unknown/incomplete,” not item price presented as the final total.
- Never assume a coupon applies without eligibility evidence.
- Sort by total cost only when totals are comparable. Otherwise state why a comparison is incomplete.
- A lower price does not prove better value or equivalent quality.

### 7.5 Image similarity

- Select an image/text embedding model only after verifying provider terms, price, latency, privacy and vector dimensions.
- Generate embeddings for approved catalogue images and store model/version/content hash.
- For an uploaded image, generate an embedding and retrieve nearest catalogue vectors.
- Re-rank using category, dominant colour, silhouette and user constraints where available.
- Display “similar style” labels.
- Keep exact-product match confirmation separate from visual similarity.
- Re-embed only when image/content changes or model version is deliberately upgraded.
- Add an evaluation set of representative Indian fashion images before claiming image search is reliable.

### 7.6 Search evaluation

Maintain a test set of at least 50–100 representative queries when practical, including:
- colloquial descriptions
- misspellings and synonyms
- mixed English/Indian fashion terms
- hard budget limits
- fabric and occasion requests
- no-results and ambiguous queries
- image queries across garment types, colours and silhouettes

Track:
- Precision@10 or judged relevance@10
- proportion of results satisfying explicit hard filters
- zero-result rate
- search latency
- AI provider failure rate
- click-through rate as a product metric, not as sole proof of relevance

---

## 8. Exact matching and similar products

### 8.1 Exact-product match evidence

Signals may include:
- same GTIN/UPC/EAN or reliable SKU mapping where available
- same brand and manufacturer product code
- same source product identifier
- matching title and detailed attributes
- matching image set
- seller/brand confirmation
- consistent colour/size/variant identifiers

Do not rely only on image embeddings, generic titles or the same category.

### 8.2 Matching workflow

1. Create candidate pairs using identifiers, normalized title, brand and image similarity.
2. Calculate candidate confidence and preserve evidence.
3. Auto-confirm only if explicit identity evidence and calibrated thresholds support it.
4. Otherwise place the pair in an admin review queue.
5. Store confirmation/rejection and reviewer identity.
6. When a confirmed match is contradicted, allow revocation and audit the decision.

For early launch, favour manual review of exact matches over aggressive automation. False exact matches undermine user trust.

### 8.3 Similar-style results

Similar-style matching is a separate relationship:
- different canonical product IDs
- similarity score and evidence
- no implication that material, fit, durability or construction are equal
- display relevant known attributes side by side
- disclose unknown or missing fabric/quality information

---

## 9. Product data ingestion and price refresh

### 9.1 Approved source types

- Seller/brand form submissions
- Seller-uploaded CSV files
- Authorised API
- Affiliate/merchant feed
- Contracted partner feed
- Manual admin entry for curated launch catalogue

A source must have a `data_sources` record and an approved permission status before production ingestion. Record permitted fields, attribution, refresh limits, image-use rights, retention and removal requirements.

### 9.2 CSV upload workflow

1. Authenticate seller and verify seller membership.
2. Check source approval and file size/type.
3. Upload to private object storage using a short-lived upload URL where appropriate.
4. Parse asynchronously; do not block an HTTP request for a large file.
5. Validate each row against a versioned schema.
6. Normalize URLs, categories, currency, size, colour and text.
7. Reject unsafe or invalid URLs and malformed data.
8. Produce row-level error reports without exposing other sellers' data.
9. Detect possible duplicates.
10. Create/update pending catalogue records.
11. Admin reviews new brands, source permissions, suspicious listings and uncertain exact matches.
12. Publish approved records and schedule embedding generation.
13. Notify seller of accepted/rejected rows.

Use idempotency keys or stable source/external IDs to prevent duplicate imports. Never silently overwrite a manually verified field with an untrusted feed value.

### 9.3 Feed/API ingestion workflow

- One adapter per source type.
- Keep credentials in a secret manager/environment, never in the repository or database rows accessible to sellers.
- Respect documented rate limits, scopes, terms and permitted fields.
- Store cursor/checkpoint state for incremental feeds.
- Use exponential backoff with jitter for transient failures.
- Use circuit breakers or pause repeated failing sources.
- Make ingestion idempotent.
- Keep a source-level audit trail.
- On permission revocation, stop ingestion promptly and remove or disable data according to the agreement and legal requirements.

### 9.4 Price freshness policy

Freshness thresholds depend on the source agreement and update capability. Initial recommended display policy:
- **Fresh:** checked within 24 hours.
- **Aging:** checked more than 24 hours and within 7 days.
- **Stale:** older than 7 days or refresh failed repeatedly.
- **Unknown:** never successfully checked or timestamp unavailable.

These are starting thresholds, not a promise that every source can refresh daily. Configure policy per source and expose the actual `last_checked_at`.

UI wording:
- Fresh: “Price checked [time/date].”
- Aging: “Last checked [time/date]; price may have changed.”
- Stale: “Price not recently verified. Check seller site for current price.”
- Unknown: “Current price could not be verified.”

Do not mark a product unavailable solely because a refresh job failed. Distinguish “out of stock reported by source” from “source check failed.”

### 9.5 Refresh scheduler

- Query offers whose `next_check_at` is due and whose source remains approved.
- Respect source-specific rate limits and windows.
- Use bounded concurrency.
- Save a new price-history observation only when the value/status changes or when periodic audit sampling is required.
- Update `last_checked_at` only after a successful, meaningful verification.
- On transient failure, retry with backoff; do not refresh `last_checked_at` as if successful.
- After repeated failure, mark freshness stale and alert an admin.
- Never fetch pages from a prohibited source merely to keep data fresh.

---

## 10. Authentication, authorisation and moderation

### 10.1 Authentication

Use a managed auth provider or a mature session/auth library. The provider is an open vendor decision. Requirements:
- secure session cookies (HttpOnly, Secure in production, appropriate SameSite)
- CSRF protection for cookie-authenticated state-changing requests
- email verification for seller applications
- password reset through the provider if passwords are supported
- optional OAuth only if implemented securely
- session revocation on suspension/credential compromise
- rate limits for login, signup and password reset

### 10.2 Authorisation

- Buyer can modify only their own wishlist/profile/saved searches.
- Seller can mutate only records tied to their approved seller membership.
- Pending or suspended sellers cannot publish or update public offers except where an explicit limited workflow allows it.
- Admin actions require a server-side admin role, audit event and reason for consequential actions.
- Admin role cannot be assigned through public signup or a user-controlled profile update.
- Use deny-by-default permissions.
- Do not trust role, seller ID, price, verification status or destination URL sent by the client without server-side checks.

### 10.3 Moderation states

Seller: `pending`, `verified`, `rejected`, `suspended`.  
Brand: `unverified`, `pending`, `verified`, `rejected`.  
Offer: `pending_review`, `active`, `stale`, `unavailable`, `rejected`, `removed`.  
Match: `pending`, `confirmed`, `rejected`.

Admin review must cover seller identity/ownership evidence, brand-origin claims, authorised-reseller claims, source permissions, suspicious prices/links, exact product matches and reported listings.

---

## 11. Security, privacy and legal/compliance guardrails

This is an engineering baseline, not legal advice. Obtain appropriate professional advice for launch obligations, data protection, consumer-facing disclosures, contracts, taxes and affiliate arrangements.

### 11.1 Web/API security
- HTTPS in production.
- Validate every request with schemas.
- Parameterized database queries; no SQL string concatenation from user input.
- Restrictive CORS allowlist.
- Helmet or equivalent security headers.
- Rate limits for search, image upload, authentication and imports.
- Request body and upload size limits.
- Avoid open redirects; resolve click-out URLs from validated database records.
- Validate outbound URLs and prevent server-side request forgery in URL-preview/import features. Prefer seller-provided feeds rather than arbitrary server-side URL fetches.
- Restrict file types and inspect file content; malware scanning if available.
- Keep dependencies updated and run audit tooling.
- Never log secrets, access tokens or full sensitive payloads.
- Use least-privilege DB and storage credentials.
- Separate dev/staging/production credentials.

### 11.2 Image handling
- Private upload bucket by default.
- Signed URLs with short expiry.
- MIME sniffing and file size/dimension caps.
- Remove EXIF metadata when feasible.
- Restrict access to user uploads.
- Set documented retention/deletion.
- Do not train models on user images unless separately authorised.
- Provide a reporting/takedown path for images or products submitted without rights.

### 11.3 Data source governance
- Do not bypass site restrictions, authentication, CAPTCHAs, rate limits or anti-bot controls.
- Use only approved feeds/APIs, seller submissions, partnerships or sources whose terms permit the intended use.
- Record source permission and allowed fields.
- Honour attribution, link, image display, caching and deletion requirements.
- Provide a process for sellers/rights holders to report incorrect or unauthorised listings.
- Maintain provenance for every offer and image.

### 11.4 Privacy
- Collect minimum data required.
- Keep analytics proportionate; avoid unnecessary device fingerprinting.
- Document purpose, retention and deletion for search logs and image uploads.
- Provide account deletion/data access workflows appropriate to applicable law.
- Avoid sending personally identifying user data to AI providers unless needed and disclosed.
- Review provider data retention/training terms before sending queries or images.
- Publish clear privacy, terms, seller and affiliate disclosures before public launch.

---

## 12. Frontend routes and UI states

### Public routes
- `/` homepage and search entry
- `/search?q=...` search results
- `/products/[productId]` product details
- `/brands` brand directory
- `/brands/[slug]` brand profile
- `/categories/[slug]` category page
- `/about`, `/privacy`, `/terms`, `/contact` before public launch

### Buyer routes
- `/account`
- `/account/wishlist`
- `/account/saved-searches`
- `/account/settings`

### Seller routes
- `/seller/apply`
- `/seller/dashboard`
- `/seller/products`
- `/seller/products/new`
- `/seller/offers`
- `/seller/imports`
- `/seller/settings`

### Admin routes
- `/admin`
- `/admin/sellers`
- `/admin/brands`
- `/admin/offers`
- `/admin/matches`
- `/admin/data-sources`
- `/admin/imports`
- `/admin/audit`

### Required UI states
Every data-driven page must support:
- loading/skeleton state
- empty state
- validation error
- API/network error
- partial data
- stale/unverified offer warnings
- no-results state with suggestions to relax filters
- unauthenticated and forbidden states
- responsive layout and keyboard navigation

Product cards must display source/brand and the relevant price/freshness context. Avoid misleading “best price” labels unless comparison coverage is known and the calculation is valid.

---

## 13. Observability and analytics

### Technical metrics
- API latency and error rate by route
- search latency and fallback frequency
- LLM/embedding latency, timeout and failure rates
- ingestion success/failure and row rejection rate
- refresh success rate and offer staleness distribution
- database connection health and slow queries
- image upload errors
- job queue backlog

### Product metrics
- search-to-product-click rate
- click-out rate
- percentage of searches returning results
- percentage of results satisfying hard filters
- repeat searches and wishlist usage
- seller onboarding completion
- active verified products/offers
- exact-match review precision from sampled audits

Collect only what is needed, define retention, and avoid treating click-through as proof that search results are correct.

### Operational alerts
- repeated source import failure
- source permission revoked while jobs remain scheduled
- sudden increase in stale offers
- unusual admin/seller permission changes
- AI provider cost or rate-limit threshold
- high API error rate or database exhaustion

---

## 14. Testing strategy

### Unit tests
- money and total-cost calculations
- freshness-state calculation
- query parser validation and conflict resolution
- hard-filter enforcement
- ranking feature normalization
- URL validation and click-out safety
- role/ownership policy helpers
- CSV row validation and normalization
- exact-match decision rules

### Integration tests
- API + test PostgreSQL migrations
- product and offer CRUD
- seller ownership restrictions
- admin review and audit logging
- catalogue import idempotency
- refresh failure handling
- search retrieval and fallback behavior
- embedding model version/dimension compatibility

### End-to-end tests
1. Anonymous user searches and opens a product.
2. User describes a budget-constrained outfit and results respect the budget.
3. Buyer signs in and adds/removes a wishlist item.
4. Seller applies; pending seller cannot publish until approved.
5. Approved seller imports a valid CSV and sees row-level errors for invalid rows.
6. Admin confirms/rejects an exact match; UI updates correctly.
7. A stale offer displays a warning.
8. Click-out goes only to the stored, validated seller URL.
9. Image upload rejects unsupported/oversized files and returns similar-style results for valid files.
10. Unauthorized users cannot access seller/admin data by changing IDs.

### Minimum release gates
- TypeScript typecheck passes.
- Linter passes.
- Unit and integration tests pass.
- Production build succeeds.
- Database migrations work from an empty database.
- No secret is committed.
- Core accessibility checks pass.
- Manual smoke test documented in `docs/RUNBOOK.md`.

---

## 15. Environment variables and secrets

Create `.env.example` with names and safe placeholders only. Do not commit real secrets.

```dotenv
# Frontend
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1

# Express API
NODE_ENV=development
API_PORT=4000
WEB_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
DATABASE_DIRECT_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
AUTH_ISSUER_URL=
AUTH_AUDIENCE=
AUTH_JWKS_URL=
SESSION_SECRET=
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Object storage — provider is not yet selected
OBJECT_STORAGE_ENDPOINT=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_REGION=
OBJECT_STORAGE_ACCESS_KEY_ID=
OBJECT_STORAGE_SECRET_ACCESS_KEY=

# AI — provider/model selection remains open
LLM_PROVIDER=
LLM_API_KEY=
LLM_MODEL=
TEXT_EMBEDDING_PROVIDER=
TEXT_EMBEDDING_MODEL=
IMAGE_EMBEDDING_PROVIDER=
IMAGE_EMBEDDING_MODEL=

# Job worker
WORKER_CONCURRENCY=2
CATALOGUE_IMPORT_MAX_FILE_MB=10
IMAGE_UPLOAD_MAX_MB=8

# Optional operational settings
LOG_LEVEL=info
SENTRY_DSN=
```

Notes:
- Do not use `NEXT_PUBLIC_` for secrets. Only variables deliberately safe to expose to the browser may use that prefix.
- Remove unused variables rather than leaving fake configuration in production.
- The exact auth, database hosting, storage, LLM and embedding providers must be selected before implementation of their adapters.
- Never invent or hardcode API keys, account IDs or credentials.
- Prefer a secret manager in deployment; local `.env.local` files must be ignored by Git.

---

## 16. Deployment and environments

### Environments
- **Local:** developer machine, seeded demo data, no production credentials.
- **Preview/staging:** separate database and storage bucket; safe test seller data.
- **Production:** restricted access, backups, monitoring and real approved sources.

### Deployment steps
1. Create managed PostgreSQL database and enable pgvector after selecting the embedding model/dimension.
2. Apply versioned migrations.
3. Deploy Express API with validated environment variables.
4. Deploy the worker as a separate process from the same repository.
5. Deploy Next.js frontend and configure the API base URL.
6. Configure CORS, auth callback URLs, allowed origins and HTTPS.
7. Configure object storage with private buckets and restricted access.
8. Run smoke tests.
9. Add first approved data source and import a small catalogue.
10. Verify price timestamps, outbound URLs, permissions, logging and backup/restore procedure.

### Backups and recovery
- Enable database backups on the chosen provider.
- Document recovery steps and test a restore before public launch.
- Do not rely on CSV exports as the only production backup.
- Define a retention policy for uploads and import artifacts.
- Provide a rollback strategy for app deployments and reversible migrations where possible.

---

## 17. Phased implementation plan and tickets

Do not begin all phases simultaneously. Complete acceptance criteria before moving on.

### Phase 0 — Project bootstrap
**Tickets**
- P0-01: Create monorepo with npm workspaces, TypeScript and shared lint configuration.
- P0-02: Create Next.js web app and Express API app.
- P0-03: Add `/health` endpoint and frontend API connectivity check.
- P0-04: Add `.env.example`, `.gitignore`, README and local setup instructions.
- P0-05: Add CI for lint, typecheck, tests and build.

**Acceptance**
- Fresh clone can be installed and started using documented commands.
- Web and API run independently.
- `/health` returns status and a build/version identifier without exposing secrets.
- CI passes; no real credentials are committed.

### Phase 1 — UX shell and demo catalogue
**Tickets**
- P1-01: Build responsive homepage and navigation.
- P1-02: Build reusable product/brand/offer cards.
- P1-03: Build category and search-results pages using clearly labelled seed data.
- P1-04: Build product details and comparison layout.
- P1-05: Add loading, empty, error and stale-price states.

**Acceptance**
- Pages work on mobile and desktop.
- Demo data is clearly marked and never presented as live inventory.
- Filters and sorting function against demo data.
- No dead buttons or fake purchase flows.

### Phase 2 — Database and catalogue APIs
**Tickets**
- P2-01: Implement schema migrations and seed script.
- P2-02: Implement product, brand, seller and offer repository/service layers.
- P2-03: Implement public catalogue endpoints.
- P2-04: Implement safe pagination, validation and error response format.
- P2-05: Add migration and API integration tests.

**Acceptance**
- Products/offers survive application restarts.
- Exact same product can have multiple offers.
- Product and offer records are distinct.
- API rejects invalid prices, malformed URLs and invalid states.

### Phase 3 — Authentication and roles
**Tickets**
- P3-01: Select and configure managed/mature auth provider.
- P3-02: Add buyer account and session handling.
- P3-03: Add seller application and membership model.
- P3-04: Add server-side RBAC/ownership middleware.
- P3-05: Add admin-only role provisioning and audit events.

**Acceptance**
- Buyer, seller and admin capabilities are separate.
- Seller cannot access another seller's records by changing IDs.
- No public role-escalation route exists.
- Authentication and account recovery follow provider security guidance.

### Phase 4 — Seller onboarding and ingestion
**Tickets**
- P4-01: Add seller dashboard and product form.
- P4-02: Add source permission registry and admin approval.
- P4-03: Implement CSV parser, validation and row-level report.
- P4-04: Add asynchronous import job processing.
- P4-05: Add duplicate candidates and moderation queue.

**Acceptance**
- Only approved sources can publish to public catalogue.
- CSV import is idempotent and reports rejected rows.
- Import failures do not corrupt accepted records.
- Every offer has source provenance and a freshness field.

### Phase 5 — Natural-language text search
**Tickets**
- P5-01: Implement PostgreSQL full-text search and indexed filters.
- P5-02: Implement structured query schema and deterministic budget parser.
- P5-03: Add LLM adapter only after provider/cost decision.
- P5-04: Implement hybrid retrieval and fallback mode.
- P5-05: Build query evaluation set and search metrics.

**Acceptance**
- Search results come only from database records.
- Explicit max price/category filters are enforced.
- Invalid LLM output does not crash search or leak arbitrary data.
- Keyword fallback works if AI provider fails.
- Search result explains match signals and price freshness.

### Phase 6 — Embeddings and image search
**Tickets**
- P6-01: Select text/image embedding models and record terms/cost/dimensions.
- P6-02: Add embedding generation worker and content hashes.
- P6-03: Add pgvector migration/index after dimension is confirmed.
- P6-04: Add secure temporary image upload.
- P6-05: Implement image retrieval and similar-style labels.

**Acceptance**
- Embeddings use one compatible model/version per index.
- Changed content can be re-embedded idempotently.
- Unsupported/oversized uploads are rejected.
- Image search returns similar styles without claiming exact identity.
- AI provider outage has a safe error/fallback path.

### Phase 7 — Exact-product comparison and price freshness
**Tickets**
- P7-01: Implement match-candidate generation.
- P7-02: Add admin confirmation/rejection workflow.
- P7-03: Implement total known cost calculation in integer minor units.
- P7-04: Add offer history and source-specific refresh policies.
- P7-05: Implement freshness labels and safe click-out tracking.

**Acceptance**
- Only confirmed exact matches are grouped as the same item.
- Shipping unknown is never represented as free.
- Stale prices are visibly marked.
- Refresh failure does not pretend a successful check occurred.
- Click-out only redirects to a validated stored seller URL.

### Phase 8 — Launch readiness
**Tickets**
- P8-01: Add rate limits, security headers and upload controls.
- P8-02: Complete end-to-end and accessibility smoke tests.
- P8-03: Configure production deployment and database backups.
- P8-04: Publish privacy/terms/source attribution and seller contact process.
- P8-05: Onboard initial participating brands and monitor real searches.

**Acceptance**
- All release gates in Section 14 pass.
- Source permissions and image-use rights are recorded.
- No secrets or demo prices are exposed as production facts.
- A rollback and restore procedure has been documented and tested.
- The platform's coverage limitations are disclosed accurately.

---

## 18. Decisions that remain open

These are not silently decided by this document. Choose them when the relevant phase approaches.

| Decision | Recommended timing | Decision criteria |
|---|---|---|
| Brand/domain/product name | Before public launch | Trademark/domain availability, audience fit |
| Authentication provider | Phase 3 | Cost, session security, role integration, regional availability |
| Database hosting provider | Phase 0/2 | Free tier limits, backups, pgvector support, region, connection pooling |
| Object storage provider | Phase 4/6 | Image rights, cost, signed URLs, deletion and egress |
| LLM provider/model | Phase 5 | Structured output, latency, cost, privacy and Indian fashion vocabulary |
| Image/text embedding models | Phase 6 | Retrieval quality, dimensions, license/terms, inference cost |
| Exact-match threshold | Phase 7 | Human-labelled precision and false-match cost |
| Freshness thresholds per source | During onboarding | Source update frequency, agreements and observed volatility |
| Monetisation model | After initial usage validation | Affiliate access, seller interest, referral conversion |
| Launch category focus | Before catalogue seeding | Search demand, brand participation and catalogue depth |
| Hosting region and production budget | Before public launch | Latency, data handling and projected usage |

### Recommended initial assumptions
- Launch as a responsive web app.
- Use INR as the initial display currency while retaining ISO currency codes in the database.
- Begin with a bounded catalogue and selected categories, then expand based on evidence.
- Use redirect-to-seller commerce only.
- Prefer a managed auth/database/storage service if it reduces maintenance and fits budget.
- Do not introduce Redis, dedicated search infrastructure or microservices until measurements justify them.
- Use a small curated evaluation set before tuning ranking weights.
- Use admin review for uncertain exact-product matches.

---

## 19. Definition of done for the first public beta

The first public beta is ready only when:
- The app can be deployed from a clean checkout using documented steps.
- At least one authorised ingestion route works end-to-end.
- Product, brand, seller and offer data have clear provenance.
- Natural-language search returns relevant real catalogue records.
- Explicit hard filters are enforced.
- Image search returns similar-style results from indexed catalogue images.
- Exact comparison groups only confirmed product matches.
- Price freshness and unknown shipping are clearly displayed.
- Seller and admin authorisation tests pass.
- Click-out URLs are validated and tracked without open redirects.
- Basic privacy, terms, seller contact/takedown and data-source disclosures exist.
- Logging, monitoring, backup and restore procedures are documented.
- The team can explain what catalogue coverage exists and what is not covered.

---

## 20. Operating rules for Antigravity and future developers

1. Read this specification and `docs/DECISIONS.md` before modifying architecture.
2. Inspect the current repository before making assumptions about existing files or code.
3. Never claim a feature is implemented until code exists and relevant tests/checks pass.
4. Implement one ticket or a small cohesive set of tickets at a time.
5. Do not invent credentials, partner APIs, affiliate access, product URLs, product prices or brand permission.
6. Do not scrape prohibited sources or bypass access controls.
7. Keep business logic out of route handlers and UI components.
8. Use shared schemas for API validation and types where practical.
9. Add tests with every non-trivial feature.
10. Update this spec/decision log when a core decision changes.
11. Keep `.env.example` current and keep secrets out of Git.
12. Clearly report: files changed, commands run, tests passed/failed, known gaps, and exact next step.
13. If a requirement is ambiguous and the choice affects security, money, data rights, architecture or user trust, stop and ask rather than silently guessing.
14. Use truthful UI labels for live/stale/unknown prices and exact/similar matches.
15. Preserve a runnable app after every implementation phase.

---

## 21. First implementation prompt

Paste this into Antigravity only after saving this document in the repository as `docs/MASTER_TECHNICAL_SPEC.md`.

> Read `docs/MASTER_TECHNICAL_SPEC.md` completely before coding. This is a greenfield project. Implement **Phase 0 only**: create the npm-workspaces monorepo with `apps/web` (Next.js + TypeScript + Tailwind), `apps/api` (Express + TypeScript), shared `packages/contracts` and `packages/domain`, basic lint/typecheck/test/build scripts, `.env.example`, `.gitignore`, and a clear README. Add an Express `/health` endpoint and a simple frontend page that calls it using the configured API base URL. Do not implement product features, database integrations, AI, scraping, authentication or paid-provider integrations in this phase. Inspect the created tree, run the available checks, fix errors, and report changed files, exact commands, test results and any remaining issues. Stop after Phase 0 and wait for review.

---

## 22. Change log

- **v1.0 — 16 October 2026:** Initial greenfield specification based on confirmed founder decisions. Provider choices, product name, source agreements and some launch policies remain explicitly open.
