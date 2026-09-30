import { Category, Listing, ExperienceSlot } from "../types";

export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-walks",
    name: "Walks",
    slug: "walks",
    pillar: "walks",
    description:
      "Guided coastal village trails, harbor dawn walks, and mangrove boat safaris.",
    icon: "Compass",
    sort_order: 1,
  },
  {
    id: "cat-workshops",
    name: "Workshops",
    slug: "workshops",
    pillar: "workshops",
    description:
      "Hands-on masterclasses in net-weaving, wooden boat carpentry, and maritime crafts.",
    icon: "Hammer",
    sort_order: 2,
  },
  {
    id: "cat-food",
    name: "Food",
    slug: "food",
    pillar: "food",
    description:
      "Authentic coastal home meals, harbor dawn breakfasts, and traditional seafood dining.",
    icon: "UtensilsCrossed",
    sort_order: 3,
  },
  {
    id: "cat-goods",
    name: "Goods",
    slug: "goods",
    pillar: "goods",
    description:
      "Artisanal sun-dried catch, small-batch stoneground masalas, and estuary treasures.",
    icon: "ShoppingBag",
    sort_order: 4,
  },
];

export const SEED_LISTINGS: Listing[] = [
  // 1. Versova Coastal Heritage & Dawn Fish Auction Trail
  {
    id: "exp-versova-trail",
    title: "Versova Coastal Heritage & Dawn Fish Auction Trail",
    slug: "versova-koliwada-dawn-trail",
    category_id: "cat-walks",
    pillar: "walks",
    type: "experience",
    short_summary:
      "Experience Mumbai's historic coastal village at dawn, witness wholesale boat auctions, and enjoy an authentic home-cooked breakfast.",
    full_description:
      "Step into Versova coastal village before sunrise as the fishing fleet docks with the night's harvest. Led by Devendra Patil and local storytellers, this morning walk takes you through 16th-century historic alleys, ancestral squares, and into the epicenter of the morning fish auction where local women merchants set the city's seafood rates.\n\nAfter navigating the energetic docks and learning about traditional tidal navigation, unwind inside a family home for hot lemongrass chai, freshly prepared fish, and hand-rolled rice bhakris cooked over wood embers.",
    price_inr: 950,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    ],
    location_name: "Versova Coastal Village, Andheri West, Mumbai",
    secret_meeting_point:
      "Beside the Sacred Banyan Tree at Versova Jetty No. 1 (GPS: 19.1352° N, 72.8124° E). Guide Devendra will welcome you.",
    duration_minutes: 150,
    included_items: [
      "Guided walk led by community elder & youth historian",
      "Authentic home-cooked coastal breakfast & fresh chai",
      "Fresh coconut water at harbor",
      "Illustrated coastal fish identification guide",
    ],
    things_to_carry: [
      "Comfortable walking shoes with good grip (wet harbor surface)",
      "Reusable water bottle",
      "Camera or smartphone for dawn light photography",
    ],
    itinerary: [
      {
        time: "06:15 AM",
        title: "Gathering at Versova Jetty",
        description:
          "Welcome briefing and historical orientation on Mumbai's original coastal settlements.",
      },
      {
        time: "06:45 AM",
        title: "The Dawn Fish Auction",
        description:
          "Navigate the harbor floor as traditional trawlers land fresh catches of Pomfret, Surmai, and Prawns.",
      },
      {
        time: "07:45 AM",
        title: "Heritage Alleys & Coastal Architecture",
        description:
          "Explore traditional Gaothan architecture, ancestral drying machans, and coastal community shrines.",
      },
      {
        time: "08:30 AM",
        title: "Traditional Home Breakfast",
        description:
          "Sit down at a local family home for warm bhakri, spiced tea, and authentic seasonal fish preparation.",
      },
    ],
    is_active: true,
    is_featured: true,
    host_name: "Devendra Patil & Versova Heritage Collective",
    host_phone: "+91 98201 44512",
    host_bio:
      "Devendra is a 4th-generation coastal fisherman and community archivist preserving traditional maritime navigation.",
  },

  // 2. Thane Creek Mangrove & Flamingo Boat Safari
  {
    id: "exp-thane-flamingo",
    title: "Thane Creek Mangrove & Flamingo Boat Safari",
    slug: "thane-creek-flamingo-boat-safari",
    category_id: "cat-walks",
    pillar: "walks",
    type: "experience",
    short_summary:
      "Board a traditional shallow-draft boat through protected mangrove estuaries to witness thousands of migratory flamingos feeding at low tide.",
    full_description:
      "Thane Creek Flamingo Sanctuary is one of India's largest urban marine biodiversity havens. Embark with Ramesh Patil, a veteran boatman from the Airoli coastal collective, aboard a quiet, shaded wooden craft designed to navigate shallow mudflats.\n\nGlide past thick Avicennia and Rhizophora mangrove forests, spotting Lesser and Greater Flamingos, Western Reef Egrets, Osprey, and Mudskippers. Learn firsthand how indigenous creek communities read the lunar tides and safeguard the vital mangrove nurseries that protect Mumbai from storm surges.",
    price_inr: 1400,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    ],
    location_name: "Airoli Coastal Marine Sanctuary, Thane Creek",
    secret_meeting_point:
      "Marine Biodiversity Interpretation Centre, Jetty Pier 2, Airoli (GPS: 19.1678° N, 72.9934° E). Look for Captain Ramesh in green vest.",
    duration_minutes: 120,
    included_items: [
      "2-hour boat cruise with experienced tidal boatman",
      "Certified life jackets and maritime safety gear",
      "High-grade binoculars loan for bird spotting",
      "Coastal ecology briefing booklet",
    ],
    things_to_carry: [
      "Sun hat or cap and sunglasses",
      "Water bottle",
      "Telephoto camera or binoculars if available",
      "Valid Government Photo ID",
    ],
    itinerary: [
      {
        time: "06:45 AM",
        title: "Sanctuary Assembly & Safety Briefing",
        description:
          "Life jacket fitting and introduction to the Thane Creek Ramsar wetland ecology.",
      },
      {
        time: "07:15 AM",
        title: "Mangrove Channel Navigation",
        description:
          "Silent glide through estuary canals observing mangrove breathing roots and fiddler crabs.",
      },
      {
        time: "08:00 AM",
        title: "Flamingo Low-Tide Foraging Grounds",
        description:
          "Stationary observation of pink flamingo flocks feeding in mineral-rich shallows.",
      },
      {
        time: "08:45 AM",
        title: "Return & Traditional Herbal Tea",
        description: "Debrief at the jetty with local herbal lemongrass brew.",
      },
    ],
    is_active: true,
    is_featured: true,
    host_name: "Ramesh Patil & Airoli Boatmen Guild",
    host_phone: "+91 97692 88319",
    host_bio:
      "Ramesh has navigated the tidal currents of Thane Creek for 28 years and serves as a key community naturalist assisting wetland conservationists.",
  },

  // 3. Traditional Coastal Net-Weaving & Boat Carpentry Workshop
  {
    id: "exp-net-weaving",
    title: "Traditional Coastal Net-Weaving & Boat Carpentry Workshop",
    slug: "traditional-net-weaving-workshop",
    category_id: "cat-workshops",
    pillar: "workshops",
    type: "experience",
    short_summary:
      "Master the ancient knotting mathematics of coastal cast-nets and understand traditional teakwood boatbuilding beside Worli Fort.",
    full_description:
      "Deep inside the boatyards beneath Worli Fort, generational shipwrights and net-weavers preserve crafts that predate modern industrial vessels. In this immersive hands-on 2-hour masterclass led by Master Carpenter Nana Patil, you will work directly with bamboo needles and marine-grade cords to weave your own mini decorative souvenir net.\n\nDiscover how indigenous boatbuilders steam and bend Malabar teak, seal planks using natural resin (*Dammar*) and cotton caulking without a single iron bolt, and hear age-old folklore regarding the protective sea-god carvings adorning coastal prows.",
    price_inr: 800,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1200&q=80",
    ],
    location_name: "Worli Coastal Boatyard, Mumbai",
    secret_meeting_point:
      "Worli Coastal Boat Ramp, foot of Worli Fort steps (GPS: 19.0234° N, 72.8167° E). Guide Nana Patil will welcome you.",
    duration_minutes: 120,
    included_items: [
      "All workshop materials: traditional bamboo needle, hemp cord & frame",
      "Keepsake miniature hand-woven net crafted by you",
      "Demonstration of steam-bending boat lumber",
      "Spiced coastal chai & roasted gram snacks",
    ],
    things_to_carry: [
      "Casual clothes comfortable for workshop seating",
      "Notebook or sketchpad",
    ],
    itinerary: [
      {
        time: "04:00 PM",
        title: "Boatyard Gathering & Tool Exhibition",
        description:
          "Hands-on examination of ancestral adzes, chisels, and bone-carving tools.",
      },
      {
        time: "04:30 PM",
        title: "Cast-Net Knotting Masterclass",
        description:
          "Step-by-step guidance on creating the geometric diamond mesh used in artisanal coastal nets.",
      },
      {
        time: "05:30 PM",
        title: "Wood Caulking & Sunset Lore",
        description:
          "Demonstration of natural tree-resin waterproofing followed by sunset view from Worli Fort ramparts.",
      },
    ],
    is_active: true,
    is_featured: false,
    host_name: "Master Carpenter Nana Patil & Worli Artisans",
    host_phone: "+91 98195 21040",
    host_bio:
      "Nana Patil has crafted and restored traditional coastal fishing vessels over 40 years, keeping wooden boatbuilding techniques alive.",
  },

  // 4. Sassoon Docks Dawn Heritage Walk & Coastal Seafood Feast
  {
    id: "exp-sassoon-trail",
    title: "Sassoon Docks Dawn Heritage Walk & Coastal Seafood Feast",
    slug: "sassoon-docks-culinary-trail",
    category_id: "cat-food",
    pillar: "food",
    type: "experience",
    short_summary:
      "Explore Mumbai's first commercial wet dock established in 1875, learn to grade fresh wild catch, and enjoy a curated coastal seafood feast.",
    full_description:
      "Sassoon Docks is the vibrating heart of South Mumbai's maritime economy. Built in 1875 by David Sassoon, it continues to welcome deep-sea fishing trawlers returning from the Arabian Sea.\n\nLed by Ashwini Tandel, an acclaimed community educator and food custodian from the Colaba Coastal Collective, this dawn trail unpacks the taxonomy of western coastal fish, how to spot wild vs farmed seafood, and the cultural heritage of Mumbai's coastlines. We conclude at a restored verandah for a grand home-cooked tasting feast featuring traditional crab curry, sol kadhi, and roasted jawla chutney.",
    price_inr: 1200,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80",
    ],
    location_name: "Sassoon Docks, Colaba, South Mumbai",
    secret_meeting_point:
      "Under the Historic Sassoon Docks Clock Tower Arch, Colaba (GPS: 18.9134° N, 72.8245° E). Ashwini will wear a signature yellow scarf.",
    duration_minutes: 180,
    included_items: [
      "Expert seafood curation masterclass by community fish merchant",
      "Full 4-course traditional coastal breakfast feast",
      "Chilled digestive Sol Kadhi",
      "Illustrated coastal fish seasonality calendar",
    ],
    things_to_carry: [
      "Closed waterproof shoes (dock floors are wet)",
      "Camera with good low-light capability",
    ],
    itinerary: [
      {
        time: "05:45 AM",
        title: "Clock Tower Rendezvous",
        description:
          "Briefing on the 1875 dock infrastructure and early dockworker settlements.",
      },
      {
        time: "06:15 AM",
        title: "Trawler Landing & Sorting Floors",
        description:
          "Observe sorting of tiger prawns, squid, ribbon fish, and kingfish.",
      },
      {
        time: "07:30 AM",
        title: "Street Murals & Historic Ice Plant",
        description:
          "Tour the vibrant community street art installations and heritage ammonia ice factories.",
      },
      {
        time: "08:15 AM",
        title: "Coastal Culinary Feast & Q&A",
        description:
          "Feast on authentic recipes passed down across five generations.",
      },
    ],
    is_active: true,
    is_featured: true,
    host_name: "Ashwini Tandel & Colaba Coastal Collective",
    host_phone: "+91 99204 77158",
    host_bio:
      "Ashwini is a community activist and culinary researcher advocating for fair seafood procurement and coastal food rights.",
  },

  // 5. Artisanal Sun-Dried Jawla & Coastal Spice Basket
  {
    id: "prd-jawla-basket",
    title: "Artisanal Sun-Dried Jawla & Coastal Spice Basket",
    slug: "artisanal-jawla-koli-masala-basket",
    category_id: "cat-goods",
    pillar: "goods",
    type: "product",
    short_summary:
      "Naturally sea-breeze dried baby prawns (Jawla) paired with hand-pounded woodfire coastal red spice blend.",
    full_description:
      "A prized staple of coastal household pantries. Small baby shrimp (*Jawla*) caught by artisanal gillnets off Madh Island are sun-cured over high bamboo *machans* using clean sea-breeze drying methods that lock in intense umami without chemicals or artificial preservatives.\n\nPaired with a 250g tin of authentic Coastal Lal Masala — stone-pounded with 24 indigenous whole spices roasted over teakwood embers by the Mahila Bachat Gat. Makes sensational dry stir-fries, crispy fritters, and classic Sunday curries.",
    price_inr: 650,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1200&q=80",
    ],
    stock_count: 45,
    weight_grams: 500,
    artisan_collective: "Madh Island Coastal Mahila Bachat Gat",
    is_active: true,
    is_featured: true,
    host_name: "Shakuntala Patil & Madh Women's Collective",
    host_phone: "+91 98691 12345",
    host_bio:
      "A 22-woman self-help group dedicated to chemical-free coastal sun-drying and fair-wage artisanal food processing.",
  },

  // 6. Raw Mangrove Wild Blossom Honey (500g)
  {
    id: "prd-mangrove-honey",
    title: "Raw Mangrove Wild Blossom Honey (500g)",
    slug: "raw-mangrove-wild-honey",
    category_id: "cat-goods",
    pillar: "goods",
    type: "product",
    short_summary:
      "Pure, unpasteurized natural honey sustainably collected from wild mangrove blossoms along the estuarine creeks.",
    full_description:
      "Harvested by certified indigenous gatherers from wild *Avicennia marina* mangrove floral blossoms along the Thane Creek and Vikhroli estuaries. This honey is cold-strained through pure unbleached cotton, preserving natural bee pollen, enzymes, and rich coastal floral notes.\n\nFeatures a distinct amber viscosity, low glycemic floral index, and subtle hint of salty-sweet minerality unique to mangrove shoreline flora. Zero added sugar or syrup.",
    price_inr: 550,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80",
    ],
    stock_count: 32,
    weight_grams: 500,
    artisan_collective: "Vikhroli Mangrove Conservation Cooperative",
    is_active: true,
    is_featured: true,
    host_name: "Vikhroli Wetland Guardians Cooperative",
    host_phone: "+91 98200 99881",
    host_bio:
      "Community cooperative integrating sustainable non-timber forest produce harvesting with tidal wetland restoration.",
  },

  // 7. Handcrafted Miniature Coastal Wooden Fishing Boat
  {
    id: "prd-mini-boat",
    title: "Handcrafted Miniature Coastal Wooden Fishing Boat",
    slug: "handcrafted-miniature-koli-boat",
    category_id: "cat-goods",
    pillar: "goods",
    type: "product",
    short_summary:
      "Authentic hand-carved scale model of a traditional coastal Machwa fishing boat with cotton sails and carved eye insignia.",
    full_description:
      "An heirloom-quality maritime showpiece. Hand-carved from upcycled Malabar boat teak by senior craftsmen in Mahim coastal village. This model replicates every historical proportion of the legendary *Machwa* coastal trawlers that have navigated the Konkan sea for centuries.\n\nIncludes functional miniature carved rudder, authentic cotton canvas rigging, miniature brass mooring cleats, and the sacred protective eye (*Bhavai*) hand-painted on the bow to safeguard seafarers.",
    price_inr: 1100,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    ],
    stock_count: 14,
    weight_grams: 750,
    artisan_collective: "Mahim Coastal Woodcarvers Guild",
    is_active: true,
    is_featured: false,
    host_name: "Master Craftsman Ganpat Patil",
    host_phone: "+91 98334 55120",
    host_bio:
      "Master Ganpat has built real fishing vessels and now teaches young apprentices scale boat carving and restoration.",
  },

  // 8. Traditional Malvani & Coastal Fish Curry Masala Trio (300g)
  {
    id: "prd-masala-trio",
    title: "Traditional Malvani & Coastal Fish Curry Masala Trio (300g)",
    slug: "koli-curry-masala-trio",
    category_id: "cat-goods",
    pillar: "goods",
    type: "product",
    short_summary:
      "Three generational coastal spice blends: Coastal Fish Fry Rub, Malvani Sunday Curry Masala, and Roasted Coconut Chutney Podi.",
    full_description:
      "The ultimate coastal spice pantry trio in sealed reusable tins:\n\n1. **Coastal Fish Fry Masala (100g):** Roasted Byadgi chillies, coriander seed, trifala, and black pepper. Perfect crisp crust for fresh catch.\n2. **Malvani Sunday Curry Masala (100g):** Slow-roasted 18-spice blend for deep, aromatic gravies and crab curries.\n3. **Roasted Coconut-Jawla Chutney Podi (100g):** Fiery dry condiment made with stoneground roasted copra, garlic, and sea salt.",
    price_inr: 380,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1200&q=80",
    ],
    stock_count: 60,
    weight_grams: 300,
    artisan_collective: "Alibaug Coastal Women's Self-Help Group",
    is_active: true,
    is_featured: true,
    host_name: "Alibaug Coastal Women's Federation",
    host_phone: "+91 94220 33441",
    host_bio:
      "Representing 45 rural coastal households preserving age-old spice drying and slow hand-roasting techniques.",
  },
];

// Helper to generate upcoming dynamic slots for experiences
export function generateSeedSlots(): ExperienceSlot[] {
  const slots: ExperienceSlot[] = [];
  const experienceIds = [
    "exp-versova-trail",
    "exp-thane-flamingo",
    "exp-net-weaving",
    "exp-sassoon-trail",
  ];

  const now = new Date();

  // Generate slots for the next 14 days (focusing on weekends & selected weekdays)
  for (let d = 1; d <= 14; d++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + d);
    const dayOfWeek = targetDate.getDay(); // 0 is Sun, 6 is Sat

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Morning Slot 1 (e.g. 06:30 AM to 09:00 AM)
    const morningStart = new Date(targetDate);
    morningStart.setHours(6, 30, 0, 0);
    const morningEnd = new Date(targetDate);
    morningEnd.setHours(9, 0, 0, 0);

    // Morning Slot 2 (e.g. 07:30 AM to 09:30 AM)
    const midMorningStart = new Date(targetDate);
    midMorningStart.setHours(7, 30, 0, 0);
    const midMorningEnd = new Date(targetDate);
    midMorningEnd.setHours(9, 30, 0, 0);

    // Afternoon Slot (e.g. 04:00 PM to 06:00 PM) for workshops
    const eveningStart = new Date(targetDate);
    eveningStart.setHours(16, 0, 0, 0);
    const eveningEnd = new Date(targetDate);
    eveningEnd.setHours(18, 0, 0, 0);

    if (isWeekend) {
      // Versova morning slot
      slots.push({
        id: `slot-versova-${d}`,
        listing_id: "exp-versova-trail",
        slot_start: morningStart.toISOString(),
        slot_end: morningEnd.toISOString(),
        capacity: 14,
        booked_count: Math.min(14, 4 + (d % 8)),
        is_cancelled: false,
      });

      // Thane flamingo slot
      slots.push({
        id: `slot-thane-${d}`,
        listing_id: "exp-thane-flamingo",
        slot_start: midMorningStart.toISOString(),
        slot_end: midMorningEnd.toISOString(),
        capacity: 10,
        booked_count: Math.min(10, 3 + (d % 6)),
        is_cancelled: false,
      });

      // Sassoon trail slot
      slots.push({
        id: `slot-sassoon-${d}`,
        listing_id: "exp-sassoon-trail",
        slot_start: morningStart.toISOString(),
        slot_end: morningEnd.toISOString(),
        capacity: 12,
        booked_count: Math.min(12, 5 + (d % 5)),
        is_cancelled: false,
      });

      // Workshop evening slot
      slots.push({
        id: `slot-workshop-${d}`,
        listing_id: "exp-net-weaving",
        slot_start: eveningStart.toISOString(),
        slot_end: eveningEnd.toISOString(),
        capacity: 12,
        booked_count: Math.min(12, 2 + (d % 7)),
        is_cancelled: false,
      });
    } else if (d % 3 === 0) {
      // Selected weekday morning slots
      slots.push({
        id: `slot-versova-wk-${d}`,
        listing_id: "exp-versova-trail",
        slot_start: morningStart.toISOString(),
        slot_end: morningEnd.toISOString(),
        capacity: 14,
        booked_count: 2,
        is_cancelled: false,
      });
      slots.push({
        id: `slot-thane-wk-${d}`,
        listing_id: "exp-thane-flamingo",
        slot_start: midMorningStart.toISOString(),
        slot_end: midMorningEnd.toISOString(),
        capacity: 10,
        booked_count: 1,
        is_cancelled: false,
      });
    }
  }

  return slots;
}
