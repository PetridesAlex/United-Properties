/**
 * Client-friendly website copy schema — one page at a time.
 * Types and `f` / `contentKey` live in `./types`; re-exported here for backwards compatibility.
 */
import {
  f,
  contentKey,
  type ContentFieldDef,
  type ContentFieldType,
  type ContentPageDef,
  type ContentSectionDef,
} from './types'

export type {ContentFieldDef, ContentFieldType, ContentPageDef, ContentSectionDef}
export {contentKey, f}

export const CONTENT_PAGES: ContentPageDef[] = [
  {
    id: 'home',
    title: 'Homepage',
    description: 'Main landing page — video hero, featured sections, services, and closing CTA.',
    path: '/',
    sections: [
      {
        id: 'hero',
        title: 'Video hero',
        description: 'Headline over the homepage film. Leave blank to keep the video full-bleed.',
        fields: [
          f('eyebrow', 'Small label', 'United Properties · Cyprus'),
          f('heading', 'Heading', 'Luxury Real Estate in Cyprus'),
          f(
            'description',
            'Supporting text',
            'Curated homes, seafront living, and private-client advisory across Limassol and beyond.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'featured',
        title: 'Featured properties',
        description: 'Heading above the featured property cards.',
        fields: [
          f('eyebrow', 'Small label', 'Featured Properties'),
          f('heading', 'Heading', 'Featured Properties'),
          f(
            'description',
            'Supporting text',
            'Check out some of our most exclusive houses, apartments, townhomes, penthouses, and more.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'signature',
        title: 'Signature collection',
        description: 'The cinematic scrolling stack of exclusive addresses.',
        fields: [
          f('eyebrow', 'Small label', 'Signature Collection'),
          f('heading', 'Heading', 'Scroll Through Our Most Exclusive Addresses'),
          f(
            'description',
            'Supporting text',
            'A cinematic stacked showcase powered by smooth motion interactions and premium storytelling.',
            'textarea',
            3,
          ),
          f('view_cta', 'View button label', 'View Property'),
        ],
      },
      {
        id: 'services',
        title: 'Services preview',
        description: 'Homepage services grid heading and the eight service cards.',
        fields: [
          f('eyebrow', 'Small label', 'Services'),
          f('heading', 'Heading', 'Comprehensive Advisory and Property Services'),
          f(
            'description',
            'Supporting text',
            'From acquisition strategy to relocation and portfolio management, every step is tailored.',
            'textarea',
            3,
          ),
          f('card1_title', 'Card 1 title', 'Property Sales'),
          f(
            'card1_body',
            'Card 1 text',
            'Strategic acquisition and sales advisory for primary residences and high-value assets.',
            'textarea',
            2,
          ),
          f('card2_title', 'Card 2 title', 'Luxury Rentals'),
          f(
            'card2_body',
            'Card 2 text',
            'Premium rental sourcing for executive, lifestyle, and long-stay relocation clients.',
            'textarea',
            2,
          ),
          f('card3_title', 'Card 3 title', 'Luxury Portfolio Representation'),
          f(
            'card3_body',
            'Card 3 text',
            'Bespoke marketing and positioning for trophy properties and signature homes.',
            'textarea',
            2,
          ),
          f('card4_title', 'Card 4 title', 'Investment Advisory'),
          f(
            'card4_body',
            'Card 4 text',
            'Data-backed investment structuring and market intelligence for international buyers.',
            'textarea',
            2,
          ),
          f('card5_title', 'Card 5 title', 'Property Management'),
          f(
            'card5_body',
            'Card 5 text',
            'End-to-end asset management, tenant operations, maintenance, and reporting.',
            'textarea',
            2,
          ),
          f('card6_title', 'Card 6 title', 'Holiday Home Support'),
          f(
            'card6_body',
            'Card 6 text',
            'Acquisition and optimization guidance for short-stay and seasonal properties.',
            'textarea',
            2,
          ),
          f('card7_title', 'Card 7 title', 'Relocation Services'),
          f(
            'card7_body',
            'Card 7 text',
            'Smooth relocation coordination for families, executives, and digital professionals.',
            'textarea',
            2,
          ),
          f('card8_title', 'Card 8 title', 'International Client Assistance'),
          f(
            'card8_body',
            'Card 8 text',
            'Cross-border purchase support, local process guidance, and trusted partner referrals.',
            'textarea',
            2,
          ),
        ],
      },
      {
        id: 'editorial',
        title: 'Editorial story',
        description: 'Lifestyle / market perspective block with the large photo.',
        fields: [
          f('eyebrow', 'Small label', 'Editorial Perspective'),
          f('heading', 'Heading', 'Coastal Living, Strategic Value, and Tailored Guidance'),
          f(
            'body',
            'Story text',
            'Cyprus offers a rare combination of Mediterranean lifestyle, long-term growth fundamentals, and global buyer accessibility. Our advisors blend market intelligence with private-client service to secure properties that align with your ambitions.',
            'textarea',
            5,
          ),
        ],
      },
      {
        id: 'team',
        title: 'Advisory team',
        description: 'Homepage team section heading.',
        fields: [
          f('eyebrow', 'Small label', 'Advisory Team'),
          f('heading', 'Heading', 'Experienced Professionals'),
          f(
            'description',
            'Supporting text',
            'Specialist consultants in prime residential, investment sales, and cross-border transactions.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'testimonials',
        title: 'Testimonials',
        description: 'Client testimonials heading and quotes.',
        fields: [
          f('eyebrow', 'Small label', 'Client Testimonials'),
          f('heading', 'Heading', 'Trusted by Local and International Clients'),
          f('quote1', 'Quote 1', 'Their team handled every stage with precision. We secured the right Limassol asset quickly and confidently.', 'textarea', 3),
          f('name1', 'Quote 1 name', 'Michael R.'),
          f('location1', 'Quote 1 location', 'London'),
          f('quote2', 'Quote 2', 'The market insight and discretion were exceptional. It felt like a private advisory service, not a typical agency.', 'textarea', 3),
          f('name2', 'Quote 2 name', 'Nadia A.'),
          f('location2', 'Quote 2 location', 'Dubai'),
          f('quote3', 'Quote 3', 'From legal introductions to relocation support, the process was seamless and genuinely premium.', 'textarea', 3),
          f('name3', 'Quote 3 name', 'Andrei P.'),
          f('location3', 'Quote 3 location', 'Bucharest'),
        ],
      },
      {
        id: 'cta',
        title: 'Bottom call to action',
        description: 'Closing banner at the bottom of the homepage.',
        fields: [
          f('heading', 'Heading', 'Ready to Find Your Ideal Property in Cyprus?'),
          f(
            'description',
            'Supporting text',
            'Connect with our advisors for a tailored strategy across premium Cyprus locations.',
            'textarea',
            3,
          ),
          f('btn_listings', 'Listings button', 'View Listings'),
          f('btn_contact', 'Contact button', 'Contact Our Team'),
          f('btn_whatsapp', 'WhatsApp button', 'WhatsApp'),
        ],
      },
    ],
  },
  {
    id: 'about',
    title: 'About',
    description: 'Company story, mission, values, and why choose us.',
    path: '/about',
    sections: [
      {
        id: 'hero',
        title: 'Page intro',
        description: 'Top banner on the About page.',
        fields: [
          f('eyebrow', 'Small label', 'About United Properties'),
          f('heading', 'Heading', 'Trusted Cyprus Real Estate Advisory'),
          f(
            'description',
            'Intro text',
            'We combine local expertise, international perspective, and private-client service to deliver clear property decisions.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'story',
        title: 'Brand story',
        description: 'Main story column next to the office image.',
        fields: [
          f('eyebrow', 'Section label', 'Brand Story'),
          f('heading', 'Heading', 'Precision, Trust, and Market Insight'),
          f(
            'body',
            'Story',
            'Our firm was built to elevate how clients navigate Cyprus property. Every recommendation is grounded in market data, location dynamics, and personal objectives.',
            'textarea',
            5,
          ),
          f('mission_heading', 'Mission heading', 'Mission'),
          f(
            'mission',
            'Mission text',
            'Deliver premium real estate outcomes through tailored advisory and execution excellence.',
            'textarea',
            3,
          ),
          f('values_heading', 'Values heading', 'Values'),
          f(
            'values',
            'Values text',
            'Integrity, discretion, strategic clarity, and long-term relationships.',
            'textarea',
            3,
          ),
          f('cta_label', 'Button label', 'Book a Consultation'),
        ],
      },
      {
        id: 'why',
        title: 'Why choose us',
        description: 'Three benefit cards.',
        fields: [
          f('heading', 'Section heading', 'Why Choose Us'),
          f(
            'description',
            'Section description',
            'Local market mastery, international buyer support, and premium transaction guidance.',
            'textarea',
            3,
          ),
          f('point1_title', 'Card 1 title', 'Prime Market Access'),
          f(
            'point1_body',
            'Card 1 text',
            'Curated inventory in Cyprus locations with strong lifestyle and value fundamentals.',
            'textarea',
            2,
          ),
          f('point2_title', 'Card 2 title', 'Global Buyer Expertise'),
          f(
            'point2_body',
            'Card 2 text',
            'Structured support for overseas investors, expats, and relocation clients.',
            'textarea',
            2,
          ),
          f('point3_title', 'Card 3 title', 'End-to-End Advisory'),
          f(
            'point3_body',
            'Card 3 text',
            'From search strategy to completion, every detail is managed with precision.',
            'textarea',
            2,
          ),
        ],
      },
      {
        id: 'team',
        title: 'Leadership team',
        description: 'Heading above the advisor cards.',
        fields: [f('heading', 'Heading', 'Leadership and Advisory Team')],
      },
      {
        id: 'cta',
        title: 'Bottom call to action',
        description: 'Closing banner on the About page.',
        fields: [
          f('heading', 'Heading', 'Work With a Team That Understands Prestige Real Estate'),
          f(
            'description',
            'Supporting text',
            'Connect with our advisors for a tailored strategy across premium Cyprus locations.',
            'textarea',
            3,
          ),
        ],
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    description: 'Contact page intro, methods, office details, and map.',
    path: '/contact',
    sections: [
      {
        id: 'hero',
        title: 'Page intro',
        description: 'Top banner on the Contact page.',
        fields: [
          f('eyebrow', 'Small label', 'Contact'),
          f('heading', 'Heading', 'Start a Private Real Estate Consultation'),
          f(
            'description',
            'Intro text',
            'Connect with our team for sales, rentals, relocation, and investment strategy in Cyprus.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'intro',
        title: 'Concierge section',
        description: 'Text above the contact methods and form.',
        fields: [
          f('eyebrow', 'Small label', 'Client concierge'),
          f('heading', 'Heading', 'Get in touch'),
          f(
            'description',
            'Supporting text',
            'Choose how you would like to reach United Properties — we respond during business hours and on WhatsApp when possible.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'methods',
        title: 'Contact methods',
        description: 'WhatsApp, email, and call cards.',
        fields: [
          f('whatsapp_title', 'WhatsApp title', 'WhatsApp'),
          f('whatsapp_subtitle', 'WhatsApp subtitle', 'Fast answers from our team'),
          f('email_title', 'Email title', 'Email us'),
          f('email_subtitle', 'Email subtitle', 'info@unitedproperties.eu'),
          f('call_title', 'Call title', 'Call us'),
          f('call_subtitle', 'Call subtitle', '+357 25 123 456'),
        ],
      },
      {
        id: 'office',
        title: 'Office details',
        description: 'Office card on the contact page.',
        fields: [
          f('heading', 'Heading', 'Office'),
          f('address', 'Address', '18 Marina Avenue, Limassol, Cyprus'),
          f('phone', 'Phone', '+357 25 123 456'),
          f('email', 'Email', 'info@unitedproperties.eu'),
          f('hours', 'Opening hours', 'Mon - Fri: 9:00 - 18:00'),
        ],
      },
      {
        id: 'telegram',
        title: 'Telegram',
        description: 'Telegram card on the contact page.',
        fields: [
          f('heading', 'Heading', 'Telegram'),
          f(
            'body',
            'Supporting text',
            'Continue the conversation on Telegram if you prefer.',
            'textarea',
            2,
          ),
          f('link_label', 'Link label', 'Telegram'),
        ],
      },
      {
        id: 'map',
        title: 'Map',
        description: 'Map card on the contact page.',
        fields: [
          f('heading', 'Heading', 'Map'),
          f('open_maps_label', 'Open maps label', 'Open in Google Maps'),
        ],
      },
    ],
  },
  {
    id: 'services',
    title: 'Services',
    description: 'Services page intros and Invest with us content.',
    path: '/services',
    sections: [
      {
        id: 'hero',
        title: 'Main services intro',
        description: 'Default top banner on /services.',
        fields: [
          f('eyebrow', 'Small label', 'Services'),
          f('heading', 'Heading', 'Premium Real Estate Services'),
          f(
            'description',
            'Intro text',
            'Comprehensive support for sales, rentals, investment, management, and international relocation in Cyprus.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'invest',
        title: 'Invest with us intro',
        description: 'Shown when visitors open Invest with us on the services page.',
        fields: [
          f('eyebrow', 'Small label', 'United Services'),
          f('heading', 'Heading', 'Invest with us'),
          f(
            'description',
            'Intro text',
            'Real plots, clear concepts and accountable numbers—coordinated with our legal, design and construction partners from day one, not off-the-shelf products.',
            'textarea',
            4,
          ),
        ],
      },
      {
        id: 'invest_body',
        title: 'Invest with us story',
        description: 'Main Invest With Us article copy.',
        fields: [
          f('eyebrow', 'Small label', 'United Services'),
          f('heading', 'Heading', 'Invest With Us'),
          f(
            'p1',
            'Paragraph 1',
            'Investing with United Properties means entering carefully curated opportunities, not mass‑market products. Each investment package is built around a specific plot of land and a clear story: what can be created there, who it will serve, and how it can perform in today’s market.',
            'textarea',
            4,
          ),
          f(
            'p2',
            'Paragraph 2',
            'For every project, we study the planning zone and building density to understand exactly what is possible on the land. Then, together with our trusted architects, engineers and construction partners, we shape a concept that fits both the plot and the neighbourhood. Your numbers are grounded in real design and real build costs, not rough estimates.',
            'textarea',
            4,
          ),
          f(
            'p3',
            'Paragraph 3',
            'Market data and local insight allow us to forecast achievable selling prices or rental rates, and to translate them into a clear picture of total investment, expected returns and timeline. Behind each forecast stands a tightly connected team of professionals: legal advisors, designers and contractors who work in sync with United Properties. Everything you see in our investment packages is the result of this united network working as one.',
            'textarea',
            5,
          ),
          f(
            'p4',
            'Paragraph 4',
            'You are never just "buying a project on paper". You are partnering with a boutique agency that brings all key partners under one roof – lawyers, architects, engineers and constructors – so your investment benefits from a coordinated, end‑to‑end approach.',
            'textarea',
            4,
          ),
        ],
      },
      {
        id: 'invest_process',
        title: 'Invest process',
        description: 'How it works timeline — six stages.',
        fields: [
          f('eyebrow', 'Small label', 'Process'),
          f('heading', 'Heading', 'How it works'),
          f(
            'lead',
            'Supporting text',
            'From land sourcing to coordinated delivery—six deliberate stages with one boutique team at the centre.',
            'textarea',
            3,
          ),
          f('step1_title', 'Step 1 title', 'We discover the right plot'),
          f(
            'step1_body',
            'Step 1 text',
            'We source and evaluate land in locations with real demand and long‑term potential, checking planning zones, density and access so the foundations are right from day one.',
            'textarea',
            3,
          ),
          f('step2_title', 'Step 2 title', 'We shape the concept with our partners'),
          f(
            'step2_body',
            'Step 2 text',
            'Working closely with our architects and engineers, we define what should be built on the plot – from unit mix to overall design – ensuring it fits both regulations and future buyers or tenants.',
            'textarea',
            3,
          ),
          f('step3_title', 'Step 3 title', 'We build a realistic budget'),
          f(
            'step3_body',
            'Step 3 text',
            'With input from our construction partners, we translate the concept into a detailed cost plan, including construction, professional fees, permits and contingencies, so you see the full picture of what the project will require.',
            'textarea',
            3,
          ),
          f('step4_title', 'Step 4 title', 'We map the market and returns'),
          f(
            'step4_body',
            'Step 4 text',
            'Using local comparables and current demand, we estimate selling prices or rentals and project the potential income of the finished development, including expected ROI and time horizon.',
            'textarea',
            3,
          ),
          f('step5_title', 'Step 5 title', 'We design the investment structure'),
          f(
            'step5_body',
            'Step 5 text',
            'Together with our legal partners, we propose a structure that suits your profile – whether that is a private investment, joint venture or dedicated SPV – always with clarity around roles, responsibilities and exit.',
            'textarea',
            3,
          ),
          f('step6_title', 'Step 6 title', 'We coordinate the journey, together'),
          f(
            'step6_body',
            'Step 6 text',
            'Once you decide to move forward, United Properties stands at the centre, coordinating legal, technical and construction teams and keeping everyone aligned. All key partners are united under one boutique umbrella, so your path from land to completed asset is as smooth and transparent as possible.',
            'textarea',
            4,
          ),
        ],
      },
      {
        id: 'invest_network',
        title: 'Invest network',
        description: 'Private network access ticket block.',
        fields: [
          f('badge', 'Badge', 'Private network access'),
          f('heading', 'Heading', 'A curated, united network of experts'),
          f(
            'body',
            'Supporting text',
            'Behind every package stands a small, carefully chosen team: lawyers who understand Cyprus real estate, architects and engineers who design with both efficiency and lifestyle in mind, and constructors who deliver the quality we promise. United Properties brings these key partners together, aligning their expertise around your project so you can invest with confidence.',
            'textarea',
            4,
          ),
        ],
      },
      {
        id: 'management',
        title: 'Property management',
        description: 'Shown when visitors open Property Management on the services page.',
        fields: [
          f('eyebrow', 'Small label', 'United Services'),
          f('heading', 'Heading', 'Property management'),
          f(
            'description',
            'Intro text',
            'Hands-on care for your Cyprus asset — tenancy, maintenance, reporting, and owner peace of mind.',
            'textarea',
            3,
          ),
          f(
            'body',
            'Section body',
            'We look after let and owner-occupied homes with the same standard as our sales advisory: vetted contractors, clear communication, and reporting you can share with family or partners abroad.',
            'textarea',
            4,
          ),
        ],
      },
      {
        id: 'rent_property',
        title: 'Rent your property',
        description: 'Shown when visitors open Rent your property on the services page.',
        fields: [
          f('eyebrow', 'Small label', 'United Services'),
          f('heading', 'Heading', 'Rent your property'),
          f(
            'description',
            'Intro text',
            'Let us position, market, and let your residence to the right tenant — discreetly and professionally.',
            'textarea',
            3,
          ),
          f(
            'body',
            'Section body',
            'From photography and listing strategy to tenant screening and handover, we treat your home as a premium product — not a generic rental.',
            'textarea',
            4,
          ),
        ],
      },
      {
        id: 'cta',
        title: 'Bottom call to action',
        description: 'Closing banner on the Services page.',
        fields: [
          f('heading', 'Heading', 'Discuss Your Property Goals With Our Advisory Team'),
        ],
      },
    ],
  },
  {
    id: 'sell',
    title: 'Sell with us',
    description: 'Sell With Us page — problem, process, proof, and comparison.',
    path: '/sell-with-us',
    sections: [
      {
        id: 'hero',
        title: 'Page intro',
        description: 'Top banner on Sell with us.',
        fields: [
          f('eyebrow', 'Small label', 'United Services'),
          f('heading', 'Heading', 'Sell With Confidence. Sell With United.'),
          f(
            'description',
            'Supporting text',
            'A boutique agency. A bespoke process. Your property deserves more than a listing — it deserves a strategy.',
            'textarea',
            3,
          ),
          f('cta_primary', 'Primary button', 'Book a Valuation Call'),
          f('cta_secondary', 'Secondary button', 'Explore all services'),
        ],
      },
      {
        id: 'problem',
        title: 'The problem',
        description: 'StoryBrand problem hook.',
        fields: [
          f('label', 'Section label', 'Section 1 — The problem'),
          f('label_note', 'Label note', '(StoryBrand hook)'),
          f('heading', 'Heading', 'The problem'),
          f('lead', 'Lead text', "Speak directly to the client's frustration:"),
          f(
            'body',
            'Body text',
            'Most sellers are handed a sign, listed on a portal, and left waiting. No strategy. No updates. No real guidance. At United Properties, we do things differently.',
            'textarea',
            4,
          ),
        ],
      },
      {
        id: 'process',
        title: 'Selling process',
        description: 'Six-step bespoke selling process.',
        fields: [
          f('label', 'Section label', 'Section 2 — Our bespoke selling process'),
          f('label_note', 'Label note', '(step by step)'),
          f('heading', 'Heading', 'Our bespoke selling process'),
          f(
            'lead',
            'Supporting text',
            'This is your core differentiator. Show the journey, not just the outcome.',
            'textarea',
            2,
          ),
          f('step1_title', 'Step 1 title', 'Step 1 — Discovery Consultation'),
          f(
            'step1_body',
            'Step 1 text',
            'We start with a conversation, not a valuation. We learn about your property, your timeline, your expectations — and we build a strategy around you.',
            'textarea',
            3,
          ),
          f('step2_title', 'Step 2 title', 'Step 2 — Bespoke Property Valuation'),
          f(
            'step2_body',
            'Step 2 text',
            "Our valuation is not pulled from a database. It's built on deep local knowledge of Limassol's market, recent transactions, and your property's unique attributes.",
            'textarea',
            3,
          ),
          f('step3_title', 'Step 3 title', 'Step 3 — Tailored Marketing Plan'),
          f(
            'step3_body',
            'Step 3 text',
            'Every property gets a custom marketing plan — professional photography, cinematic video, targeted digital campaigns, and access to our private network of buyers and investors.',
            'textarea',
            3,
          ),
          f('step4_title', 'Step 4 title', 'Step 4 — Curated Buyer Matching'),
          f(
            'step4_body',
            'Step 4 text',
            "We don't blast your listing to everyone. We match it to the right buyers from our network — qualified, serious, and aligned with your property's value.",
            'textarea',
            3,
          ),
          f('step5_title', 'Step 5 title', 'Step 5 — Negotiation & Advisory'),
          f(
            'step5_body',
            'Step 5 text',
            'We negotiate on your behalf with full transparency. You are informed at every step, never left guessing.',
            'textarea',
            3,
          ),
          f('step6_title', 'Step 6 title', 'Step 6 — Seamless Closing'),
          f(
            'step6_body',
            'Step 6 text',
            "From legal coordination with our trusted partners to final handover — we manage every detail so you don't have to.",
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'why',
        title: 'Why United Properties',
        description: 'Five differentiator points.',
        fields: [
          f('label', 'Section label', 'Section 3 — Why United Properties'),
          f('heading', 'Heading', 'Why United Properties'),
          f('intro', 'Intro text', 'Built around your real differentiators:'),
          f('point1_title', 'Point 1 title', 'Boutique attention'),
          f(
            'point1_body',
            'Point 1 text',
            'We work with a select number of sellers at a time, so your property always comes first',
            'textarea',
            2,
          ),
          f('point2_title', 'Point 2 title', 'Bespoke strategy'),
          f(
            'point2_body',
            'Point 2 text',
            'No template. Every sale is planned and executed around your specific goals',
            'textarea',
            2,
          ),
          f('point3_title', 'Point 3 title', 'All-in-one support'),
          f(
            'point3_body',
            'Point 3 text',
            'Legal, marketing, negotiation, and aftercare united under one roof',
            'textarea',
            2,
          ),
          f('point4_title', 'Point 4 title', 'Local expertise'),
          f(
            'point4_body',
            'Point 4 text',
            "Deep knowledge of Limassol's luxury and residential market",
            'textarea',
            2,
          ),
          f('point5_title', 'Point 5 title', 'MBA-level advisory'),
          f(
            'point5_body',
            'Point 5 text',
            'Data-informed decisions, investment thinking, and honest guidance',
            'textarea',
            2,
          ),
        ],
      },
      {
        id: 'proof',
        title: 'Social proof',
        description: 'Proof bullets and testimonial placeholders.',
        fields: [
          f('label', 'Section label', 'Section 4 — Social proof'),
          f('heading', 'Heading', 'Social proof'),
          f(
            'lead',
            'Supporting text',
            "We don't measure success in listings. We measure it in results — and relationships.",
            'textarea',
            2,
          ),
          f('bullet1', 'Bullet 1', 'Proven track record in Cyprus market'),
          f('bullet2', 'Bullet 2', 'Successful investment outcomes, many happy clients'),
          f(
            'placeholder_note',
            'Placeholder note',
            'Placeholder for 2–3 testimonials once collected.',
          ),
          f('testimonial1', 'Testimonial 1', 'Client testimonial — to be added.', 'textarea', 2),
          f('testimonial2', 'Testimonial 2', 'Client testimonial — to be added.', 'textarea', 2),
        ],
      },
      {
        id: 'compare',
        title: 'United vs traditional',
        description: 'Comparison table — five rows.',
        fields: [
          f('label', 'Section label', 'Section 5 — The United difference'),
          f('label_note', 'Label note', '(United vs. traditional)'),
          f('heading', 'Heading', 'United vs. traditional'),
          f('lead', 'Supporting text', 'A simple visual contrast:'),
          f('col_traditional', 'Traditional column header', 'Traditional Agency'),
          f('col_united', 'United column header', 'United Properties'),
          f('row1_traditional', 'Row 1 — Traditional', 'Volume-focused'),
          f('row1_united', 'Row 1 — United', 'Relationship-focused'),
          f('row2_traditional', 'Row 2 — Traditional', 'Standard listing'),
          f('row2_united', 'Row 2 — United', 'Bespoke strategy'),
          f('row3_traditional', 'Row 3 — Traditional', 'You wait for calls'),
          f('row3_united', 'Row 3 — United', 'We keep you informed'),
          f('row4_traditional', 'Row 4 — Traditional', 'Generic marketing'),
          f('row4_united', 'Row 4 — United', 'Cinematic, tailored campaigns'),
          f('row5_traditional', 'Row 5 — Traditional', 'Commission-only mindset'),
          f('row5_united', 'Row 5 — United', 'Outcome-driven advisory'),
        ],
      },
      {
        id: 'cta',
        title: 'Bottom call to action',
        description: 'Closing banner on Sell with us.',
        fields: [
          f('heading', 'Heading', 'Ready to talk strategy?'),
          f(
            'description',
            'Supporting text',
            'Book a valuation call with our team — confidential, structured, and tailored to your property.',
            'textarea',
            3,
          ),
        ],
      },
    ],
  },
  {
    id: 'properties',
    title: 'Properties',
    description:
      'Buy, rent, sold, rented, featured, and signature listing pages — heroes, discovery intros, and results chrome.',
    path: '/buy',
    sections: [
      {
        id: 'hero_buy',
        title: 'Buy hero',
        description: 'Top banner when browsing for sale.',
        fields: [
          f('eyebrow', 'Small label', 'Buy in Limassol'),
          f('title', 'Heading', 'Your New Home Awaits'),
          f(
            'description',
            'Supporting text',
            'Explore curated residences in Limassol — from seafront apartments to family villas and investment opportunities.',
            'textarea',
            3,
          ),
          f('jump_cta', 'Jump button', 'Jump to Listings'),
        ],
      },
      {
        id: 'hero_rent',
        title: 'Rent hero',
        description: 'Top banner when browsing rentals.',
        fields: [
          f('eyebrow', 'Small label', 'Rent in Limassol'),
          f('title', 'Heading', 'Exclusive Rental Homes'),
          f(
            'description',
            'Supporting text',
            'Browse premium apartments, villas, and furnished residences in Limassol — short and long-term.',
            'textarea',
            3,
          ),
          f('jump_cta', 'Jump button', 'Jump to Listings'),
        ],
      },
      {
        id: 'hero_sold',
        title: 'Sold hero',
        description: 'Top banner for sold listings.',
        fields: [
          f('eyebrow', 'Small label', 'Sold by United Properties'),
          f('title', 'Heading', 'Sold Properties'),
          f(
            'description',
            'Supporting text',
            'Homes successfully sold through United Properties.',
            'textarea',
            2,
          ),
          f('jump_cta', 'Jump button', 'Jump to Listings'),
        ],
      },
      {
        id: 'hero_rented',
        title: 'Rented hero',
        description: 'Top banner for rented listings.',
        fields: [
          f('eyebrow', 'Small label', 'Let by United Properties'),
          f('title', 'Heading', 'Rented Properties'),
          f(
            'description',
            'Supporting text',
            'Homes and apartments successfully leased through our team.',
            'textarea',
            2,
          ),
          f('jump_cta', 'Jump button', 'Jump to Listings'),
        ],
      },
      {
        id: 'hero_featured',
        title: 'Featured listings hero',
        description: 'Top banner on /featured-properties.',
        fields: [
          f('eyebrow', 'Small label', 'Featured'),
          f('title', 'Heading', 'Featured Properties'),
          f(
            'description',
            'Supporting text',
            'A curated selection of our most compelling homes currently available in Cyprus.',
            'textarea',
            3,
          ),
          f('jump_cta', 'Jump button', 'Jump to Listings'),
        ],
      },
      {
        id: 'hero_signature',
        title: 'Signature listings hero',
        description: 'Top banner on /signature-listings.',
        fields: [
          f('eyebrow', 'Small label', 'Signature Collection'),
          f('title', 'Heading', 'Signature Listings'),
          f(
            'description',
            'Supporting text',
            'Our most exclusive addresses — trophy homes and standout residences across Cyprus.',
            'textarea',
            3,
          ),
          f('jump_cta', 'Jump button', 'Jump to Listings'),
        ],
      },
      {
        id: 'discovery_buy',
        title: 'Buy discovery',
        description: 'Listing section intro for buy mode.',
        fields: [
          f('eyebrow', 'Small label', 'United Properties · Limassol'),
          f('title', 'Heading', 'Browse listings'),
          f(
            'description',
            'Supporting text',
            'Apartments, villas, and investment homes in Limassol and surrounding neighbourhoods we serve.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'discovery_rent',
        title: 'Rent discovery',
        description: 'Listing section intro for rent mode.',
        fields: [
          f('eyebrow', 'Small label', 'Limassol rentals'),
          f('title', 'Heading', 'Homes & apartments to lease'),
          f(
            'description',
            'Supporting text',
            'Long-term and seasonal lets across prime Limassol districts — curated by our team.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'discovery_sold',
        title: 'Sold discovery',
        description: 'Listing section intro for sold mode.',
        fields: [
          f('eyebrow', 'Small label', 'Completed sales'),
          f('title', 'Heading', 'Recently sold properties'),
          f(
            'description',
            'Supporting text',
            'A selection of homes successfully placed by United Properties.',
            'textarea',
            2,
          ),
        ],
      },
      {
        id: 'discovery_rented',
        title: 'Rented discovery',
        description: 'Listing section intro for rented mode.',
        fields: [
          f('eyebrow', 'Small label', 'Let by United Properties'),
          f('title', 'Heading', 'Recently rented properties'),
          f(
            'description',
            'Supporting text',
            'Homes and apartments successfully leased through our team.',
            'textarea',
            2,
          ),
        ],
      },
      {
        id: 'discovery_featured',
        title: 'Featured discovery',
        description: 'Listing section intro on /featured-properties.',
        fields: [
          f('eyebrow', 'Small label', 'United Properties'),
          f('title', 'Heading', 'Featured homes'),
          f(
            'description',
            'Supporting text',
            'Hand-picked listings our advisors are highlighting this season.',
            'textarea',
            2,
          ),
        ],
      },
      {
        id: 'discovery_signature',
        title: 'Signature discovery',
        description: 'Listing section intro on /signature-listings.',
        fields: [
          f('eyebrow', 'Small label', 'Signature Collection'),
          f('title', 'Heading', 'Exclusive addresses'),
          f(
            'description',
            'Supporting text',
            'Trophy homes and standout residences from our signature collection.',
            'textarea',
            2,
          ),
        ],
      },
      {
        id: 'results',
        title: 'Results chrome',
        description: 'Count, load more, and empty state labels.',
        fields: [
          f('count_suffix', 'Count suffix', 'matching properties'),
          f('load_more', 'Load more button', 'Load More'),
          f('empty_heading', 'Empty heading', 'No properties match your filters'),
          f(
            'empty_body',
            'Empty text',
            'Adjust your criteria to discover more listings.',
            'textarea',
            2,
          ),
        ],
      },
    ],
  },
  {
    id: 'agents',
    title: 'Agents',
    description: 'Advisory team listing page.',
    path: '/agents',
    sections: [
      {
        id: 'hero',
        title: 'Page intro',
        description: 'Top banner on the Agents page.',
        fields: [
          f('eyebrow', 'Small label', 'Advisory Team'),
          f('heading', 'Heading', 'Meet Our Real Estate Professionals'),
          f(
            'description',
            'Intro text',
            'Specialists in luxury homes, investments, portfolio strategy, and international client guidance across Cyprus.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'list',
        title: 'Advisor list',
        description: 'Filter and grid heading.',
        fields: [
          f('heading', 'Heading', 'Advisors by Specialization'),
          f('filter_label', 'Filter label', 'Filter by specialty'),
          f('filter_all', 'All specialties option', 'All specialties'),
        ],
      },
    ],
  },
  {
    id: 'not-found',
    title: '404 page',
    description: 'Page not found screen.',
    path: '/404',
    sections: [
      {
        id: 'hero',
        title: 'Not found message',
        description: 'Copy shown when a route does not exist.',
        fields: [
          f('code', 'Error code', '404'),
          f('heading', 'Heading', 'Page Not Found'),
          f(
            'description',
            'Supporting text',
            'The page you are looking for does not exist or has moved.',
            'textarea',
            2,
          ),
          f('cta', 'Button label', 'Back to Home'),
        ],
      },
    ],
  },
  {
    id: 'property',
    title: 'Property details',
    description: 'Static labels and chrome on individual property pages (not listing data).',
    path: '/properties',
    sections: [
      {
        id: 'not_found',
        title: 'Listing not found',
        description: 'Shown when a property slug is missing.',
        fields: [
          f('heading', 'Heading', 'Property not found'),
          f(
            'body',
            'Supporting text',
            'This listing may have been removed or the link is incorrect.',
            'textarea',
            2,
          ),
          f('cta', 'Button label', 'Browse properties'),
          f('loading', 'Loading text', 'Loading property…'),
        ],
      },
      {
        id: 'actions',
        title: 'Actions',
        description: 'Brochure and WhatsApp action labels.',
        fields: [
          f('brochure_fallback', 'Brochure button', 'Download brochure (PDF)'),
          f('pdf_title', 'Download PDF button', 'Download PDF'),
          f('whatsapp_title', 'WhatsApp title', 'Chat on WhatsApp'),
          f('whatsapp_sub', 'WhatsApp subtitle', 'FAST REPLY · SAME DAY'),
        ],
      },
      {
        id: 'stats',
        title: 'Stat labels',
        description: 'Labels next to property facts.',
        fields: [
          f('label_bedrooms', 'Bedrooms label', 'Bedrooms'),
          f('label_bathrooms', 'Bathrooms label', 'Bathrooms'),
          f('label_sqm', 'Internal area label', 'sqm internal area'),
          f('label_plot', 'Plot size label', 'sqm plot size'),
          f('label_parking', 'Parking label', 'Parking'),
          f('label_built', 'Year built prefix', 'Built in'),
          f('price_period', 'Rent period', '/ month'),
        ],
      },
      {
        id: 'description',
        title: 'Description block',
        description: 'Description section headings and toggles.',
        fields: [
          f('eyebrow', 'Small label', 'Listing'),
          f('heading', 'Heading', 'Description'),
          f('read_more', 'Read more', 'Read full description'),
          f('show_less', 'Show less', 'Show less'),
          f('amenities_heading', 'Amenities heading', 'Amenities & features'),
        ],
      },
      {
        id: 'info_tiles',
        title: 'Info tiles',
        description: 'Floor plan and location tiles.',
        fields: [
          f('floorplan_heading', 'Floor plan heading', 'Floor plan'),
          f(
            'floorplan_empty',
            'Floor plan empty text',
            'Detailed layout available on request from our team.',
            'textarea',
            2,
          ),
          f('floorplan_hint_has', 'Floor plan hint (has plan)', 'Listing'),
          f('floorplan_hint_request', 'Floor plan hint (request)', 'Request'),
          f('location_heading', 'Location heading', 'Location'),
          f(
            'location_body',
            'Location text',
            'Map and neighbourhood context — integration in progress.',
            'textarea',
            2,
          ),
          f('location_hint', 'Location hint', 'Soon'),
        ],
      },
      {
        id: 'agent',
        title: 'Agent card',
        description: 'Property consultant card labels.',
        fields: [
          f('eyebrow', 'Small label', 'Your property consultant'),
          f('profile_cta', 'Profile link', 'View agent profile'),
        ],
      },
      {
        id: 'similar',
        title: 'Similar properties',
        description: 'Similar listings section chrome.',
        fields: [
          f('eyebrow', 'Small label', 'Curated for you'),
          f('heading', 'Heading', 'Similar Properties'),
          f(
            'description',
            'Supporting text',
            'More listings that fit this home—matched by area, status, or price band. Open any card for the full story.',
            'textarea',
            3,
          ),
          f('view_all', 'View all link', 'View all in Limassol'),
          f('hint_area', 'Match hint — area', 'Area & district'),
          f('hint_status', 'Match hint — status', 'Status'),
          f('hint_price', 'Match hint — price', 'Price band'),
          f('empty_prefix', 'Empty link text', 'Browse all properties'),
          f('empty_suffix', 'Empty trailing text', ' to discover more listings.'),
        ],
      },
    ],
  },
  {
    id: 'concierge',
    title: 'Concierge',
    description: 'Lifestyle and relocation concierge page.',
    path: '/concierge',
    sections: [
      {
        id: 'hero',
        title: 'Page intro',
        description: 'Top banner on the Concierge page.',
        fields: [
          f('eyebrow', 'Small label', 'United Concierge'),
          f('heading', 'Heading', 'A private lifestyle desk for Cyprus living'),
          f(
            'description',
            'Intro text',
            'Beyond the transaction — introductions, relocation support, and day-to-day living arranged with discretion.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'story',
        title: 'Story',
        description: 'Main concierge narrative.',
        fields: [
          f('eyebrow', 'Small label', 'How we help'),
          f('heading', 'Heading', 'Arrive, settle, and live well'),
          f(
            'body',
            'Body',
            'Whether you are buying a first home, relocating a family, or keeping a holiday residence ready, our concierge desk coordinates trusted local partners so you can focus on the life you came for.',
            'textarea',
            5,
          ),
        ],
      },
      {
        id: 'services',
        title: 'Concierge services',
        description: 'Three service highlights.',
        fields: [
          f('point1_title', 'Point 1 title', 'Relocation'),
          f('point1_body', 'Point 1 text', 'School, banking, and settling-in introductions for new residents.', 'textarea', 2),
          f('point2_title', 'Point 2 title', 'Home readiness'),
          f('point2_body', 'Point 2 text', 'Housekeeping, maintenance, and seasonal opening of holiday homes.', 'textarea', 2),
          f('point3_title', 'Point 3 title', 'Lifestyle'),
          f('point3_body', 'Point 3 text', 'Dining, yachting, and private experiences arranged on request.', 'textarea', 2),
        ],
      },
      {
        id: 'cta',
        title: 'Call to action',
        description: 'Closing invitation.',
        fields: [
          f('heading', 'Heading', 'Tell us what you need arranged'),
          f(
            'description',
            'Supporting text',
            'Share your brief with our team and we will propose a discreet, practical plan.',
            'textarea',
            3,
          ),
          f('button', 'Button label', 'Contact concierge'),
        ],
      },
    ],
  },
  {
    id: 'video',
    title: 'Brand video',
    description: 'Dedicated watch page for the homepage showcase film.',
    path: '/videos/luxury-real-estate-cyprus',
    sections: [
      {
        id: 'hero',
        title: 'Page intro',
        description: 'Top banner above the player.',
        fields: [
          f('eyebrow', 'Small label', 'Video'),
          f('heading', 'Heading', 'Luxury real estate in Cyprus'),
          f(
            'description',
            'Intro text',
            'Our signature showcase film — the same reel featured on the homepage, on a page built for search engines and viewers.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'body',
        title: 'Below the player',
        description: 'Copy and buttons under the video.',
        fields: [
          f(
            'paragraph',
            'Body',
            'Discover curated villas, apartments, and penthouses across Cyprus — from Limassol seafront to elevated hillside homes. This video introduces our brand experience; browse live listings anytime from the properties hub.',
            'textarea',
            4,
          ),
          f('btn_listings', 'Listings button', 'View properties'),
          f('btn_home', 'Home button', 'Back to home'),
        ],
      },
      {
        id: 'seo',
        title: 'Search & social',
        description: 'Title and description used for search engines and social previews.',
        fields: [
          f('title', 'Page title', 'Luxury Real Estate Cyprus — Brand Video | United Properties'),
          f(
            'description',
            'Meta description',
            'Watch our United Properties showcase video: luxury homes, seafront living, and premium real estate across Cyprus. Filmed for clients exploring Limassol and beyond.',
            'textarea',
            3,
          ),
          f('json_name', 'Video name (SEO)', 'United Properties — Luxury Real Estate in Cyprus'),
        ],
      },
    ],
  },
  {
    id: 'cookies',
    title: 'Cookie preferences',
    description: 'Cookie banner and preference labels shown site-wide.',
    path: '/',
    sections: [
      {
        id: 'modal',
        title: 'Banner copy',
        description: 'Headline, lead, and primary buttons.',
        fields: [
          f('eyebrow', 'Small label', 'United Properties'),
          f('heading', 'Heading', 'Your privacy, our standard'),
          f(
            'lead',
            'Intro text',
            'We use essential cookies to keep unitedproperties.eu secure, and optional ones only with your consent — so your browsing stays as refined as our homes.',
            'textarea',
            3,
          ),
          f('accept', 'Accept all button', 'Accept all'),
          f('essential', 'Essential only button', 'Essential only'),
          f('customize', 'Customize label', 'Customize categories'),
          f('save', 'Save choices button', 'Save choices'),
          f('hint', 'Footer hint', 'Saved on this device. Change anytime via the cookie icon.'),
          f('launcher_label', 'Icon button label', 'Cookie preferences'),
          f('close_label', 'Close button label', 'Close'),
        ],
      },
      {
        id: 'categories',
        title: 'Categories',
        description: 'Names and descriptions for each cookie group.',
        fields: [
          f('necessary_title', 'Necessary title', 'Strictly necessary'),
          f('necessary_body', 'Necessary text', 'Security, navigation, and core features — always on.', 'textarea', 2),
          f('functional_title', 'Functional title', 'Functional'),
          f('functional_body', 'Functional text', 'Saves preferences and improves usability.', 'textarea', 2),
          f('analytics_title', 'Analytics title', 'Analytics & performance'),
          f('analytics_body', 'Analytics text', 'Helps us measure traffic, speed, and improve the site.', 'textarea', 2),
        ],
      },
    ],
  },
  {
    id: 'inquiry',
    title: 'Enquiry form',
    description: 'Shared inquiry / consultation form labels and messages.',
    path: '/contact',
    sections: [
      {
        id: 'form',
        title: 'Form copy',
        description: 'Header, field labels, and status messages.',
        fields: [
          f('eyebrow', 'Small label', 'Private inquiry'),
          f('heading', 'Heading', 'Request a private consultation'),
          f(
            'lede',
            'Supporting text',
            'Share a few details and we will respond with tailored guidance for your brief.',
            'textarea',
            3,
          ),
          f('trust1', 'Trust point 1', 'Reply within one business day'),
          f('trust2', 'Trust point 2', 'Your details stay confidential'),
          f('label_name', 'Name label', 'Full name'),
          f('label_email', 'Email label', 'Email'),
          f('label_phone', 'Phone label', 'Phone'),
          f('label_subject', 'Subject label', 'Subject'),
          f('placeholder_subject', 'Subject placeholder', 'Buying / renting / investment'),
          f('label_property', 'Property interest label', 'Interested property'),
          f('optional', 'Optional marker', '(optional)'),
          f('label_preferred', 'Preferred contact label', 'Preferred contact'),
          f('option_email', 'Preferred — Email', 'Email'),
          f('option_phone', 'Preferred — Phone', 'Phone'),
          f('option_whatsapp', 'Preferred — WhatsApp', 'WhatsApp'),
          f('label_message', 'Message label', 'Message'),
          f('submit', 'Submit button', 'Send inquiry'),
          f('submitting', 'Submitting label', 'Sending…'),
          f(
            'footnote',
            'Footnote',
            'No spam. We only use your details to respond to this request.',
            'textarea',
            2,
          ),
          f(
            'success',
            'Success message',
            'Inquiry sent. Our team will contact you shortly.',
            'textarea',
            2,
          ),
        ],
      },
    ],
  },
  {
    id: 'footer',
    title: 'Footer',
    description: 'Sitewide footer — brand, links, contact, and newsletter.',
    path: '/',
    sections: [
      {
        id: 'brand',
        title: 'Brand',
        description: 'Footer brand tagline.',
        fields: [
          f(
            'tagline',
            'Tagline',
            'Bespoke real estate advisory for premium Cyprus homes, investments, and international relocation.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'quick_links',
        title: 'Quick links',
        description: 'Quick links column.',
        fields: [
          f('heading', 'Heading', 'Quick Links'),
          f('link_home', 'Home link', 'Home'),
          f('link_properties', 'Properties link', 'Properties'),
          f('link_about', 'About link', 'About'),
          f('link_video', 'Brand video link', 'Brand video'),
        ],
      },
      {
        id: 'services',
        title: 'Services list',
        description: 'Services column items.',
        fields: [
          f('heading', 'Heading', 'Services'),
          f('item1', 'Item 1', 'Property Sales'),
          f('item2', 'Item 2', 'Luxury Rentals'),
          f('item3', 'Item 3', 'Property Management'),
          f('item4', 'Item 4', 'Relocation Support'),
        ],
      },
      {
        id: 'contact',
        title: 'Contact',
        description: 'Footer contact details.',
        fields: [
          f('heading', 'Heading', 'Contact'),
          f('address', 'Address', '18 Marina Avenue, Limassol, Cyprus'),
          f('email', 'Email', 'info@unitedproperties.eu'),
          f('phone', 'Phone', '+357 25 123 456'),
        ],
      },
      {
        id: 'newsletter',
        title: 'Newsletter',
        description: 'Newsletter signup strip.',
        fields: [
          f('heading', 'Heading', 'Private Market Updates'),
          f('placeholder', 'Email placeholder', 'Enter your email'),
          f('submit', 'Subscribe button', 'Subscribe'),
        ],
      },
      {
        id: 'legal',
        title: 'Legal',
        description: 'Copyright line.',
        fields: [f('rights', 'Rights text', 'All rights reserved')],
      },
    ],
  },
  {
    id: 'navbar',
    title: 'Navbar',
    description: 'Sitewide navigation — ticker, main links, and services dropdown.',
    path: '/',
    sections: [
      {
        id: 'ticker',
        title: 'Premium services ticker',
        description: 'Scrolling strip above the main nav.',
        fields: [
          f('item1', 'Ticker item 1', 'Luxury sales & long-term lettings'),
          f('item2', 'Ticker item 2', 'Private valuations & viewings'),
          f('item3', 'Ticker item 3', 'Investment & relocation advisory'),
          f('item4', 'Ticker item 4', 'Featured listings & signature collection'),
          f('item5', 'Ticker item 5', 'International private clients'),
          f('item6', 'Ticker item 6', 'Concierge property management'),
        ],
      },
      {
        id: 'nav',
        title: 'Main navigation',
        description: 'Center nav link labels.',
        fields: [
          f('buy', 'Buy', 'Buy'),
          f('rent', 'Rent', 'Rent'),
          f('services', 'United Services', 'United Services'),
          f('about', 'About', 'About'),
          f('contact', 'Contact', 'Contact'),
        ],
      },
      {
        id: 'services_dropdown',
        title: 'Services dropdown',
        description: 'United Services menu items.',
        fields: [
          f('sell', 'Sell with us', 'Sell with us'),
          f('invest', 'Invest with us', 'Invest with us'),
          f('management', 'Property Management', 'Property Management'),
          f('rent_property', 'Rent your property', 'Rent your property'),
          f('concierge', 'Concierge', 'Concierge'),
        ],
      },
    ],
  },
  {
    id: 'search',
    title: 'Search panel',
    description: 'Global property search overlay headings and labels.',
    path: '/',
    sections: [
      {
        id: 'head',
        title: 'Panel header',
        description: 'Title area at the top of the search panel.',
        fields: [
          f('eyebrow', 'Small label', 'United Properties · Search'),
          f('heading', 'Heading', 'Explore listings'),
          f(
            'description',
            'Supporting text',
            'Narrow your criteria in the filter column — results and map update as you go.',
            'textarea',
            3,
          ),
        ],
      },
      {
        id: 'filters',
        title: 'Filters',
        description: 'Search bar and filter labels.',
        fields: [
          f('location_label', 'Location label', 'Location'),
          f('category_label', 'Listing type label', 'Listing type'),
          f('clear', 'Clear button', 'Clear all'),
          f(
            'search_placeholder',
            'Search placeholder',
            'Search properties, locations, featured...',
          ),
        ],
      },
      {
        id: 'map',
        title: 'Map',
        description: 'Map section heading.',
        fields: [f('heading', 'Heading', 'Explore Cyprus on Map')],
      },
      {
        id: 'empty',
        title: 'Empty state',
        description: 'Shown when no listings match.',
        fields: [
          f('title', 'Empty heading', 'No matches'),
          f(
            'hint',
            'Empty hint',
            'Relax a filter or clear the search to see more listings.',
            'textarea',
            2,
          ),
        ],
      },
      {
        id: 'stat',
        title: 'Result count',
        description: 'Match / matches labels next to the count.',
        fields: [
          f('match_singular', 'Singular', 'match'),
          f('match_plural', 'Plural', 'matches'),
        ],
      },
    ],
  },
]

export function getContentPage(pageId: string): ContentPageDef | undefined {
  return CONTENT_PAGES.find((p) => p.id === pageId)
}

export function getDefaultContentMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const page of CONTENT_PAGES) {
    for (const section of page.sections) {
      for (const field of section.fields) {
        map[contentKey(page.id, section.id, field.key)] = field.defaultValue
      }
    }
  }
  return map
}

export function resolveContentValue(
  map: Record<string, string>,
  page: string,
  section: string,
  fieldKey: string,
  fallback?: string,
): string {
  const key = contentKey(page, section, fieldKey)
  const fromDb = map[key]
  if (fromDb != null && fromDb.trim() !== '') return fromDb
  if (fallback != null) return fallback
  return getDefaultContentMap()[key] ?? ''
}

export function countPageFields(page: ContentPageDef): number {
  return page.sections.reduce((sum, section) => sum + section.fields.length, 0)
}

export const CONTENT_CATALOG_GROUPS = [
  {
    id: 'website',
    title: 'Website pages',
    blurb: 'Same pages as the public site — open one and edit the words you see.',
    ids: ['home', 'about', 'contact', 'services', 'sell', 'concierge', 'video', 'agents', 'not-found'],
  },
  {
    id: 'listings',
    title: 'Property pages',
    blurb: 'Buy / rent listings and the single property detail page.',
    ids: ['properties', 'property'],
  },
  {
    id: 'sitewide',
    title: 'On every page',
    blurb: 'Menu, footer, search, enquiry form, and cookie banner.',
    ids: ['navbar', 'footer', 'search', 'inquiry', 'cookies'],
  },
] as const

export function getContentCatalogGroups(): Array<{
  id: string
  title: string
  blurb: string
  ids: string[]
}> {
  const listed = new Set<string>(CONTENT_CATALOG_GROUPS.flatMap((group) => [...group.ids]))
  const groups: Array<{
    id: string
    title: string
    blurb: string
    ids: string[]
  }> = CONTENT_CATALOG_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    blurb: group.blurb,
    ids: [...group.ids],
  }))
  const orphan = CONTENT_PAGES.filter((page) => !listed.has(page.id)).map((page) => page.id)
  if (orphan.length) {
    groups.push({
      id: 'other',
      title: 'Other pages',
      blurb: 'Additional editable areas from the content schema.',
      ids: orphan,
    })
  }
  return groups
}
