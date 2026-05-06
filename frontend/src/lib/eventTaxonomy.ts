export interface SubCategory {
  name: string;
  description?: string;
}

export interface Category {
  name: string;
  subCategories: SubCategory[];
}

export const EVENT_TAXONOMY: Category[] = [
  {
    name: "Sports & Action",
    subCategories: [
      { name: "Live Sports Broadcasting", description: "Operating heavy 'box lenses' on tripods or shoulder mounts for stadium action." },
      { name: "Extreme Sports", description: "High-shutter-speed filming for skating, surfing, or mountain biking." },
      { name: "E-sports Tournaments", description: "Capturing player reactions, stage walk-outs, and arena crowds." },
      { name: "POV / Helmet Cam Specialist", description: "Professional athlete wearing a rigged-up cinema camera for immersive action." },
      { name: "E-Sports & Gaming Live", description: "Managing in-game camera angles for massive virtual tournaments." }
    ]
  },
  {
    name: "Documentary & Journalism",
    subCategories: [
      { name: "ENG (Electronic News Gathering)", description: "Working with a reporter to cover breaking news and interviews." },
      { name: "Wildlife & Nature", description: "Patient filming with long telephoto lenses or specialized macro rigs." },
      { name: "Behind-the-Scenes (BTS)", description: "EPK shooting documenting the making of movies or large productions." }
    ]
  },
  {
    name: "Specialized Private Events",
    subCategories: [
      { name: "Gender Reveals & Proposals", description: "High-pressure, one-take-only stealth shooting of surprise moments." },
      { name: "Religious & Cultural Ceremonies", description: "Respectful timing for rituals like Baptisms, Bar Mitzvahs, or Arangetrams." },
      { name: "Funerals & Life Celebrations", description: "Archiving eulogies and stories shared by loved ones." }
    ]
  },
  {
    name: "Commercial & Industrial",
    subCategories: [
      { name: "Real Estate & Architecture", description: "Cinematic gimbal walk-throughs and high-end interior photography." },
      { name: "Industrial/Construction Progress", description: "Documenting building lifecycle for stakeholders via monthly visits." },
      { name: "Fashion & Runway", description: "High-energy shooting at the end of a catwalk, focusing on garment movement." }
    ]
  },
  {
    name: "Specialized Tech Shoots",
    subCategories: [
      { name: "Virtual Reality (VR) / 360° Filming", description: "Using multi-camera rigs for immersive environments." },
      { name: "Underwater Cinematography", description: "Filming marine life or pool scenes using waterproof housings (SCUBA required)." },
      { name: "Time-lapse Photography", description: "Long-term setups to capture slow growth or environmental movements." },
      { name: "Structural Inspections", description: "Using thermal or borescope cameras for deep inspections." }
    ]
  },
  {
    name: "Education & Institutional",
    subCategories: [
      { name: "Masterclasses & Webinars", description: "Multi-camera studio setups focused on clear instructional lighting." },
      { name: "Medical/Surgical Filming", description: "Precise recording of surgeries for journals or student training." },
      { name: "University Research & Lab Documentation", description: "High-speed or macro filming for biology or robotics research." },
      { name: "Museum Archives", description: "Virtual tours or documenting artifact restoration processes." }
    ]
  },
  {
    name: "High-Stakes Corporate & Legal",
    subCategories: [
      { name: "Legal Depositions", description: "Certified filming of court testimonies with strict static rules." },
      { name: "AGM (Annual General Meetings)", description: "Live-streaming and formal archival of shareholder meetings." },
      { name: "Trade Shows & Expos", description: "Following booth activity and interviews at massive tech summits." }
    ]
  },
  {
    name: "Art & Performance",
    subCategories: [
      { name: "Theater & Dance Recitals", description: "Capturing stage lighting and complex footwork/ensemble movements." },
      { name: "Gallery Openings & Art Launches", description: "Capturing the 'vibe' of opening nights for artist portfolios." },
      { name: "Slam Poetry or Stand-up Comedy", description: "Focusing on punchlines and crucial audience reaction shots." }
    ]
  },
  {
    name: "Personal & Family Milestones",
    subCategories: [
      { name: "Vacation Videography", description: "Following travelers to create high-end holiday travel films." },
      { name: "Boudoir / Intimate Shoots", description: "Sensitive, confidence-boosting artistic lighting in private settings." },
      { name: "Estate/Inheritance Filming", description: "Documenting collections or recording legacy messages for family." },
      { name: "Legacy/Biography Films", description: "Mini-documentaries interviewing relatives to create family heirlooms." }
    ]
  },
  {
    name: "Government & Public Sector",
    subCategories: [
      { name: "Police/Forensic Videography", description: "Documenting crime scenes or industrial accidents for legal records." },
      { name: "Political Rallies & Campaigns", description: "Traveling with candidates to capture speeches and strategy." }
    ]
  },
  {
    name: "Culinary & Product",
    subCategories: [
      { name: "Tabletop Cinematography", description: "Macro 'billboard' shots of food using robotic arms and slow-motion." },
      { name: "Jewelry & Watch Macro Shoots", description: "Capturing the tiny movements and sparkles of luxury items." }
    ]
  },
  {
    name: "Wedding",
    subCategories: [
      { name: "Engagement Shoot", description: "A casual 'save the date' cinematic video." },
      { name: "The 'Love Story' Interview", description: "A seated interview played during the reception." },
      { name: "Traditional Pre-Wedding Rituals", description: "Haldi, Mehendi, Sangeet, or Tea Ceremonies." },
      { name: "The Wedding Day", description: "Getting Ready, The Ceremony, and The Reception." },
      { name: "The Same-Day Edit (SDE)", description: "High-pressure editing of a highlight film during the wedding day." },
      { name: "Drone Pilot", description: "Exclusive aerial coverage of the venue and couple." },
      { name: "Social Media Content Creator", description: "Vertical content for Instagram/TikTok delivered within 24h." }
    ]
  },
  {
    name: "Corporate & Business",
    subCategories: [
      { name: "Corporate Event", description: "Seminars, conferences, and internal company gatherings." },
      { name: "Commercial Ad films", description: "High-end product or brand storytelling for TV and Web." },
      { name: "Trade Shows & Expos", description: "Documenting booth activity and key interviews at large exhibitions." },
      { name: "YouTube Live / Streaming", description: "Professional live-streaming setup for corporate announcements or shows." }
    ]
  },
  {
    name: "Private Celebrations",
    subCategories: [
      { name: "Birthday Party", description: "Capturing cake cutting, games, and guest interactions." },
      { name: "Musical video", description: "Cinematic filming of music performances or music video production." },
      { name: "Gender Reveals & Proposals", description: "High-pressure, one-take-only stealth shooting of surprise moments." }
    ]
  },
  {
    name: "Aviation & Tech",
    subCategories: [
      { name: "Drone / Aerial shoots", description: "Specialized aerial cinematography using high-end drone systems." },
      { name: "Virtual Reality (VR) / 360° Filming", description: "Using multi-camera rigs for immersive environments." }
    ]
  }
];
