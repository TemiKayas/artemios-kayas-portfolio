export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
}

export const projects: Project[] = [
  {
    id: "learn-wyrm",
    title: "Learn Wyrm",
    description: "Winner of the Boston University Spark! Innovation Challenge, winning the Spark! Innovation Award. LearnWyrm turns class materials into quick, interactive quizzes and mini-games, giving teachers an easy way to boost engagement without extra prep time. Students get a game-like learning experience instead of static PDFs, while teachers stay fully in control of the content. Educators can create classes, upload materials, generate questions, build games, and track progress—all in under a minute. The tool is built to stay aligned with real curriculum needs, works across any subject, and includes safeguards to keep content aligned and student data secure. Built with NextJS, Phaser HTML 5 game engine, google gemini, and PostgreSQL",
    image: "/assets/projects/learnwyrm.png",
    link: "https://learn-wyrm.vercel.app/"
  },
  {
    id: "class-chat",
    title: "Class Chat",
    description: "ClassChat is an AI-powered learning platform I founded and built to give universities secure, course-specific AI tutors without the hallucinations and privacy risks of general-purpose language models. I designed a custom Retrieval-Augmented Generation (RAG) framework that ingests official course materials and uses them as the system's exclusive knowledge base, ensuring responses are grounded in authoritative content and academically reliable. I architected the full data pipeline — including document ingestion, intelligent chunking, embeddings, and vector search — to optimize retrieval quality and eliminate irrelevant or fabricated outputs, making the system behave more like a trustworthy teaching assistant than a generic chatbot. I worked directly with faculty at institutions including Harvard and Boston University to align the platform with real pedagogical needs, academic integrity standards, and university privacy policies, allowing ClassChat to scale across higher education while preserving rigor, accuracy, and trust. Built with NextJS, OpenAI API for GPT and Emedding, and PostreSQL",
    image: "/assets/projects/classchat.png"
  },
  {
    id: "trailblazer",
    title: "Trailblazer",
    description: "A project for Boston Hacks 2025, Trailblazer is a multiplayer, location-based running game inspired by classic .io internet games, where students compete by physically \"conquering\" territory on a shared map through their real-world runs. Players authenticate with their university email, connect their Strava account, and each recorded run is transformed into colored paths that claim or overtake territory for their school, updating a live leaderboard in biweekly competitive seasons. The backend processes Strava GPS streams on AWS EC2, quantizes latitude and longitude into a grid-based map system, and dynamically generates SVG overlays that are rendered on an interactive Leaflet map in the frontend. As part of the team, I focused on connecting the backend to the frontend, deploying and hosting the system, and ensuring the full pipeline — from run ingestion to real-time visualization and ranking — worked reliably at scale, resulting in a fully functional, engaging experience that motivates users to be more active through friendly competition. This project was built with the Srava API, NextJS, Supabase, AWS EC2",
    image: "/assets/projects/trailblazer.png",
    link: "https://running-bh-frontend.vercel.app/"
  },
  {
    id: "fforacle",
    title: "FFOracle",
    description: "FFOracle is an AI-powered fantasy football decision assistant designed to help players make better weekly lineup and roster choices in an increasingly complex and data-heavy game. With over 1,700 players, league-specific scoring and roster rules, injuries, matchups, and external factors like weather and coaching decisions affecting outcomes each week, FFOracle centralizes and analyzes all of this information to provide personalized, explainable recommendations instead of generic rankings or black-box projections. The platform integrates live NFL data through the NFLVerse API, processes league-specific settings, and uses optimized AI prompts to generate context-aware advice tailored to each user's team and matchup, achieving up to 97% of a roster's theoretical maximum weekly points — where \"maximum points\" is defined as the total you would have earned if you had started the optimal combination of players from your own roster that week. Built with a modular frontend and backend architecture and deployed as a web application, FFOracle was developed collaboratively with a structured GitHub workflow and regular design iteration, resulting in a scalable system that reduces decision fatigue for fantasy players while increasing transparency, usability, and trust in AI-driven sports analytics. Built with a .NET C# backend, Supabase, NFLVerse API, AWS LAMDA, Stripe, OpenAI API, and NextJS.",
    image: "/assets/projects/fforacle.png",
    link: "https://fforacle.vercel.app/"
  },
  {
    id: "study-sync",
    title: "Study Sync",
    description: "StudySync is a real-time classroom engagement platform designed to replace clunky, expensive clicker systems with instant, zero-friction interaction using devices students already have. Professors upload lecture PDFs, which are processed with Google Gemini to generate live quizzes, summaries, and flashcards that are shared with students via a QR code — no apps, accounts, or subscriptions required. As students interact with the content during lecture, responses stream live to the professor's dashboard, enabling immediate insight into comprehension, confusion, and engagement across the entire room. Built with Next.js and TypeScript and deployed on Vercel, StudySync augments rather than replaces teaching by amplifying a professor's ability to reach, understand, and adapt to large audiences in real time, transforming passive lectures into active, responsive learning experiences without introducing cost or friction for students.",
    image: "/assets/projects/studysync.png",
    link: "https://harvard-hacks2025-jovz.vercel.app/"
  },
  {
    id: "camelitics",
    title: "Camelitics",
    description: "Camelitics is a data visualization tool built for marketers and designers that transforms raw Google Analytics JSON data into clean, interactive, presentation-ready charts that can be directly dragged into Adobe Express projects. The platform allows users to upload analytics data, instantly generate responsive visualizations, and customize them without needing technical or statistical expertise. Built with Next.js and Node.js using JavaScript, MUI, and styled-components, Camelitics focuses on making complex data feel approachable and usable inside creative workflows rather than siloed in technical dashboards. A major challenge was aligning interactive chart behavior with Adobe Express's drag-and-drop environment while maintaining responsiveness across screen sizes, but the result is an intuitive interface that lets users explore and present their data fluidly, bridging the gap between analytics and design.",
    image: "/assets/projects/camelitics.png",
    link: "https://github.com/TemiKayas/Camelitics"
  },
  {
    id: "plan-it",
    title: "Plan-It",
    description: "Built for Boston Hacks 2024 Wellness track. Plan-It is a wellness and productivity companion originally designed for astronauts that helps users track physical, mental, and emotional well-being through an engaging, interactive experience. The platform combines task management, meal logging, reflection prompts, and activity tracking with a visual, evolving alien companion that grows alongside the user's habits, turning wellness into something motivating rather than clinical. Built as a web application using JavaScript, HTML, CSS, TensorFlow, and designed in Figma, Plan-It focuses on encouraging consistency through visual feedback and emotional reinforcement. After initially exploring lidar-based room modeling and finding it impractical for real-time use, the project pivoted to a simpler, more accessible approach that better aligned with its goal of making wellness approachable and sustainable. The result is a supportive system that blends functionality with play, helping users stay engaged with healthy routines in extreme environments like space — or in everyday life on Earth.",
    image: "/assets/projects/planit.png",
    link: "https://github.com/jaquevan/Plan-It_bh2024"
  },
  {
    id: "lidar-tours",
    title: "LiDAR Tours",
    description: "LiDARTours is a VR tool that lets users explore dorm rooms and other hard-to-access spaces virtually. Inspired by our own experiences as college students navigating housing, we scanned a Wellesley dorm room using LiDAR, cleaned and enhanced the model in Blender, and created an immersive experience with BlenderVR. While our initial plan to import the model into Unity for interactive features didn't work due to texture issues, we pivoted to BlenderVR and still provided a fully navigable virtual space. LiDAR had some limitations—reflective surfaces and small objects like mugs or lamps were distorted—but the main details remained clear, giving users a realistic sense of the room. Our project taught us a lot about VR, 3D modeling, and LiDAR technology, and it could scale to virtual college tours or real estate walkthroughs. LiDARTours was built with Blender, BlenderVR, LiDAR, Polycam, Sketchfab, React, HTML, CSS, and JavaScript.",
    image: "/assets/projects/lidartours.png",
    link: "https://annissamu.github.io"
  },
];
