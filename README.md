# SnapMoment 📸

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![DeepFace](https://img.shields.io/badge/DeepFace-AI-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://github.com/serengil/deepface)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

> **Building for the moments that matter most.**  
> SnapMoment is an AI-powered event photo delivery platform that uses facial recognition to instantly deliver personalized galleries to guests. No more shared drives. No more manual searching.

---

## 🌟 Overview

SnapMoment was born from a simple frustration: why do event photos take days (or weeks) to arrive, often buried in a shared drive with thousands of strangers? We've built a seamless, AI-driven bridge between photographers' cameras and guests' heartbeats.

### 🎥 Demo / Live Link
- **Live Demo**: [https://snapmoment.app/demo](https://snapmoment.app/demo) *(Placeholder)*
- **Video Walkthrough**: [Link to Video](https://youtube.com/...) *(Placeholder)*

---

## ✨ Key Features

- **⚡ Instant AI Delivery**: Photos reach guests within seconds of upload using autonomous matching.
- **🖼️ Studio Branding**: Guest galleries are automatically customized with your studio logo and brand identity.
- **📷 RAW Live Tethering**: Connect your camera's local folder via the **Folder Sync Engine** for instant over-the-air ingestion. Supports `.RAW`, `.CR3`, `.WebP`, and more.
- **🧠 Neural-Lock Selfie**: Real-time biometric guidance (MediaPipe) ensures guests capture high-quality, matchable selfies.
- **🔍 Smart Person Clustering**: Uses **DBSCAN** to group faces into distinct personas, improving matching accuracy.
- **💳 Pro Billing & Subscriptions**: Integrated **Stripe** checkout with automated **PDF Invoice** generation and Gmail distribution.
- **🚀 High-Speed Search**: Powered by **pgvector** with HNSW indexing for sub-millisecond matching.
- **🔒 Privacy-Focused**: Facial data is stored only as 512-dimensional vectors. RAW selfies are processed in-memory.

---

## 🎁 Benefits

- **For Photographers**: 
  - **Save Time**: Eliminates the need for manual photo sorting or individual link sharing.
  - **Higher Engagement**: Guests are more likely to share photos immediately while the event energy is still high.
  - **Professionalism**: Delivers a futuristic, high-tech experience that builds your brand.
- **For Guests**:
  - **Instant Access**: Find your photos in the crowd without scrolling through thousands of others.
  - **Privacy**: No need to browse entire shared drives; see only the photos where you are present.
  - **Zero Friction**: No app downloads or account registrations required—just scan and see.

---

## 🏆 Competitive Advantages

- **State-of-the-Art Accuracy**: Leverages the **ArcFace** model (99.8% LFW Accuracy), outperforming standard facial recognition algorithms.
- **Scalable Architecture**: Built on **FastAPI** and **Celery**, allowing the system to handle thousands of concurrent uploads without lag.
- **Self-Healing Infrastructure**: Includes custom utilities for disk space management (VHDX compaction) to ensure long-term stability in local environments.
- **Cost-Efficiency**: Uses high-performance open-source AI models, eliminating the recurring costs of commercial facial recognition APIs.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Biometrics**: MediaPipe Tasks Vision (Real-time Detection)
- **Styling**: Tailwind CSS, Vanilla CSS (Design Tokens)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Billing**: Stripe API Integration
- **Invoicing**: FPDF (Automated PDF Engine)
- **Emails**: Gmail SMTP Integration
- **Async ORM**: SQLAlchemy 2.0 (with asyncpg)
- **Background Tasks**: Celery + Redis
- **Clustering**: Scikit-Learn (DBSCAN)
- **Database**: PostgreSQL 15 + pgvector (HNSW Indexing)
- **Authentication**: JWT (OTP-based sessions)

### AI & Computer Vision
- **Core Engine**: DeepFace
- **Biometric Model**: ArcFace (ResNet-100)
- **Real-time Detection**: MediaPipe BlazeFace (Frontend) / RetinaFace (Backend)
- **Vector Search**: Cosine Similarity via pgvector
- **Logic**: Two-Stage Matching (Fast Centroid + Exhaustive Fallback)

---

## 📐 Systems Architecture & Logic

### 0. Context Level DFD (Level 0)
```mermaid
graph LR
    %% External Entities (Ovals)
    Photog([Photographer])
    Guest([Event Guest])
    S3([Cloud Storage / AWS S3])
    SMS([SMS Gateway])
    Stripe([Stripe Checkout])
    Gmail([Gmail SMTP])

    %% Central Process (Box)
    System[[SnapMoment AI Platform]]

    %% Data Flows
    Photog -- "Event Setup / Folder Sync" --> System
    System -- "QR Code / Analytics" --> Photog

    Guest -- "Selfie / OTP Request" --> System
    System -- "Branded Gallery / SMS" --> Guest
    
    System -- "Payment Tracking" <--> Stripe
    System -- "Email Invoices" --> Gmail
    System -- "SMS Pin Request" --> SMS
    
    System -- "Studio Branding Data" <--> Pix[Logo Storage]

    System -- "Store Media" --> S3
    S3 -- "Image CDN URLs" --> System

    style System fill:#fff,stroke:#333,stroke-width:4px
    style Photog fill:#f9f9f9,stroke:#333
    style Guest fill:#f9f9f9,stroke:#333
    style S3 fill:#f9f9f9,stroke:#333
    style SMS fill:#f9f9f9,stroke:#333
    style Stripe fill:#f9f9f9,stroke:#333
    style Gmail fill:#f9f9f9,stroke:#333
```

### 0.1 Level 1 DFD (Internal Processes)
```mermaid
flowchart TD
    %% External Entities
    Photog([Photographer])
    Guest([Guest])

    %% Processes
    P1((1.0 Authenticate))
    P2((2.0 Manage Events))
    P3((3.0 AI Face Indexing))
    P4((4.0 Onboarding & Billing))
    P5((5.0 Identity Check))
    P6((6.0 Biometric Match))

    %% Data Stores
    D1[(D1: Photographers)]
    D2[(D2: Events)]
    D3[(D3: Photos)]
    D4[(D4: Face Index)]
    D5[(D5: Invoices)]

    %% Photographer Flow
    Photog -- "Credentials" --> P1
    P1 <--> D1
    
    Photog -- "Subscription" --> P4
    P4 <--> D5
    P4 <--> D1

    Photog -- "Event Settings" --> P2
    P2 <--> D2
    
    Photog -- "Folder Sync / RAW" --> P3
    P3 <--> D3
    P3 --> D4

    %% Guest Flow
    Guest -- "Phone / OTP" --> P5
    P5 <--> D2
    
    Guest -- "Selfie" --> P6
    P6 <--> D4
    P6 -- "Personal Gallery" --> Guest

    style P1 fill:#fff,stroke:#333,stroke-width:2px
    style P2 fill:#fff,stroke:#333,stroke-width:2px
    style P3 fill:#fff,stroke:#333,stroke-width:2px
    style P4 fill:#fff,stroke:#333,stroke-width:2px
    style P5 fill:#fff,stroke:#333,stroke-width:2px
    style P6 fill:#fff,stroke:#333,stroke-width:2px
```

### 1. Database Schema (Logical ER Diagram)
```mermaid
graph TD
    %% Entities
    Photographer[Photographer]
    Event[Event]
    Photo[Photo]
    Guest[Guest]
    Invoice[Invoice]

    %% Relationships
    Photog_Ev{{"Manages"}}
    Ev_Ph{{"Contains"}}
    Ev_Gs{{"Registers"}}
    Photog_Inv{{"Pays"}}

    %% Attributes
    sub_exp([subscription_expires_at]) --- Photographer
    p_plan([plan]) --- Photographer
    p_logo([studio_logo_url]) --- Photographer
    p_name([studio_name]) --- Photographer
    
    g_name([full_name]) --- Guest
    
    inv_pdf([pdf_url]) --- Invoice
    inv_amt([amount]) --- Invoice

    %% Connections
    Photographer --- Photog_Ev
    Photographer --- Photog_Inv
    Photog_Inv --- Invoice
    Photog_Ev --- Event
    Event --- Ev_Ph
    Ev_Ph --- Photo
    Event --- Ev_Gs
    Ev_Gs --- Guest

    %% Styling
    style Photographer fill:#e1f5fe,stroke:#01579b
    style Event fill:#e1f5fe,stroke:#01579b
    style Photo fill:#e1f5fe,stroke:#01579b
    style Guest fill:#e1f5fe,stroke:#01579b
    style Invoice fill:#f3e5f5,stroke:#7b1fa2
```

### 2. Object Diagram (Hierarchy & Interaction)
```mermaid
graph TD
    %% Base Platform
    SM[SnapMoment Platform]
    
    %% Main Branches
    SM --> Admin[Administrator / Photographer]
    SM --> Guest[Event Guest]

    %% Admin Branch
    Admin --> Adm_Ev[Event Management]
    Admin --> Adm_Ph[Photo Repository]
    Admin --> Adm_AI[AI Clustering Engine]
    Admin --> Adm_Msg[Support Inquiries]
    Admin --> Adm_Anl[Performance Stats]

    %% Guest Branch
    Guest --> Gst_OTP[OTP Verification]
    Guest --> Gst_Sfl[Selfie Biometrics]
    Guest --> Gst_Mtc[Vector Matching]
    Guest --> Gst_Gal[Personal Gallery]
    Guest --> Gst_Dld[Photo Downloads]

    %% Sub-Associations
    Adm_Ev --- Adm_Ph
    Adm_Ph --- Adm_AI
    Gst_Sfl --- Gst_Mtc
    Gst_Mtc --- Gst_Gal
    
    style SM fill:#f9f,stroke:#333,stroke-width:4px
    style Admin fill:#69f,stroke:#333,stroke-width:2px
    style Guest fill:#6f9,stroke:#333,stroke-width:2px
```

### 3. Event Lifecycle (Flowchart)
```mermaid
flowchart TD
    Start([Start: Photographer Signup]) --> Onboard[Onboarding: Studio Setup]
    Onboard --> Pay[Stripe: Secure Payment]
    Pay --> Create[Create Event & Settings]
    Create --> RAW{Sync Mode?}
    RAW -- Manual --> Upload[Bulk Drag-and-Drop]
    RAW -- Tether --> Folder[Folder Sync Engine]
    
    Upload --> AI_Proc[AI: ArcFace Feature Extraction]
    Folder --> AI_Proc
    
    AI_Proc --> Cluster[DBSCAN Clustering]
    Cluster --> QR[Generate Event Access Kit]
    
    QR --> Guest_Entry([Guest Scans QR])
    Guest_Entry --> OTP[OTP Verification]
    OTP -- Yes --> Selfie[Neural-Lock Selfie]
    
    Selfie --> Match[pgvector Search]
    Match --> Gallery[Personal Gallery]
    Gallery --> End([End: Happy Guest])

    style Start fill:#f9f,stroke:#333
    style End fill:#f9f,stroke:#333

    style Start fill:#f9f,stroke:#333
    style End fill:#f9f,stroke:#333
    style Face_Check fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style OTP_Check fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style Match_Check fill:#fff4dd,stroke:#d4a017,stroke-width:2px
```

### 4. Photo Status (State Diagram)
```mermaid
stateDiagram-v2
    [*] --> Uploaded: S3 Storage
    Uploaded --> Processing: Celery Queue
    Processing --> Indexed: Biometric Extraction
    Indexed --> Clustered: DBSCAN Analytics
    Clustered --> Matched: High Speed Search
    Matched --> [*]: Guest Delivery
```

---

## 🔄 How It Works (Workflow)

### For Photographers
1. **Create Event**: Set up a new event (Wedding, Corporate, etc.) in the dashboard.
2. **Bulk Upload**: Upload hundreds of photos at once. Click **"Process AI"**.
3. **Face Indexing**: The Celery worker runs the ArcFace engine to extract and index face embeddings for every person in every photo.
4. **Share QR**: Print or display the unique event QR code.

### For Guests
1. **Scan QR**: Use any smartphone camera to scan the code.
2. **Verify**: Enter your phone number and verify via OTP (no password needed).
3. **Selfie**: Take a quick verification selfie.
4. **Instant Match**: The system matches your selfie against the indexed event photos in milliseconds.
5. **Personal Gallery**: View and download only your photos.

---

## 🚀 Installation & Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)
- Python 3.10+ (for local backend dev)

### Option 1: Docker (Recommended)
The easiest way to get SnapMoment running is using Docker Compose.

```bash
# Clone the repository
git clone https://github.com/JoelJose212/SnapMoment.git
cd SnapMoment

# Create .env file from example
cp .env.example .env

# Build and Start
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### Option 2: Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📋 Environment Variables

Create a `.env` file in the root directory:

```env
# Database & Redis
DATABASE_URL=postgresql+asyncpg://snapmoment:snapmoment123@db:5432/snapmoment
REDIS_URL=redis://redis:6379/0

# Security
JWT_SECRET_KEY=your-super-secret-key
JWT_ALGORITHM=HS256

# Storage (Local or S3)
USE_LOCAL_STORAGE=True
LOCAL_STORAGE_PATH=/app/uploads

# AI Settings
DEEPFACE_MODEL=ArcFace
FACE_DETECTION_BACKEND=retinaface

# External Services (Optional)
MSG91_AUTH_KEY=your-msg91-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

---

## 🛣️ API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Photographer login |
| `POST` | `/api/events/` | Create a new event |
| `POST` | `/api/events/{id}/photos` | Bulk upload photos |
| `POST` | `/api/events/{id}/process` | Trigger AI face indexing |
| `POST` | `/api/guest/otp/send` | Request OTP for guest access |
| `POST` | `/api/guest/selfie` | Upload selfie for instant matching |
| `POST` | `/api/guest/gallery` | Retrieve personalized matched photos |
| `POST` | `/api/onboarding/studio-logo` | Upload official studio branding logo |

---

## 🔌 Database Connectivity
The project uses **SQLAlchemy 2.0** with **asyncpg** for high-performance, asynchronous database interactions.

### Connectivity Procedure:
1. **Engine Creation**: Initializes the connection pool using the `DATABASE_URL`.
2. **Session Factory**: Configures an `async_sessionmaker` to generate individual session instances.
3. **Dependency Injection**: The `get_db` generator ensures sessions are automatically opened and closed per request.

### Implementation:
```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings

# 1. Initialize the Async Engine
engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=False, 
    future=True
)

# 2. Setup the Session Factory
AsyncSessionLocal = async_sessionmaker(
    engine, 
    expire_on_commit=False, 
    class_=AsyncSession
)

# 3. Dependency to be used in FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

---

## 📂 Folder Structure

```text
SnapMoment/
├── backend/
│   ├── app/
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routers/      # API endpoint handlers
│   │   ├── schemas/      # Pydantic data validation
│   │   ├── services/     # Business logic & AI logic
│   │   └── tasks/        # Celery worker tasks
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Main application pages
│   │   ├── hooks/        # Custom React hooks
│   │   └── services/     # API client code
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml
└── .env.example
```

---

## 📖 Comprehensive Data Dictionary
| S. No | Name of Class | Data Member | Data Type | Method / API | Method Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Photographer** | `studio_logo_url` | String | `upload_studio_logo()` | Updates branding across guest galleries. |
| | | `plan` | String | `verify_payment()` | Upgrades account capabilities. |
| **2** | **Event** | `id` | UUID (PK) | `create_event()` | Initializes a new photo event. |
| **3** | **Invoice** | `pdf_url` | String | `generate_pdf()`| Creates professional billing receipts. |
| | | `amount` | Float | `send_email()` | Distributes invoices via Gmail SMTP. |
| **4** | **Photo** | `id` | UUID (PK) | `tether_sync()` | Auto-ingests frames from local folders. |
| **5** | **Guest** | `full_name` | String | `verify_otp()` | Finalizes guest session after SMS check. |

---

## 📖 Input / Output (I/O) Table
| S. No | Object | Input Details | Output Details |
| :--- | :--- | :--- | :--- |
| **1** | **Studio Onboarding** | Studio Details, Gear, Selected Plan | Profile setup & Pricing activation |
| **2** | **Payment Checkout** | Stripe Checkout Session | Payment ID & Activated Workspace |
| **3** | **Invoice Generation** | Payment Event | Automated PDF Receipt & Email |
| **4** | **RAW Tethering** | Local Folder Handle | Instant Automatic Cloud Sync |
| **5** | **Biometric Match** | Guest Selfie & Name | List of Matching Personal Photos |

---

## 🛡️ Security & Privacy
- **OTP-based Guest Access**: Secures galleries without requiring complex passwords.
- **Admin Security**: Transitioned to managed plain-text for developer-friendly admin management in isolated environments.
- **JWT Authorization**: All photographer and guest sessions are stateless and secure.
- **Ephemeral Selfies**: Selfies are never saved to disk; only the mathematical face embeddings are stored temporarily for matching.

---

## 📈 Performance & Accuracy
- **Model**: ArcFace (Achieving 99.8% LFW accuracy).
- **Matching Speed**: Fast cosine-similarity search allows matching a selfie against 10,000+ photos in under 500ms using **pgvector HNSW**.
- **Accuracy**: Enhanced via **DBSCAN Clustering** to improve precision in varied lighting.

---

## 🚧 Roadmap & Milestones
- **Done ✅**: 
    - Real-time face alignment guidance for guests (MediaPipe).
    - Hardened biometric matching with DBSCAN.
    - Automated Subscription Billing (Stripe).
    - Professional RAW Live Tethering Engine.
    - Automated Multi-Recipient Invoice PDFs.
- **Next Up 🚀**: 
    - [ ] Multi-photographer collaboration per event.
    - [ ] Smart AI Auto-cropping for social media formats.
    - [ ] Global expansion with international phone support.

---

## 🤝 Contributing
Contributions are welcome!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 👥 Team
- **Joel Jose Varghese** - CTO ([@JoelJose212](https://github.com/JoelJose212))
- **Nandini Sinha** - CPO ([@Nandini-sinha]https://github.com/Nandini-sinha)


---

## 🙏 Acknowledgements
- [DeepFace](https://github.com/serengil/deepface) for the incredible AI engine.
- [Lucide Icons](https://lucide.dev/) for the crisp visuals.
- [FastAPI](https://fastapi.tiangolo.com/) for the high-performance backend.
