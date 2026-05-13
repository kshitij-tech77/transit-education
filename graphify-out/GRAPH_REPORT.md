# Graph Report - src  (2026-05-12)

## Corpus Check
- Corpus is ~45,212 words - fits in a single context window. You may not need a graph.

## Summary
- 326 nodes · 591 edges · 22 communities (11 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App Pages & Routing|App Pages & Routing]]
- [[_COMMUNITY_UI Components & Forms|UI Components & Forms]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_CMS & About Pages|CMS & About Pages]]
- [[_COMMUNITY_Blog System|Blog System]]
- [[_COMMUNITY_App Layout & Metadata|App Layout & Metadata]]
- [[_COMMUNITY_Location & Guide Pages|Location & Guide Pages]]
- [[_COMMUNITY_File Upload Service|File Upload Service]]
- [[_COMMUNITY_CMS Dashboard|CMS Dashboard]]
- [[_COMMUNITY_Contact Page|Contact Page]]
- [[_COMMUNITY_Stats Display|Stats Display]]
- [[_COMMUNITY_Blog Data Layer|Blog Data Layer]]
- [[_COMMUNITY_CMS Data Helpers|CMS Data Helpers]]
- [[_COMMUNITY_Supabase Client|Supabase Client]]
- [[_COMMUNITY_File System Utils|File System Utils]]
- [[_COMMUNITY_Auth Middleware|Auth Middleware]]
- [[_COMMUNITY_Static Page|Static Page]]
- [[_COMMUNITY_University Logos|University Logos]]
- [[_COMMUNITY_WhatsApp Widget|WhatsApp Widget]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 55 edges
2. `createClient()` - 46 edges
3. `buttonVariants` - 23 edges
4. `supabase` - 15 edges
5. `resolveMediaUrl()` - 14 edges
6. `PUT()` - 8 edges
7. `DELETE()` - 8 edges
8. `DestinationHero()` - 8 edges
9. `serviceClient()` - 5 edges
10. `Button()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `serviceClient()` --calls--> `createClient()`  [INFERRED]
  app/api/cms/media/route.ts → lib/supabase-server.ts
- `BlogEditor()` --calls--> `cn()`  [EXTRACTED]
  components/cms/BlogEditor.tsx → lib/utils.ts
- `Loader2()` --calls--> `cn()`  [EXTRACTED]
  components/cms/BlogEditor.tsx → lib/utils.ts
- `FAQAccordion()` --calls--> `cn()`  [EXTRACTED]
  components/shared/FAQAccordion.tsx → lib/utils.ts
- `AboutPage()` --calls--> `buttonVariants`  [EXTRACTED]
  app/(frontend)/about/page.tsx → components/ui/button.tsx

## Communities (22 total, 11 thin omitted)

### Community 0 - "App Pages & Routing"
Cohesion: 0.05
Nodes (10): metadata, destinations, Hero(), services, resolveMediaUrl(), supabase, FAQAccordion(), FAQAccordionProps (+2 more)

### Community 1 - "UI Components & Forms"
Cohesion: 0.06
Nodes (41): formSchema, FormValues, DEFAULT_COURSES, DEFAULT_LOCATIONS, DEFAULT_SERVICES, DEFAULT_STUDY_ABROAD, Header(), HeaderProps (+33 more)

### Community 2 - "API Routes"
Cohesion: 0.09
Nodes (32): GET(), POST(), GET(), POST(), DELETE(), GET(), isValidCode(), PUT() (+24 more)

### Community 3 - "CMS & About Pages"
Cohesion: 0.13
Nodes (11): AboutPage(), WelcomeAbout(), CmsHeader(), icons, MobileMenu(), MobileMenuProps, NavLink, ServicesPage() (+3 more)

### Community 4 - "Blog System"
Cohesion: 0.14
Nodes (9): BlogListPage(), BlogEditor(), BlogEditorProps, Loader2(), TiptapEditorProps, BlogEditPage(), BlogPost, FAQItem (+1 more)

### Community 5 - "App Layout & Metadata"
Cohesion: 0.15
Nodes (4): poppins, DestinationHero(), DestinationHeroProps, InfoSectionProps

### Community 6 - "Location & Guide Pages"
Cohesion: 0.15
Nodes (5): Props, LocationClientProps, FAQItem, LocationFAQProps, locationsData

### Community 7 - "File Upload Service"
Cohesion: 0.39
Nodes (8): ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, buildSafeName(), DELETE(), GET(), POST(), serviceClient(), toStoragePath()

## Knowledge Gaps
- **45 isolated node(s):** `config`, `poppins`, `metadata`, `locationsData`, `metadata` (+40 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Components & Forms` to `App Pages & Routing`, `CMS & About Pages`, `Blog System`?**
  _High betweenness centrality (0.244) - this node is a cross-community bridge._
- **Why does `createClient()` connect `API Routes` to `File Upload Service`?**
  _High betweenness centrality (0.228) - this node is a cross-community bridge._
- **Why does `supabase` connect `App Pages & Routing` to `CMS Dashboard`, `CMS & About Pages`, `App Layout & Metadata`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **What connects `config`, `poppins`, `metadata` to the rest of the system?**
  _45 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `UI Components & Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._