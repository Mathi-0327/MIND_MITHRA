import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, ShadingType } from "docx";
import * as fs from "fs";
import * as path from "path";

async function generateReportDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200, before: 200 },
            children: [
              new TextRun({
                text: "MIND MITHRA",
                bold: true,
                size: 48,
                color: "0F766E", // Teal 700
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "AI-Powered Cognitive & Emotion Companion for Dementia & Elderly Care",
                italics: true,
                size: 26,
                color: "334155",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            children: [
              new TextRun({
                text: "Comprehensive Project Report & Technical Architecture Specification",
                bold: true,
                size: 24,
                color: "D97706", // Amber 600
                font: "Calibri",
              }),
            ],
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: "Project Name", bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Mind Mithra (North East Cognitive Companion)" })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: "Target Domain", bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Alzheimer's, Dementia & Cognitive Decline Support for Geriatric Care" })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: "Supported Languages", bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Assamese, Bengali, Manipuri, Khasi, Mizo, Hindi, English" })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: "Core Architecture", bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Full-Stack Single-Page App (React 19 + Node.js Express + Gemini AI) with PWA & APK Support" })] })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 400, after: 200 } }),

          // SECTION 1: EXECUTIVE SUMMARY
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: "1. Executive Summary", bold: true, color: "0F766E", size: 32 })],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Mind Mithra is an intelligent, compassionate, and multimodal digital health platform purpose-built for elderly individuals living with Mild Cognitive Impairment (MCI), Alzheimer's Disease, and related dementias. Recognizing the acute shortage of specialized geriatric neurological care across regional India—with specific emphasis on the 8 North-Eastern states—Mind Mithra acts as a 24/7 digital companion bridging clinical monitoring, reminiscence therapy, and caregiver coordination.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "The platform couples a Face-First Vision AI pipeline that verifies patient presence and evaluates emotional distress with a natural multilingual Voice Assistant, local cultural reminiscence media, adaptive cognitive games, and a clinical caregiver copilot.",
                size: 22,
              }),
            ],
          }),

          // SECTION 2: PROBLEM STATEMENT & CLINICAL IMPORTANCE
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: "2. Clinical & Regional Problem Statement", bold: true, color: "0F766E", size: 32 })],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "• High Burden & Low Accessibility: Over 8.8 million Indians age 60+ live with dementia. In remote North-Eastern states, access to geriatric psychologists and neurologists is severely constrained by geography and language barriers.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "• Caregiver Burnout: Family caregivers often lack structured clinical tools to monitor progression, manage sundowning agitation, or track daily cognitive fluctuations.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "• Digital Exclusion: Traditional software requires complex typing, fine motor precision, and English fluency. Mind Mithra eliminates these barriers through large touch targets, voice-first navigation, and automatic camera face-presence verification.",
                size: 22,
              }),
            ],
          }),

          // SECTION 3: KEY SYSTEM MODULES
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: "3. Core Functional Modules", bold: true, color: "0F766E", size: 32 })],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "3.1 Face-First Presence & Emotion Detection", bold: true, color: "0369A1", size: 26 })],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "The system features a two-tier facial analysis engine. In Step 1, an on-device canvas pixel analyzer monitors center oval luminance, contrast, and skin chromaticity in real time (~250ms interval) to verify the patient's face is present and centered. In Step 2, a snapshot is processed via Google Gemini Vision AI to classify emotional states (Happy, Calm, Sad, Anxious, Agitated, Tired) with confidence scores and clinical trigger flags.",
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "3.2 Multilingual Voice Companion", bold: true, color: "0369A1", size: 26 })],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Provides empathetic speech-to-speech interaction powered by Web Speech Recognition and Gemini conversational intelligence. Elders can ask for the time, request tea garden songs, hear family updates, or seek calming reassurance during moments of panic or confusion.",
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "3.3 Reminiscence Vault & Cultural Radio", bold: true, color: "0369A1", size: 26 })],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Employs validated Reminiscence Therapy using regional folk music (Bihu, Rabindra Sangeet, Manipuri folk, Khasi acoustic, Mizo hymnals), tea garden soundscapes, family photo archives, and voice recordings from loved ones.",
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "3.4 Adaptive Cognitive Stimulation Workouts", bold: true, color: "0369A1", size: 26 })],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Offers interactive games spanning 5 neurological domains: Spatial Pattern Matching, Lexical Recall, Color-Word Stroop Inhibition, Math Memory, and Daily Sequence Organization. The engine dynamically tunes difficulty based on reaction time and error rate.",
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "3.5 Clinical Decision Support & Caregiver Copilot", bold: true, color: "0369A1", size: 26 })],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "The Caregiver Dashboard provides longitudinal analytics (Mini-Mental State Exam score approximations, emotional stability trends, medication adherence logs) and generates downloadable clinical summaries for doctor consultations.",
                size: 22,
              }),
            ],
          }),

          // SECTION 4: TECHNICAL STACK
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: "4. Detailed Technical Stack", bold: true, color: "0F766E", size: 32 })],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "0F766E", type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: "Layer / Component", bold: true, color: "FFFFFF" })] })],
                  }),
                  new TableCell({
                    shading: { fill: "0F766E", type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: "Technology / Framework", bold: true, color: "FFFFFF" })] })],
                  }),
                  new TableCell({
                    shading: { fill: "0F766E", type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: "Role & Key Capabilities", bold: true, color: "FFFFFF" })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Frontend Framework", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "React 19.0.1 + TypeScript 5.8" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Component lifecycle, strict typing, functional hooks, concurrent rendering" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Build & Bundler", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Vite 6.2.3 + esbuild 0.25" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Instant HMR, tree shaking, lightning fast production builds" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Styling & Design System", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tailwind CSS v4 + PostCSS" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Accessible color palettes, high-contrast elder themes, responsive layout math" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Animation Engine", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Motion (motion/react 12.23)" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Hardware-accelerated fluid transitions, calming ripple effects, gesture feedback" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Backend Server", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Node.js + Express 4.21 + tsx" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Proxy for AI API calls, offline event synchronization, medical report OCR & analysis" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Artificial Intelligence", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Google Gen AI SDK (@google/genai 2.4.0) - Gemini 2.5 Flash" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Multimodal Vision (face emotion), Natural Voice Dialogue, Clinical Report extraction" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Audio & Speech", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Web Audio API + SpeechSynthesis + webkitSpeechRecognition" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Synthesized calming chimes, regional TTS narration, hands-free mic listener" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Persistence & Sync", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "IndexedDB / LocalStorage + REST Sync Queue" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Full offline resilience with automatic queued event reconciliation upon reconnection" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Icons & Graphics", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Lucide React 0.546 + Recharts 3.10 + Canvas Confetti" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Accessible SVG iconography, cognitive progress charts, positive gamification" })] })] }),
                ],
              }),
            ],
          }),

          // SECTION 5: ANDROID APK ARCHITECTURE
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: "5. Android APK Integration & Hardware Access", bold: true, color: "0F766E", size: 32 })],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "Mind Mithra is engineered to package seamlessly as an Android APK (using Capacitor, Cordova, or Trusted Web Activity). Key hardware bridges include:",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "1. Camera Feed: Utilizes navigator.mediaDevices.getUserMedia mapped to Android CAMERA permissions for live face framing and emotion analysis.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "2. Voice Recognition: Uses Android System Speech Services (RECORD_AUDIO permission) supporting offline speech-to-text packs.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "3. Sound Generation: Leverages native Web Audio API oscillators and Google TTS engine directly for low-latency feedback without external streaming.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "4. Offline Storage: Encrypted device key-value store persists patient history, game scores, and family albums even with zero network connectivity.",
                size: 22,
              }),
            ],
          }),

          // SECTION 6: SECURITY & CLINICAL SAFEGUARDS
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: "6. Security, Privacy & Clinical Compliance", bold: true, color: "0F766E", size: 32 })],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "• Edge-First Data Minimization: Camera frames for face alignment are processed in ephemeral memory on the client canvas; raw video streams are never stored permanently.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "• Server-Side AI Gateway: All Gemini API keys and sensitive tokens reside exclusively in server-side environment variables, preventing browser or APK credential extraction.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "• Emergency Protocols: One-tap SOS and Safe Haven reassurance modes provide rapid intervention, audible tone broadcast, and GPS location dispatch for sundowning or wandering events.",
                size: 22,
              }),
            ],
          }),

          // FOOTER NOTE
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: "— End of Project Report & Technical Specification Document —",
                italics: true,
                color: "64748B",
                size: 20,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(process.cwd(), "public", "Mind_Mithra_Project_Report_and_Technical_Stack.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("Successfully generated DOCX report at: " + outPath);
}

generateReportDocx().catch((err) => {
  console.error("Error generating DOCX:", err);
  process.exit(1);
});
