/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreativeProfile, Post, CollaborationProject, Conversation, CollabApplication } from "../types";

export const INITIAL_USER_PROFILE: CreativeProfile = {
  id: "user-seth",
  name: "Seth Ansah Tetteh",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80", // Will fallback or represent the user
  banner: "", // We will draw a custom css version representing his automated Yaw banner or fallback to beautiful Unsplash
  headline: "Creative Developer & AI Automation Specialist | Student at Presbyterian University College",
  bio: "Helping businesses automate, scale, and save time with custom AI tools. Deeply interested in the intersection of digital art, software engineering, and collaborative media. Currently exploring procedural shaders and motion-driven creative systems.",
  location: "Detroit Metropolitan Area",
  discipline: "Creative Coding & AI Automation",
  openToWork: true,
  skills: [
    "AI Automation & Workflows",
    "Creative Web Development",
    "React / TypeScript",
    "Generative Digital Art",
    "UI/UX Interactive Design",
    "Motion Design",
    "Shader Programming",
    "No-Code & Low-Code Pipelines"
  ],
  connectionsCount: 248,
  collabsCompleted: 12,
  website: "https://github.com/sethansah",
  endorsements: {
    "AI Automation & Workflows": ["creative-anya", "creative-marcus"],
    "Creative Web Development": ["creative-devon", "creative-hana"],
    "React / TypeScript": ["creative-devon"],
    "Generative Digital Art": ["creative-hana"]
  },
  featuredProjects: [
    {
      id: "proj-user-1",
      title: "Yaw Generative Shaders",
      description: "Interactive GPU fluid simulator responding to user mouse coordinates, optimized for custom web layouts.",
      imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
      category: "Creative Coding",
      likesCount: 24,
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-abstract-digital-technology-circuit-loop-43188-large.mp4"
    }
  ],
  emailSettings: {
    newApplications: true,
    newEndorsements: true,
    newMessages: false,
    weeklyDigest: true
  }
};

export const INITIAL_PROFILES: CreativeProfile[] = [
  INITIAL_USER_PROFILE,
  {
    id: "creative-anya",
    name: "Anya Kovalenko",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
    headline: "Senior 3D Character Artist & Sculptor | Freelance",
    bio: "Ex-Ubisoft. Passionate about bringing detailed, high-fidelity cyberpunk and sci-fi characters to life. Currently building an independent game engine demo and looking for sound designers to join my crew.",
    location: "Vancouver, Canada",
    discipline: "3D Art & Animation",
    openToWork: true,
    skills: ["ZBrush", "Substance Painter", "Unreal Engine 5", "Character Design", "3D Sculpting", "Maya"],
    connectionsCount: 1420,
    collabsCompleted: 34,
    website: "https://artstation.com/anyakov",
    endorsements: {
      "ZBrush": ["creative-marcus", "creative-devon"],
      "Substance Painter": ["creative-hana"],
      "Unreal Engine 5": ["creative-devon", "user-seth"],
      "Character Design": ["creative-hana", "creative-marcus"],
      "3D Sculpting": ["creative-hana"]
    },
    featuredProjects: []
  },
  {
    id: "creative-marcus",
    name: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    banner: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
    headline: "Sound Architect & Cinematic Ambient Composer",
    bio: "Crafting atmospheric synth pads, procedural sound design, and full scores for indie games and cinematic short films. Looking to bridge visual art with bespoke interactive audio experiences.",
    location: "Berlin, Germany",
    discipline: "Sound Design & Music",
    openToWork: false,
    skills: ["Ableton Live", "Max/MSP", "FMOD", "Interactive Audio", "Synth Programming", "Spatial Sound"],
    connectionsCount: 890,
    collabsCompleted: 18,
    website: "https://soundcloud.com/marcusv_sound",
    endorsements: {
      "Ableton Live": ["creative-anya"],
      "Max/MSP": ["creative-devon"],
      "Interactive Audio": ["creative-anya", "user-seth"],
      "Synth Programming": ["creative-devon", "creative-anya"]
    },
    featuredProjects: []
  },
  {
    id: "creative-hana",
    name: "Hana Katsura",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
    headline: "Visual Storyteller, Comic Illustrator & Concept Artist",
    bio: "Specializing in rich, detailed digital painting and storyboard narratives. Love blending traditional watercolor textures into digital illustration. Let's build immersive worlds together!",
    location: "Kyoto, Japan",
    discipline: "Illustration & Concept Art",
    openToWork: true,
    skills: ["Procreate", "Photoshop", "Storyboard Art", "Digital Painting", "Character Concept", "Traditional Watercolor"],
    connectionsCount: 1850,
    collabsCompleted: 42,
    website: "https://hanakatsura.com",
    endorsements: {
      "Procreate": ["creative-anya"],
      "Photoshop": ["creative-anya", "creative-devon"],
      "Digital Painting": ["creative-anya", "user-seth"],
      "Character Concept": ["creative-anya", "creative-marcus"]
    },
    featuredProjects: []
  },
  {
    id: "creative-devon",
    name: "Devon Sinclair",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80",
    headline: "Creative Director & Generative Web Developer",
    bio: "Designing interfaces that respond to user motion, physics simulation, and touch. Exploring WebGL, Three.js, and interactive projection mapping installations.",
    location: "London, UK",
    discipline: "Creative Coding & UI/UX",
    openToWork: true,
    skills: ["Three.js", "WebGL", "Framer Motion", "GLSL Shaders", "UI/UX Architecture", "Creative Direction"],
    connectionsCount: 1102,
    collabsCompleted: 21,
    website: "https://devonsinclair.dev",
    endorsements: {
      "Three.js": ["user-seth", "creative-anya"],
      "WebGL": ["user-seth"],
      "GLSL Shaders": ["user-seth", "creative-marcus"],
      "Creative Direction": ["creative-anya", "creative-hana"]
    },
    featuredProjects: []
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "post-1",
    author: {
      id: "creative-anya",
      name: "Anya Kovalenko",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
      headline: "Senior 3D Character Artist & Sculptor | Freelance",
      discipline: "3D Art & Animation"
    },
    content: "Just finalized the real-time displacement and skin textures for my latest cyberpunk wanderer. Modeled completely in ZBrush, textured in Substance, and rendered inside Unreal Engine 5.2. I'm focusing heavily on hyper-real micro-pores and light scattering in dark, high-contrast environments.\n\nI'm seeking a SOUND DESIGNER who can craft a moody, industrial-ambient soundscape for the final animated sequence. Drop your portfolio below or DM if interested! Let's build a masterpiece.",
    imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=80",
    tags: ["3DArt", "UnrealEngine", "CharacterDesign", "SoundDesignCollab", "Cyberpunk", "VFX"],
    likesCount: 142,
    likedByUser: false,
    createdAt: "2026-07-03T10:30:00Z",
    category: "3D Art",
    comments: [
      {
        id: "c1",
        authorName: "Marcus Vance",
        authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
        authorHeadline: "Sound Architect & Ambient Composer",
        content: "Oh, Anya! This texturing is sublime. The sub-surface scattering on the cheeks looks incredibly natural. I would absolutely love to craft a gritty synth soundscape for this. Dming you some work right now!",
        createdAt: "2026-07-03T11:15:00Z"
      },
      {
        id: "c2",
        authorName: "Seth Ansah Tetteh",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
        authorHeadline: "Creative Developer & AI Automation Specialist",
        content: "The level of specular reflection on those goggles is perfect. Anya, if you plan to host this as an interactive WebGL portfolio, I can help optimize the assets and build a responsive shader-based transition for the web showcase!",
        createdAt: "2026-07-03T12:00:00Z"
      }
    ]
  },
  {
    id: "post-2",
    author: {
      id: "creative-devon",
      name: "Devon Sinclair",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      headline: "Creative Director & Generative Web Developer",
      discipline: "Creative Coding & UI/UX"
    },
    content: "Spent my morning writing dynamic fluid simulation nodes in WebGL. The idea is to have an interactive web header that curls and flows around user's mouse pointer, acting as a natural, fluid menu drawer trigger.\n\nCode runs at a solid 60fps even on mobile browsers. Super clean, responsive, and responsive. Feedback is highly appreciated!",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80",
    tags: ["CreativeCoding", "WebGL", "GenerativeArt", "InteractionDesign", "TypeScript", "FrontEndDeveloper"],
    likesCount: 89,
    likedByUser: true,
    createdAt: "2026-07-02T15:45:00Z",
    category: "Creative Coding",
    comments: [
      {
        id: "c3",
        authorName: "Seth Ansah Tetteh",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
        authorHeadline: "Creative Developer & AI Automation Specialist",
        content: "This is stunning Devon! Are you utilizing standard Navier-Stokes equations for the grid-based fluid solvers, or is this a particle-based approach? I've been experimenting with GPU-bound particles for a similar project in Africa and would love to exchange notes.",
        createdAt: "2026-07-02T16:20:00Z"
      }
    ]
  },
  {
    id: "post-3",
    author: {
      id: "creative-hana",
      name: "Hana Katsura",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      headline: "Visual Storyteller, Comic Illustrator & Concept Artist",
      discipline: "Illustration & Concept Art"
    },
    content: "Here is page 4 of my ongoing cosmic graphic novel, 'The Starlight Calligraphy'. Blending heavy traditional hand-inked linework with watercolor-inspired soft digital washes. It tells the story of an ancient scribe communicating with celestial bodies through calligraphy.\n\nI am currently looking for an AMBIENT MUSIC COMPOSER who can create a custom, lo-fi / celestial playlist that readers can listen to on Spotify or Bandcamp while flipping through the pages. Let's make this an fully immersive auditory-visual experience!",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
    tags: ["ComicArt", "ConceptIllustration", "GraphicNovel", "WorldBuilding", "CreativeCollab", "AmbientMusic"],
    likesCount: 205,
    likedByUser: false,
    createdAt: "2026-07-01T08:12:00Z",
    category: "Illustration",
    comments: []
  }
];

export const INITIAL_COLLAB_PROJECTS: CollaborationProject[] = [
  {
    id: "collab-1",
    title: "Indie Sci-Fi RPG: Celestial Soundscapes",
    owner: {
      id: "creative-anya",
      name: "Anya Kovalenko",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
      headline: "Senior 3D Character Artist & Sculptor | Freelance",
      discipline: "3D Art & Animation"
    },
    description: "Developing an immersive, stylized indie RPG about a nomadic digital architect exploring dying constellations. The visual style is highly cinematic, featuring retro-futuristic synth-mesh structures. We have complete 3D prototypes ready and need a composer to design the sonic signature of the primary star-system.",
    disciplineRequired: ["Sound Design & Music", "Ambient Composer"],
    rewardType: "Revenue Share",
    rewardValue: "25% Studio Profit-Share + Dedicated Credits",
    status: "open",
    applicationsCount: 4,
    tags: ["GameAudio", "IndieGame", "SciFi", "ElectronicAmbient", "GameDevelopment"],
    details: "We are an experienced team of 3 (1 coder, 1 writer, and myself on 3D/Design). The game has already caught interest in a few indie circles. We expect to launch an open alpha demo in 3 months. The composer will be in charge of designing 4 ambient tracks (approx. 3-4 mins each) that react dynamically to the star density in-game, and about 15 UI / atmospheric sound effects.",
    createdAt: "2026-07-02T12:00:00Z"
  },
  {
    id: "collab-2",
    title: "Generative Audio-Visual Live Stream System",
    owner: {
      id: "user-seth",
      name: "Seth Ansah Tetteh",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      headline: "Creative Developer & AI Automation Specialist | Student at Presbyterian University College",
      discipline: "Creative Coding & AI Automation"
    },
    description: "Building an automated, generative WebGL audio visualizer that parses live audio signals and creates beautifully responsive 3D geometric structures reacting in real-time. Looking for a talented Electronic Music Producer or Sound Coder to provide high-quality modular synth stems or co-develop WebAudio triggers.",
    disciplineRequired: ["Sound Design & Music", "Creative Coding"],
    rewardType: "Collaborative Credit",
    rewardValue: "Joint Exhibition Submission + GitHub Co-Author",
    status: "open",
    applicationsCount: 2,
    tags: ["AudioVisual", "ModularSynth", "WebGL", "ThreeJS", "InteractiveArt", "Exhibition"],
    details: "This is a passion project targeted at digital art exhibitions and festivals. The frontend is largely complete, engineered with ThreeJS and WebGL shaders. I need someone to help craft the core sound system, utilizing either modular synthesizer audio streams or writing customized WebAudio API nodes that bridge the visual parameters to the sound spectrum perfectly.",
    createdAt: "2026-07-01T14:30:00Z"
  },
  {
    id: "collab-3",
    title: "Lumina: Immersive VR Comic Book",
    owner: {
      id: "creative-hana",
      name: "Hana Katsura",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      headline: "Visual Storyteller, Comic Illustrator & Concept Artist",
      discipline: "Illustration & Concept Art"
    },
    description: "Porting an existing fantasy comic into a fully three-dimensional, spatial virtual reality reader. Looking for an experienced Unity/WebVR Creative Programmer to build the interactive page-curl portals, canvas depth maps, and dynamic parallax atmospheric effects.",
    disciplineRequired: ["Creative Coding & UI/UX", "Unity Developer", "WebVR Developer"],
    rewardType: "Paid Contract",
    rewardValue: "$2,500 Budget + Milestone Bonuses",
    status: "open",
    applicationsCount: 7,
    tags: ["VR", "InteractiveComic", "WebXR", "Unity3D", "ConceptArt", "ImmersiveStorytelling"],
    details: "Lumina has already sold 5,000+ digital copies. This VR adaptation is sponsored by a local artistic grant. We need a creative developer who has a keen eye for aesthetics — not just engineering. You will translate 2D watercolor drawings into layered 2.5D visual stages that users can walk inside and interact with. The initial contract spans 8 weeks.",
    createdAt: "2026-06-29T10:00:00Z"
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-sophie",
    participant: {
      id: "creative-sophie",
      name: "Sophie Z. Novati",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80",
      headline: "Founder @ Formation | Building a more equitable tech industry",
      discipline: "Technical Recruiting & Founder",
      isOnline: true,
      pronouns: "(She/Her)"
    },
    messages: [
      {
        id: "m-sophie-1",
        senderId: "creative-sophie",
        text: "process there. It's actually been our top placement recently! Given all of the super recent first-party data we have about what it takes to succeed in that interview process, we have a Meta specific prep track for folks interested. Would you like to apply and speak to one of our recruiters?",
        timestamp: "2026-07-04T21:05:00Z",
        actions: ["Apply", "Show me recent placements"]
      },
      {
        id: "m-sophie-2",
        senderId: "user-seth",
        text: "Show me recent placements",
        timestamp: "2026-07-04T21:07:00Z"
      },
      {
        id: "m-sophie-3",
        senderId: "creative-sophie",
        text: "Hope you got the info you needed! If you'd like to apply, we'd love to see your application come through!",
        timestamp: "2026-07-04T21:07:00Z",
        actions: ["Apply today"]
      }
    ],
    lastMessageTime: "2026-07-04T21:07:00Z",
    unreadCount: 0
  },
  {
    id: "conv-1",
    participant: {
      id: "creative-anya",
      name: "Anya Kovalenko",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
      headline: "Senior 3D Character Artist & Sculptor | Freelance",
      discipline: "3D Art & Animation",
      isOnline: true
    },
    messages: [
      {
        id: "m1",
        senderId: "creative-anya",
        text: "Hi Seth! I saw your comment on my Unreal Engine skin shader post. You mentioned you could help build a WebGL browser viewport. How heavy is the optimization process for high-res mesh assets?",
        timestamp: "2026-07-03T14:05:00Z"
      },
      {
        id: "m2",
        senderId: "user-seth",
        text: "Hey Anya! Great to connect. It's actually highly feasible. We can decimate the meshes using decimation modifiers in Blender to reduce poly-count, then bake the high-poly micro-pore detail onto normal maps. That way, the asset stays extremely lightweight (under 5MB) while retaining 95% of your sculpted fidelity in the browser!",
        timestamp: "2026-07-03T14:15:00Z"
      },
      {
        id: "m3",
        senderId: "creative-anya",
        text: "That sounds absolutely stellar. I was worried it would look like a 2004 mobile game, but baking those high-poly normals is brilliant. Do you have a small portfolio of WebGL viewers I can check out?",
        timestamp: "2026-07-03T14:22:00Z"
      },
      {
        id: "m4",
        senderId: "user-seth",
        text: "Absolutely, I'm setting up our dynamic collab staging space right now. I can also generate a prototype scene using one of your lower-res OBJ models so you can see it in action. Would you like me to set up a collaboration milestone for us to draft the tech requirements?",
        timestamp: "2026-07-03T14:28:00Z"
      },
      {
        id: "m5",
        senderId: "creative-anya",
        text: "Yes, please! Let's establish a formal collaboration proposal. It makes everything much cleaner.",
        timestamp: "2026-07-03T14:30:00Z"
      }
    ],
    lastMessageTime: "2026-07-03T14:30:00Z",
    unreadCount: 18
  },
  {
    id: "conv-2",
    participant: {
      id: "creative-marcus",
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
      headline: "Sound Architect & Cinematic Ambient Composer",
      discipline: "Sound Design & Music",
      isOnline: false
    },
    messages: [
      {
        id: "m2_1",
        senderId: "user-seth",
        text: "Hey Marcus, loved your interactive modular ambient synth track. I was thinking of hooking it up to a generative particle canvas. Would you be open to exporting some multitrack stems?",
        timestamp: "2026-07-02T18:00:00Z"
      },
      {
        id: "m2_2",
        senderId: "creative-marcus",
        text: "Hi Seth! That sounds incredibly fun. I have separate stems for the modular pad, the random FM bleeps, and the sub-bass pulse. Let's definitely build something. I'll package them up for you tomorrow morning!",
        timestamp: "2026-07-02T19:30:00Z"
      }
    ],
    lastMessageTime: "2026-07-02T19:30:00Z",
    unreadCount: 0
  }
];

export const INITIAL_APPLICATIONS: CollabApplication[] = [
  {
    id: "app-1",
    projectId: "collab-2",
    projectTitle: "Generative Audio-Visual Live Stream System",
    applicantId: "creative-marcus",
    applicantName: "Marcus Vance",
    applicantAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    message: "Hey Seth, this audio-visual live stream concept aligns perfectly with my work. I have several generative modular synth loops ready, and I can write custom Web Audio API scripts to pass frequency data direct to your WebGL shader uniform bindings. Let's make something amazing!",
    portfolioLink: "https://soundcloud.com/marcusv_sound",
    status: "pending",
    createdAt: "2026-07-02T16:00:00Z"
  }
];

// Initial predefined categories for filtering
export const ARTISTIC_DISCIPLINES = [
  "All Disciplines",
  "Creative Coding & UI/UX",
  "3D Art & Animation",
  "Sound Design & Music",
  "Illustration & Concept Art"
];

export const PROJECT_CATEGORIES = [
  "All Categories",
  "Creative Coding",
  "3D Art",
  "Sound Design",
  "Illustration",
  "VR/AR"
];
