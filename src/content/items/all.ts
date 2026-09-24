import type { ContentItem } from "../types";

export const ALL_ITEMS: ContentItem[] = [
  {
    // No imagery yet — this one is young and its artifacts are a repo and a
    // ledger, not photographs. Empty media falls through to a text-only card.
    "id": "interlock",
    "type": "venture",
    "title": "Interlock",
    "date": "sep 2026 - present",
    "tags": [
      "Entrepreneurship",
      "Craft",
      "Leadership"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": []
    },
    "card": {
      "oneLiner": "A commit-gate and receipt layer that makes AI-agent payments at-most-once and auditable.",
      "headline": "An agent that pays should only pay once",
      "subhead": "Built for Battle of the Coasts, Cloud AI track.",
      "microSummary": "Payment-integrity tooling for AI agents, validated against injected faults on live Stripe test mode."
    },
    "beats": [
      "An agent that retries a payment is an agent that pays twice.",
      "So the gate commits first and settles second.",
      "Ten injected faults. Plain retry paid wrong in nine. The gate, zero.",
      "Every published number is reproduced by a script in the repo.",
      "A number without a ledger entry is filed as a bug."
    ],
    "caseFile": {
      "context": "Interlock is a commit-gate and receipt layer for AI-agent payments. When an autonomous agent is allowed to move money, ordinary retry logic stops being a convenience and becomes a liability: a timeout that looks like a failure is often a success the caller never saw, and the retry pays again. Interlock makes the operation at-most-once and leaves an auditable receipt behind it.",
      "whatIDid": [
        "Designed the commit-gate so an intent is recorded before settlement, not after.",
        "Built a receipt layer that makes every executed payment auditable after the fact.",
        "Built a fault-injection harness and validated the gate on live Stripe test mode.",
        "Set up a public claims ledger so every published number maps to a script in the repo."
      ],
      "impact": [
        "Across ten injected faults, plain retry paid wrong nine times; the gate paid wrong zero times.",
        "Every number the project publishes is reproducible from the repository."
      ],
      "evidence": [
        {
          "label": "Interlock (live)",
          "url": "https://interlock-self.vercel.app"
        }
      ],
      "deepDive": "The failure mode is boring and expensive. An agent calls a payment API. The connection drops. The agent cannot tell the difference between \"this never happened\" and \"this happened and I did not hear back.\" So it retries, and the money moves twice.\n\nHumans catch this because a human notices the second charge. An agent running unattended does not, and the whole point of an agent is that it runs unattended.\n\nInterlock inverts the order. The intent is committed before the money moves, so the second attempt finds the first already recorded and declines to act. What comes back is a receipt, not a hope.\n\nThe part I care about most is not the gate, it is the ledger. Anyone can publish a reliability number. We publish a script alongside each one, and if a number appears without a script behind it, we file it as a bug. That rule is uncomfortable on purpose."
    }
  },
  {
    "id": "roofmate",
    "type": "venture",
    "title": "RoofMate",
    "date": "jan 2024 - present",
    "tags": [
      "Bridge-building",
      "Entrepreneurship",
      "Community",
      "Leadership",
      "Craft"
    ],
    "orgIds": [
      "MEET"
    ],
    "privacy": "public",
    "media": {
      "heroMedia": {
        "type": "image",
        "src": "/images/life/roofmate/g10-expo-night.jpeg",
        "label": "RoofMate Expo Night"
      },
      "demoMedia": {
        "type": "video",
        "src": "/teasers/roofmate.mp4",
        "label": "RoofMate Demo"
      },
      "heroImage": "/images/life/roofmate/g10-expo-night.jpeg",
      "teaserVideo": "/teasers/roofmate-demo.mp4",
      "youtubeUrl": "",
      "gallery": [
        "/images/life/roofmate/g1-my-mindset.jpeg",
        "/images/life/roofmate/g2-min-map-tools.jpeg",
        "/images/life/roofmate/g3-roofmate-book.JPG",
        "/images/life/roofmate/g4-brainstorming.png",
        "/images/life/roofmate/g5-beginning.jpeg",
        "/images/life/roofmate/g6-beginning.jpg",
        "/images/life/roofmate/g7-MVP-test-day.JPG",
        "/images/life/roofmate/g8-MVP-test-day.jpg",
        "/images/life/roofmate/g9-MVP-test-day.jpg",
        "/images/life/roofmate/g11-expo-night-Appsflyer.JPG",
        "/images/life/roofmate/g12-expo-night.JPG",
        "/images/life/roofmate/g13-expo-night.JPG",
        "/images/life/roofmate/g14-expo-night.JPG",
        "/images/life/roofmate/g15-expo-night.jpg",
        "/images/life/roofmate/g16-waitlist-website-screenshot.jpg"
      ]
    },
    "card": {
      "oneLiner": "Android-first roommate matching built to make dorm trust easier to start.",
      "headline": "In Israel, a roommate can change a whole generation's perception",
      "subhead": "Co-founded through MEET with a binational team. App-first by design."
    },
    "beats": [
      "Roommate matching is not just logistics. It is trust.",
      "We designed for onboarding, verification, and real conversations.",
      "App-first because housing windows are time-sensitive.",
      "Matching is important. Trust cues are just as important.",
      "Built to make \"the other\" feel like a roommate."
    ],
    "caseFile": {
      "context": "RoofMate is a nonprofit, Android-first roommate matching app for dorm housing. I co-founded it through MEET with a binational team of Arabs and Jews in Israel. We built it around one idea: trust grows faster when people meet as humans, build upon extensive personal experiences. My work focused on building the product into something students can actually use and on turning user feedback into clear choices.",
      "whatIDid": [
        "Built core app flows and the onboarding experience with a focus on drop-off points.",
        "Implemented matching logic that ranks compatibility by interests and living habits.",
        "Translated user and admin feedback into product decisions, edge cases, and fixes."
      ],
      "impact": [
        "Shipped a working mobile product built around trust, not just profiles.",
        "Learned to make product tradeoffs under real constraints and a real team."
      ],
      "evidence": [
        {
          "label": "RoofMate demo video",
          "url": "/teasers/roofmate-demo.mp4"
        },
        {
          "label": "RoofMate Expo Night repo",
          "url": "https://github.com/az-said/RoofMateExpoNight"
        }
      ],
      "deepDive": "In our region, conflict is loud, but proximity is quiet. Roommates share routines before they share opinions. That reality made roommate matching feel like a real leverage point.\n\nRoofMate started as a simple question: can we help students meet as people first? It quickly became a trust problem. People needed safety, verification, and clarity, not just a swipeable profile.\n\nWe chose an app-first product on purpose. Students prefer mobile onboarding. Verification is easier with a phone camera. Housing windows are time-sensitive. A private chat needs device-level permissions that just work.\n\nMy role was to build and to keep decisions grounded. I cared about the small details that stop people from finishing signup. I cared about what happens after a match, not just before it. That mindset is what made the product feel real."
    }
  },
  {
    "id": "pvl-internship",
    "type": "venture",
    "title": "Peptide Visual Lab",
    "date": "sep 2025 - present",
    "tags": [
      "Research",
      "Craft",
      "Leadership",
      "Entrepreneurship"
    ],
    "orgIds": [
      "DESY"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/life/pvl/DESY-delegation/hero.jpg",
      "teaserVideo": "",
      "youtubeUrl": "https://youtu.be/8hQxsDMqzr4",
      "gallery": [
        "/images/life/pvl/DESY-delegation/IMG_1577.jpg",
        "/images/life/pvl/DESY-delegation/IMG_1656.jpg",
        "/images/life/pvl/DESY-delegation/IMG_1663.jpg",
        "/images/life/pvl/DESY-delegation/IMG_1667.jpg",
        "/images/life/pvl/DESY-delegation/IMG_1685.jpg",
        "/images/life/pvl/DESY-delegation/IMG_1762.jpg",
        "/images/life/pvl/DESY-delegation/IMG_9459_Original.jpg",
        "/images/life/pvl/DESY-delegation/hero.jpg",
        "/images/life/pvl/internship/g1-in-terminal.jpg",
        "/images/life/pvl/internship/g2-in-lab.jpg",
        "/images/life/pvl/internship/g3-in-lab.jpg",
        "/images/life/pvl/internship/g4-in-lab.jpg",
        "/images/life/pvl/internship/g5-reflection.jpg",
        "/images/life/pvl/internship/g6-reflection.jpg",
        "/images/life/pvl/internship/g7-reflection.jpg",
        "/images/life/pvl/internship/g8-group-pic.jpg",
        "/images/life/pvl/internship/g9-group-pic.jpg",
        "/images/life/pvl/internship/g10-group-pic.jpg",
        "/images/life/pvl/internship/g11-group-pic.jpg"
      ]
    },
    "card": {
      "oneLiner": "A privacy-first platform to run peptide analysis and make results readable fast.",
      "headline": "Turning fragile scripts into a product researchers can trust",
      "subhead": "Proposed and built with an evolutionary research team."
    },
    "beats": [
      "I saw brilliant science slowed down by glue work.",
      "So I rebuilt the workflow into a platform.",
      "Runs cached by sequence hash, less recompute, more insight.",
      "Validation is the loop. Biology decides the thresholds.",
      "Long-term direction: queryable precomputed database (UniProt 2.0)."
    ],
    "caseFile": {
      "context": "Peptide Visual Lab is a privacy-first web platform I proposed and built with an evolutionary research team. It began during a selective course at DESY and continued afterward as an ongoing collaboration. I rebuilt the analysis pipeline into a modular backend and designed a frontend that makes sequence results interpretable at a glance. The long-term direction is to precompute structural properties at scale so labs can query instead of rerunning manual workflows.",
      "whatIDid": [
        "Proposed the project and rebuilt the pipeline into a modular, web-friendly system.",
        "Designed backend orchestration, standardized inputs, and added caching by sequence hash.",
        "Built the UI to make results visual, comparable, and auditable for researchers."
      ],
      "impact": [
        "Turned a fragile script workflow into a reusable platform with a clear feedback loop.",
        "Created a foundation for faster onboarding and more consistent interpretation."
      ],
      "evidence": [
        {
          "label": "PVL abstract (Google Doc)",
          "url": "https://docs.google.com/document/d/1In0ZTwfDBlnjkZw14Ep19BVldTfZTOCZNQbx7O89LQk/edit?usp=sharing"
        },
        {
          "label": "CSSB at DESY",
          "url": "https://photon-science.desy.de/research/centres_for_research/cssb/index_eng.html"
        }
      ],
      "deepDive": "The most frustrating part of research is not the hard science. It is the setup and the glue. Files in different formats. Scripts that only work on one machine. Results scattered across folders. Interpretation slowed down by uncertainty.\n\nPVL was my response. I wanted a single place where a researcher can run a sequence, see outputs with context, and compare runs without guessing what changed.\n\nI rebuilt the pipeline around one promise: repeatability. Standard inputs. Clear run artifacts. Caching by sequence hash so teams can iterate without recomputing the same work.\n\nThe key loop is validation. Every threshold and visualization needed biological meaning, not just code correctness. Working with researchers forced me to build in a way that is both technical and humble.\n\nThe direction that excites me is precomputation. When structure is queryable, the bottleneck moves from setup to discovery."
    }
  },
  {
    "id": "empowered",
    "type": "venture",
    "title": "EmpowerED",
    "date": "Sep 2023 – Jan 2024",
    "tags": ["Community", "Leadership", "Entrepreneurship", "Craft"],
    "privacy": "public",
    "media": {
      "heroImage": "/images/life/empowered/g1-group-pic.JPG",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": [
        "/images/life/empowered/g1-group-pic.JPG",
        "/images/life/empowered/g2-logo.png"
      ]
    },
    "card": {
      "oneLiner": "Three of us built a small MVP for career guidance, then turned it into a workshop and a curriculum that can be reused.",
      "headline": "EmpowerED was my first attempt to flip the snowball",
      "subhead": "An MVP, a workshop, and a process archive you can actually rerun."
    },
    "beats": [
      "I grew up seeing kids get labeled early, especially the ones who were simply ahead, bored, or restless.",
      "I was one of them. I finished fast, got bored, and became the “problem kid” in the room.",
      "My mom refused that label. She pushed for testing, fought the school, and proved I needed pace, not punishment.",
      "EmpowerED was my way to build a first rung for students who are capable but under guided.",
      "We shipped an MVP you could demo, then tested the idea through a workshop, then turned the learning into a curriculum and an archive so others can repeat it."
    ],
    "caseFile": {
      "context": "EmpowerED started from something personal. In my early school years in Abu Ghosh, I watched classmates get boxed in by a system that had one speed. If you matched it, you were fine. If you moved faster, you became noise. I lived that. My mom fought hard to prove I was not broken. I was bored. That experience stayed with me. EmpowerED was a short sprint where my team of three built a simple career support MVP for high school students, then turned it into a workshop and curriculum that others can run. The goal was not to “solve education.” It was to create one clean, repeatable way to give students direction earlier, before they drift into a label.",
      "whatIDid": [
        "Helped shrink a big problem into a demoable MVP with clear flows and a tight scope.",
        "Helped run the workshop and used it to test what we assumed and rewrite what did not land.",
        "Helped convert the sprint into a reusable curriculum and a process archive so the work survives the team."
      ],
      "impact": [
        "Produced an MVP, a workshop plan, and a curriculum we could run again with new groups.",
        "Trained the build rhythm I use now: ship small, test in reality, document so others can continue."
      ],
      "evidence": [
        {
          "label": "Drive folder (process)",
          "url": "https://drive.google.com/drive/folders/1Yyop00qaoglrnI4KusbC-cn5-R8Ua7Ni"
        },
        {
          "label": "EmpowerED deck (Slides)",
          "url": "https://docs.google.com/presentation/d/15nHN4FPdhCDCcyvQwqvgM2stwkZrprRY3g9q9OpuL9w/edit?slide=id.g2c4c49410a4_0_14#slide=id.g2c4c49410a4_0_14"
        }
      ],
      "deepDive": ""
    }
  },
  {
    "id": "huji-hackathon-win",
    "type": "honor",
    "title": "HUJI Hackathon – Winner",
    "date": "may 2025",
    "tags": [
      "Entrepreneurship",
      "Craft",
      "Community"
    ],
    "orgIds": [
      "HUJI"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/life/huji-hackathon-win/hero.jpg",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": [
        "/images/life/huji-hackathon-win/hero.jpg",
        "/images/life/huji-hackathon-win/g1-building.jpg",
        "/images/life/huji-hackathon-win/g2-debugging.jpg",
        "/images/life/huji-hackathon-win/g3-presenting.jpg",
        "/images/life/huji-hackathon-win/g4-winning.jpg"
      ]
    },
    "card": {
      "oneLiner": "Built a form-filling assistant in 36 hrs. Won the HUJI hackathon grand prize as a highschooler.",
      "headline": "Winner: HUJI Hackathon",
      "subhead": "A solution for my grandmother's weekly struggles with bureaucracy."
    },
    "beats": [
      "A waiting room turned into a product problem.",
      "We built Shaman to guide people through government forms.",
      "Agents, translation, and a clear demo under pressure.",
      "Hackathon pressure, ship, test, pitch, repeat.",
      "What used to feel impossible became step-by-step."
    ],
    "caseFile": {
      "context": "At the HUJI hackathon, my team and I built Shaman, a prototype that helps people complete public sector forms in their own language. The idea came from watching my grandmother struggle with digital paperwork designed without her in mind. I worked mainly on backend and agent logic, then helped shape the demo and pitch. We won, but the real takeaway was learning to ship, test, and communicate under a hard deadline.",
      "whatIDid": [
        "Owned the backend and agent orchestration to drive the form flow.",
        "Implemented multilingual handling so the system meets users where they are.",
        "Helped shape the final demo and pitch for clarity under time constraints."
      ],
      "impact": [
        "HUJI Hackathon winner (May 2025).",
        "Built a prototype that turns intimidating bureaucracy into guided steps."
      ],
      "evidence": [
        {
          "label": "Hackathon page",
          "url": "https://github.com/HUJI-Hackathon"
        },
        {
          "label": "Project repo",
          "url": "https://github.com/az-said/HujiHackathon2024"
        }
      ],
      "deepDive": "I did not come to the hackathon looking for a prize. I came with a memory. A waiting room. An elder shrinking in her seat because a form felt like a wall.\n\nWe mapped the journey: find the right form, decode jargon, translate, fill fields, upload files, and hope it submits. I wanted a system that replaces fear with a guided conversation.\n\nMy role was mainly backend and agent logic. I built the orchestration that asks the right questions, keeps state, and generates a clean output.\n\nThe team kept cutting until the demo was undeniable. Winning mattered, but the part I keep is the discipline: ship something real, test it, explain it, and accept feedback in public."
    }
  },
  {
    "id": "meta-hackathon-win",
    "type": "honor",
    "title": "Meta Hackathon – Winner",
    "date": "2022",
    "tags": [
      "Entrepreneurship",
      "Craft",
      "Community"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/life/foom_meta_hackathon_win/g2-announcing-winners.JPG",
      "teaserVideo": "",
      "youtubeUrl": "https://www.youtube.com/watch?app=desktop&v=gDBhXQG5lmo",
      "gallery": [
        "/images/life/foom_meta_hackathon_win/g1-presenting-to-meta.jpg",
        "/images/life/foom_meta_hackathon_win/g2-announcing-winners.JPG"
      ]
    },
    "card": {
      "oneLiner": "Won the Meta Hackathon with FOOM, an affordable food waste solution.",
      "headline": "Winner: learning to ship under real pressure",
      "subhead": "FOOM deck and pitch video are linked below."
    },
    "beats": [
      "A deadline, a room, and one idea worth testing.",
      "FOOM: an affordable way to reduce food waste.",
      "We built the deck fast and kept the story simple.",
      "I presented and learned to answer tough questions calmly.",
      "That pressure still shapes how I build."
    ],
    "caseFile": {
      "context": "Meta’s hackathon forced me to compress FOOM into a simple story: a food waste solution that stays affordable and accessible. The lesson was not just the win, but learning to make tradeoffs fast, communicate clearly, and stay calm under pressure.",
      "whatIDid": [
        "Clarified FOOM’s problem and value proposition into one sharp pitch.",
        "Built the slide deck and presentation narrative under time pressure.",
        "Presented to judges and adapted the story based on live feedback."
      ],
      "impact": [
        "Won the Meta Hackathon (Aug 2022) with FOOM.",
        "Left with a pitch structure I still reuse when I need clarity fast."
      ],
      "evidence": [
        {
          "label": "FOOM deck (Google Slides)",
          "url": "https://docs.google.com/presentation/d/1dxYgnbYF24OX7D7QERP_aOF-5phdfWuVOuMrYRjumOw/edit?usp=sharing"
        },
        {
          "label": "Winning presentation (YouTube)",
          "url": "https://www.youtube.com/watch?app=desktop&v=gDBhXQG5lmo"
        }
      ],
      "deepDive": ""
    }
  },
  {
    "id": "bml-advanced-track",
    "type": "honor",
    "title": "BetterMind Labs – Advanced Track",
    "date": "july 2025 - present",
    "tags": [
      "Leadership",
      "Craft",
      "Community"
    ],
    "orgIds": [
      "BML",
      "MEET"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/life/meet-TA/g5-class-pic.jpg",
      "teaserVideo": "",
      "youtubeUrl": "https://www.youtube.com/watch?v=rXLCb_o5eC8",
      "gallery": [
        "/images/life/meet-TA/g5-class-pic.jpg"
      ]
    },
    "card": {
      "oneLiner": "Advanced to BetterMind Labs' 12-week Advanced Track: top 9 of ~1,100 applicants.",
      "headline": "Built MSSA to support MEET teaching & curriculum development.",
      "subhead": "Advanced track coaching while shipping an assistant for instructors."
    },
    "beats": [
      "Teaching revealed the real bottleneck: prep time.",
      "So I built MSSA, a teaching assistant for session structure.",
      "Refined with engineering feedback in the advanced track.",
      "Focused on deployment for MEET’s next cycle.",
      "AI as leverage, not novelty."
    ],
    "caseFile": {
      "context": "While teaching at MEET, We lost major investmentor & quality teachers from MIT. I noticed the same pain point again and again: instructors spend huge energy turning scattered materials into a clean session plan. I built MSSA to turn prompts, notes, and slides into structured teaching assets. In BetterMind Labs' Advanced Track, I refined the tool with engineering guidance and kept the focus on grounded outputs that actually help instructors.",
      "whatIDid": [
        "Observed instructor pain points while teaching and translated them into product requirements.",
        "Built MSSA to turn teaching materials into structured session assets.",
        "Iterated with feedback and prepared the tool for real use in MEET."
      ],
      "impact": [
        "Advanced to the 12-week Advanced Track: top 9 of ~1,100 applicants. Named among “top performing students.”",
        "Shipped a tool aimed at reducing prep friction and improving teaching consistency."
      ],
      "evidence": [
        {
          "label": "MSSA repo",
          "url": "https://github.com/az-said/meet-session-script-assistant"
        },
        {
          "label": "Advanced Track letter",
          "url": "https://drive.google.com/file/d/1sBxCysQzjNaGbi522Te04YaCgetFwuIj/view"
        },
        {
          "label": "Interview (YouTube)",
          "url": "https://www.youtube.com/watch?v=rXLCb_o5eC8"
        }
      ],
      "deepDive": "I love teaching, but it exposed a problem I could not ignore. Before every session, instructors were doing invisible labor: turning messy notes into a flow, predicting where students will struggle, and deciding what to cut when time runs out.\n\nMSSA started as a small attempt to help. I designed it to produce grounded outputs: a session outline, question prompts, timing suggestions, and simple follow-up tasks. Nothing flashy. Just useful.\n\nBetterMind Labs gave me a harder kind of feedback. Not praise, but questions about reliability, failure modes, and what happens when the input is incomplete. That pressure made the tool better and made my thinking more professional.\n\nThe goal is simple: reduce prep friction so instructors can spend their energy on students."
    }
  },
  {
    "id": "dabka",
    "type": "experience",
    "title": "Dabka (Dance)",
    "date": "2015 - present",
    "tags": [
      "Identity",
      "Community",
      "Movement"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/life/dabka/Budapest-international-festival.JPG",
      "teaserVideo": "",
      "youtubeUrl": "https://www.youtube.com/watch?v=ARY_L0_9DEc",
      "gallery": [
        "/images/life/dabka/Budapest-international-festival.JPG",
        "/images/life/dabka/spain-festival.JPG"
      ]
    },
    "card": {
      "oneLiner": "Nine years of Dabka that started from a \"Wow you are talented!\".",
      "headline": "A decade of rhythm & belonging",
      "subhead": "Long hours, even in Ramadan & fasting."
    },
    "beats": [
      "When life gets loud, I find peace.",
      "Adventures, stories, personal experiences and lots of memories."
    ],
    "caseFile": {
      "context": "Dabka is the longest commitment in my life. Before everything, this is how I met my best friends. It taught me discipline that does not depend on mood, and belonging that does not need big speeches. Training for years made me comfortable with repetition, coordination, and showing up even when I feel tired.",
      "whatIDid": [
        "Trained consistently for years as part of a troupe and performed very often.",
        "Learned to lead from within a group and stay synchronized under pressure.",
        "Performed at local and international festivals, carrying culture."
      ],
      "impact": [
        "Built a kind of discipline that quietly supports everything else I do."
      ],
      "evidence": [
        {
          "label": "Performance video (YouTube)",
          "url": "https://www.youtube.com/watch?v=ARY_L0_9DEc"
        }
      ],
      "deepDive": ""
    }
  },
  {
    "id": "meet",
    "type": "experience",
    "title": "MEET (Middle East Entrepreneurs of Tomorrow)",
    "date": "2022 - present",
    "tags": [
      "Bridge-building",
      "Leadership",
      "Community",
      "Identity"
    ],
    "orgIds": [
      "MEET"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/life/meet/1d9300b2-2414-473f-90b8-e562e2899c34.JPG",
      "teaserVideo": "/teasers/meet.mp4",
      "youtubeUrl": "",
      "gallery": [
        "/images/life/meet/1d9300b2-2414-473f-90b8-e562e2899c34.JPG",
        "/images/life/meet/2b36274f-f88b-433f-b658-1700934ef121.JPG"
      ]
    },
    "card": {
      "oneLiner": "A place where building and dialogue happen in the same room. (I will always miss DU-Deep Understanding Sessions)",
      "headline": "Where code becomes a language for trust",
      "subhead": "Binational collaboration that trained both craft and responsibility."
    },
    "beats": [
      "MEET takes technology, and uses it to make you understand the region's conflict",
      "Then, it takes the conflict, and uses it to make you understand YOURSELF!!",
      "And only then, you can build meaningful solutions starting with YOU.",
      "Differences do not vanish, they become constraints.",
      "MEET made my ambition more responsible."
    ],
    "caseFile": {
      "context": "MEET gave me a rare kind of education. We built products with a binational team, and we also practiced how to stay in the room when conversations got hard. It trained my technical craft, but it also trained my responsibility: to listen, to make decisions transparently, and to treat people as more than categories.",
      "whatIDid": [
        "Collaborated in binational teams on product and engineering work.",
        "Practiced dialogue alongside building, especially when tension was real.",
        "Co-founded RoofMate through MEET and learned to ship with shared ownership."
      ],
      "impact": [
        "Learned to lead and build in a way that keeps trust and craft tied together."
      ],
      "evidence": [
        {
          "label": "MEET official site",
          "url": "https://www.meet.org/"
        }
      ],
      "deepDive": "MEET is a family where building and dialogue happen together.\n\nOn some days, the work is technical: design a flow, debug a crash, make a demo stable. On other days, the work is human: hold disagreement without turning it into dismissal. The hardest part is doing both at once.\n\nWorking in a binational team forced me to become more precise with my words and more honest with my assumptions. It also forced me to ship. Trust is not built by opinions. It is built by showing up, doing the work, and owning mistakes.\n\nMEET taught me that entrepreneurship is not a personality. It is a responsibility."
    }
  },
  {
    "id": "meet-ta",
    "type": "experience",
    "title": "MEET TA / Teaching Assistant",
    "date": "2024 - present",
    "tags": [
      "Leadership",
      "Community",
      "Craft",
      "Identity"
    ],
    "orgIds": [
      "MEET"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/life/meet-TA/g5-class-pic.jpg",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": [
        "/images/life/meet-TA/g1-falling-in-love.jpg",
        "/images/life/meet-TA/g2-love-the-students.jpg",
        "/images/life/meet-TA/g3-students.jpg",
        "/images/life/meet-TA/g4-cool-pic-with-students-funny.jpg",
        "/images/life/meet-TA/g5-class-pic.jpg",
        "/images/life/meet-TA/g6-class-pic.jpg",
        "/images/life/meet-TA/g7-team-pic.jpg",
        "/images/life/meet-TA/g8-team-pic.jpg",
        "/images/life/meet-TA/g9-me-as-a-funny-ta.jpg"
      ]
    },
    "card": {
      "oneLiner": "Teaching made me sharper: you only understand what you can explain simply.",
      "headline": "Turning my learning loop into a teaching loop",
      "subhead": "Mentoring students through early ideas, prototypes, and presentations."
    },
    "beats": [
      "Teaching exposes what I do not fully understand yet.",
      "Students need structure, not just inspiration.",
      "I learned to give feedback that is kind and precise.",
      "I also built tools to reduce prep friction.",
      "Mentorship became part of my identity."
    ],
    "caseFile": {
      "context": "Being a TA at MEET taught me to slow down and meet students where they are. The best sessions were not the ones with the most content, but the ones where students left with clarity and momentum. Teaching also revealed hidden labor, so I started building tools that reduce prep friction and make good sessions repeatable.",
      "whatIDid": [
        "Mentored student teams through ideation, scope decisions, and prototype iterations.",
        "Helped students prepare pitches by sharpening their story and demo flow.",
        "Built and tested small tools to support session planning and consistency."
      ],
      "impact": [
        "Strengthened my ability to lead with empathy while still demanding clarity."
      ],
      "evidence": [
        {
          "label": "MSSA repo",
          "url": "https://github.com/az-said/meet-session-script-assistant"
        }
      ],
      "deepDive": ""
    }
  },
  {
    "id": "school-leyada",
    "type": "experience",
    "title": "Leyada (Hebrew University Secondary School)",
    "date": "2019 - 2025",
    "tags": [
      "Identity",
      "Leadership",
      "Craft"
    ],
    "orgIds": [
      "HUJI"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/life/school-leyada/g2-graduating.jpg",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": [
        "/images/life/school-leyada/g1-learning-life-lessons-with-friends.jpg",
        "/images/life/school-leyada/g2-graduating.jpg",
        "/images/life/school-leyada/g3-graduating-with-teachers.jpg",
        "/images/life/school-leyada/g4-graudation-friends-for-life.jpg",
        "/images/life/school-leyada/g6-scores-bagrut-and-sat-accomplishments.jpg"
      ]
    },
    "card": {
      "oneLiner": "A demanding school chapter where I learned to earn my space.",
      "headline": "Where rigor met identity, and neither stayed the same for me",
      "subhead": "Advanced STEM environment that trained my structure and endurance."
    },
    "beats": [
      "A school built for advanced STEM intensity.",
      "Rigor that forced systems, not just talent.",
      "Identity lived inside the same hallways.",
      "Friendships and friction, both taught me.",
      "I left with momentum, not closure."
    ],
    "caseFile": {
      "context": "Leyada was where my discipline became real. The pace was intense, and the expectations did not care about my mood. I learned to build structure around learning, not just rely on talent. I also learned what it means to hold identity inside a mixed environment and still stay open, curious, and steady.",
      "whatIDid": [
        "Completed high school in a rigorous advanced STEM environment.",
        "Balanced heavy coursework with building projects, mentoring, and community commitments.",
        "Built reflection and time-management habits to stay consistent under pressure."
      ],
      "impact": [
        "Left with a stronger relationship with rigor and a clearer sense of who I am."
      ],
      "evidence": [
        {
          "label": "Leyada official site",
          "url": "https://www.leyada.net/"
        }
      ],
      "deepDive": "Most nights, I climb to the roof.\n\nSometimes I write. Sometimes I just breathe. From up there, the city looks calm, even when my week was not. That contrast taught me something: pressure is real, but it does not have to own you.\n\nLeyada pushed me academically, but the deeper push was internal. I learned to earn my focus, to plan my weeks, and to keep going when motivation disappeared. I also learned how to live my identity in a mixed environment without turning it into either a shield or a performance.\n\nWhen I look back, I do not remember one perfect grade. I remember learning how to keep my integrity while growing."
    }
  },
  {
    "id": "volunteering",
    "type": "experience",
    "title": "Volunteering",
    "date": "2023 - 2025",
    "tags": [
      "Community",
      "Leadership"
    ],
    "orgIds": [
      "MEET"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/life/volunteering/hero.jpg",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": []
    },
    "card": {
      "oneLiner": "Showing up where people needed hands, not headlines.",
      "headline": "Service that trained my patience and responsibility",
      "subhead": "MEET entrepreneurship TA & CS Co-Instructor, volunteering with elders, and farm work after Oct 7."
    },
    "beats": [
      "QUALITY QUALITY QUALITY.",
      "Mentoring as an entrepreneurship TA in MEET.",
      "Time with elders taught me to slow down and listen.",
      "Farm work after Oct 7 taught me to help quietly.",
      "I try to build with that same mindset."
    ],
    "caseFile": {
      "context": "My volunteering has lived in four places. First, I served as an entrepreneurship TA in MEET for a full year, and CS Co-Instructor for a full summer & yearlong (2+ years), mentoring students through the uncomfortable early stages of building. Second, I volunteered in elderly houses, where the work is mostly presence and dignity. Third, after Oct 7, I joined farm volunteer shifts. Sometimes the most important help is simply showing up and doing the physical work that keeps life moving.",
      "whatIDid": [
        "Mentored student teams as an entrepreneurship TA and helped them turn ideas into next steps.",
        "Volunteered in elderly houses and learned how to be fully present without trying to fix everything.",
        "Joined farm volunteer shifts after Oct 7 and did the unglamorous work that still matters."
      ],
      "impact": [
        "Built a habit of consistency and responsibility that shows up in how I lead and build."
      ],
      "evidence": [],
      "deepDive": "Volunteering taught me the difference between helping and performing help.\n\nIn elderly houses, I learned that agency can disappear quietly. A person can be surrounded by staff and still feel unseen. The most meaningful moments were not dramatic. They were small: sitting with someone long enough for them to speak, asking what they want instead of guessing, and treating dignity as practical.\n\nAs an entrepreneurship TA in MEET, the work was different but connected. Students do not need you to be a hero. They need you to listen, ask the right questions, and make the next step feel possible.\n\nAfter Oct 7, I joined farm volunteer shifts because the moment called for hands. It grounded me. No speeches. Just work.\n\nThis is the mindset I try to carry into everything else: show up, be useful, and stay human."
    }
  },
  {
    "id": "be-useful",
    "type": "book",
    "title": "Be Useful",
    "date": "high school",
    "tags": [
      "Leadership",
      "Craft"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/book/be_useful/9780593792988.jpeg",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": [
        "/images/book/be_useful/9780593792988.jpeg"
      ]
    },
    "card": {
      "oneLiner": "When I feel noisy inside, I come back to usefulness.",
      "headline": "Action is a form of respect",
      "subhead": "A simple question that cuts through excuses: what helps right now?"
    },
    "beats": [
      "Discipline is not a mood. It is a decision I practice.",
      "Useful work makes anxiety smaller because it gives my hands a job.",
      "I measure days by what I finished, not what I felt."
    ],
    "caseFile": {
      "context": "This book feels like a steady hand on my shoulder. Not inspirational in the loud way. Practical in the quiet way. It pushed me to stop waiting for the perfect mindset and start building self trust through small actions.",
      "whatIDid": [
        "I treat usefulness as a filter when I am overwhelmed.",
        "I turn big goals into one next step that I can finish today.",
        "I try to build routines that survive stress, not routines that require perfect conditions."
      ],
      "impact": [
        "I became less dependent on motivation to move.",
        "I learned to calm myself by choosing a concrete action.",
        "I started valuing consistency over intensity."
      ],
      "evidence": [],
      "deepDive": "Some advice tries to make you feel powerful. This one asks you to become reliable. I like that it does not romanticize struggle. It respects repetition. The deeper lesson for me is that usefulness is not only service to others. It is a way to protect my own mind. When I focus on what is useful, I stop negotiating with my emotions. I step into a role. Builder. Teammate. Son. Friend. The identity comes first, then the action follows. Over time, that is how confidence becomes real."
    }
  },
  {
    "id": "rich-dad-poor-dad",
    "type": "book",
    "title": "Rich Dad Poor Dad",
    "date": "high school",
    "tags": [
      "Leadership",
      "Entrepreneurship"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/book/rich_dad_poor_dad/0013778173-L.jpg",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": [
        "/images/book/rich_dad_poor_dad/0013778173-L.jpg"
      ]
    },
    "card": {
      "oneLiner": "I used it as a lens, not a bible.",
      "headline": "Value is a system, not a paycheck",
      "subhead": "It taught me to ask what compounds, and what just looks busy."
    },
    "beats": [
      "I started thinking in incentives, not just effort.",
      "Ownership is not greed. It is responsibility for outcomes.",
      "I learned to question the default path without disrespecting it."
    ],
    "caseFile": {
      "context": "This book is controversial, and I understand why. I did not take it as technical truth. I took it as a provocation. The useful part was the mental separation between activity and compounding value. It made me ask harder questions about time.",
      "whatIDid": [
        "I look at projects through a compounding lens: skills, systems, relationships, trust.",
        "I separate learning from performing. I do not confuse motion with progress.",
        "I try to build assets that grow with reuse, like code, writing, and tools."
      ],
      "impact": [
        "I became more intentional about where my hours go.",
        "I started respecting leverage without worshipping money.",
        "I learned to verify ideas instead of repeating slogans."
      ],
      "evidence": [],
      "deepDive": "The highest value I got from this book was not a tactic. It was a question. Does this path make me more dependent, or more capable? If I keep doing this for years, will it compound into freedom or into exhaustion? I think this is why it resonates with young people. It gives permission to think. But it also demands maturity, because permission without rigor becomes fantasy. So I keep the spark and I add my own responsibility: I cross check, I learn from other sources, and I focus on building real skills. For me, that is the honest way to carry its influence forward."
    }
  },
  {
    "id": "start-with-why",
    "type": "book",
    "title": "Start With Why",
    "date": "high school",
    "tags": [
      "Leadership",
      "Craft"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/book/start_with_why/images_1.jpeg",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": [
        "/images/book/start_with_why/images_1.jpeg"
      ]
    },
    "card": {
      "oneLiner": "Clarity builds trust faster than charisma.",
      "headline": "Purpose is a discipline",
      "subhead": "If I cannot explain why in one sentence, I am not ready to build."
    },
    "beats": [
      "A clear why makes tradeoffs easier and ego smaller.",
      "The why is not a slogan. It is a decision filter.",
      "Teams move faster when meaning is shared, not assumed."
    ],
    "caseFile": {
      "context": "I do not treat this as a scientific proof. I treat it as a communication tool. When a purpose is vague, everything becomes harder: priorities, scope, even relationships. This book pushed me to practice clarity without hype.",
      "whatIDid": [
        "I try to write the purpose in plain language before I design anything.",
        "I use the why to decide what not to build.",
        "I test whether my story is real by asking if it survives simple questions."
      ],
      "impact": [
        "I learned to lead with meaning instead of features.",
        "I became more honest about tradeoffs and constraints.",
        "I reduced the gap between what I say and what I actually do."
      ],
      "evidence": [],
      "deepDive": "I used to think purpose was a nice speech you give at the beginning. Now I see it as a daily habit. The best why is not poetic. It is usable. It helps you say no. It helps you stay kind when pressure rises because you remember what you are protecting. And it also keeps you humble. A why is not proof that you are right. It is proof that you have a direction. Execution still decides everything. So the real lesson I carry is this: if the why is true, it should show up in the small choices, not only in the headline."
    }
  },
  {
    "id": "the-almanack",
    "type": "book",
    "title": "The Almanack of Naval Ravikant",
    "date": "high school",
    "tags": [
      "Leadership",
      "Entrepreneurship"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/book/the_almanack/the-almanack-of-naval-ravikant-9798893310948_lg.jpg",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": [
        "/images/book/the_almanack/the-almanack-of-naval-ravikant-9798893310948_lg.jpg"
      ]
    },
    "card": {
      "oneLiner": "It sharpened how I think about leverage and calm.",
      "headline": "Build what scales, protect what matters",
      "subhead": "Attention, judgment, and specific knowledge are the real currency."
    },
    "beats": [
      "Leverage is not a flex. It is a responsibility.",
      "Specific knowledge grows when learning feels like play, not obligation.",
      "Calm is not a reward. It is part of good work."
    ],
    "caseFile": {
      "context": "This book feels like a set of clean mental models. Not to quote. To test. The parts I keep are about leverage and attention. They match what I feel when I build: the best results come from doing fewer things with more care.",
      "whatIDid": [
        "I try to build reusable systems instead of one time effort.",
        "I protect attention by reducing noise and choosing deep focus.",
        "I treat calm as an input to quality, not a luxury."
      ],
      "impact": [
        "I became more deliberate about what deserves my time.",
        "I started chasing clarity over speed.",
        "I learned to respect long term thinking without losing urgency."
      ],
      "evidence": [],
      "deepDive": "The idea that changed me most is that leverage is not a personality trait. It is a design choice. You can choose to build something that helps one person once, or something that helps many people repeatedly. Both are honorable. But they ask different things from you. Leverage asks for patience, precision, and accountability. It also exposes your values, because what you build at scale will carry your fingerprints. That is why the second lesson matters: attention. If my attention is fragmented, my values will be shallow. When I protect attention, my work becomes calmer, and my decisions become cleaner. That is the forward looking part for me. I want to build at scale, but with a conscience."
    }
  },
  {
    "id": "the-power-of-now",
    "type": "book",
    "title": "The Power of Now",
    "date": "high school",
    "tags": [
      "Identity",
      "Leadership"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/book/the_power_of_now/9780340733509.jpg",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": [
        "/images/book/the_power_of_now/9780340733509.jpg"
      ]
    },
    "card": {
      "oneLiner": "A manual for staying steady under pressure.",
      "headline": "Presence is a skill I can practice",
      "subhead": "I do not need to win the mind. I just need to guide it."
    },
    "beats": [
      "I can notice a thought without following it.",
      "One breath can interrupt a spiral.",
      "Clarity often arrives after I stop wrestling the moment."
    ],
    "caseFile": {
      "context": "I read this when my mind felt louder than my schedule. I do not agree with every framing, but I respect the core training: return to the present. It helped me separate myself from the story my stress tries to write.",
      "whatIDid": [
        "I practice a small pause before reacting, even if it is one breath.",
        "I try to name what is happening inside me instead of becoming it.",
        "I return to the next step in front of me, not the future I am afraid of."
      ],
      "impact": [
        "I became more stable during intense weeks.",
        "I learned to recover faster after setbacks.",
        "I started treating attention like something I can train."
      ],
      "evidence": [],
      "deepDive": "The quiet lesson here is that I do not have to believe every thought that arrives. That sounds simple, but it changes everything. It turns anxiety from a commander into a signal. It turns anger from identity into information. When I am present, I stop arguing with reality and I start acting inside it. That is what makes this book practical for ordinary life. It does not remove pressure. It changes my relationship with pressure. I still have ambition. I still have deadlines. But I am learning to carry them without losing my center. That is the kind of strength I want to keep building."
    }
  },
  {
    "id": "think-again",
    "type": "book",
    "title": "Think Again",
    "date": "high school",
    "tags": [
      "Leadership",
      "Craft"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/book/think_again/9781984878106.jpeg",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": [
        "/images/book/think_again/9781984878106.jpeg"
      ]
    },
    "card": {
      "oneLiner": "It taught me to treat certainty like a draft.",
      "headline": "Confidence with a door open",
      "subhead": "I can lead confidently and still stay revisable."
    },
    "beats": [
      "Being wrong is not a threat. It is must.",
      "A good argument is one that makes me smarter, not louder.",
      "The goal is not to win. The goal is to update."
    ],
    "caseFile": {
      "context": "This book made me respect rethinking as a skill. Not an apology. Not indecision. A skill. It helped me detach ego from ideas, which matters in building and in relationships.",
      "whatIDid": [
        "I try to ask what would change my mind before debating.",
        "I practice separating identity from opinion.",
        "I invite critique earlier so revisions are cheaper and kinder."
      ],
      "impact": [
        "I became less defensive when challenged.",
        "I learned to treat feedback as collaboration, not judgment.",
        "I started seeing humility as a form of strength."
      ],
      "evidence": [],
      "deepDive": "The best leaders I know are not the most certain. They are the most teachable. That is the shift this book gave me. It reframed rethinking as integrity. If reality changes, I should change too. That does not weaken conviction. It refines it. In practice, this means I try to build opinions the way I build products: test, iterate, and keep what survives contact with truth. It also means I aim for conversations where the relationship matters more than being right. That is the future I want. Less performance. More learning."
    }
  },
  {
    "id": "7-habits-teen",
    "type": "book",
    "title": "7 Habits of Highly Effective Teens",
    "date": "high school",
    "tags": [
      "Leadership",
      "Craft"
    ],
    "privacy": "public",
    "media": {
      "heroImage": "/images/book/7_habits_of_highly_effective_teenagers/the-7-habits-of-highly-effective-teens-9781476764665_hr.jpg",
      "teaserVideo": "",
      "youtubeUrl": "",
      "gallery": [
        "/images/book/7_habits_of_highly_effective_teenagers/the-7-habits-of-highly-effective-teens-9781476764665_hr.jpg"
      ]
    },
    "card": {
      "oneLiner": "The book I link to early structure and agency.",
      "headline": "Habits are architecture",
      "subhead": "A simple framework that taught me I can shape my days."
    },
    "beats": [
      "I am not a victim of mood. I can choose my next step.",
      "Small commitments build identity over time.",
      "Private wins come first, then public wins follow."
    ],
    "caseFile": {
      "context": "I associate this book with learning responsibility in a concrete way. Not inspirational quotes. Simple habits that create self respect. It gave me language for agency when I was still learning how to manage pressure.",
      "whatIDid": [
        "I try to plan my week around priorities, not urgency.",
        "I practice making small promises and keeping them.",
        "I return to basics when life feels chaotic."
      ],
      "impact": [
        "I became more structured when motivation was not enough.",
        "I learned to see discipline as self care, not punishment.",
        "I started thinking of growth as something I can design."
      ],
      "evidence": [],
      "deepDive": "The most underrated part of growing up is learning that freedom is built, not found. This book gave me a map for that. Not perfect. Not rigid. Just usable. It taught me that the person I want to be is a set of habits I repeat when no one is watching. That idea has stayed with me. When I drift, I do not need a dramatic reset. I need one small habit returned to its place. One honest plan. One task finished. One conversation handled with respect. That is how I want to live forward. With agency that is quiet, consistent, and real."
    }
  }
];
