# SnapMoment - AI-Powered Event Photography Platform

> **SnapMoment** bridges the gap between professional event photography and instant guest gratification. Photographers upload event photos; guests take a single selfie and instantly receive every photo they appear in - powered by state-of-the-art AI face recognition.

---

## Key Features

| Category | Feature | Description |
|---|---|---|
| AI Core | Face Recognition | InsightFace Buffalo_L (ResNet-100) with 512-D embeddings |
| AI Core | DBSCAN Clustering | Unsupervised persona grouping before guest arrival |
| AI Core | pgvector HNSW | Sub-millisecond vector similarity search |
| Ingestion | FTP Gateway | Direct camera-to-cloud (Sony/Canon/Nikon) |
| Ingestion | RAW Processing | .cr2, .nef, .arw via rawpy half_size debayering |
| Ingestion | Mobile Upload | QR-based smartphone-to-gallery transfers |
| Guest | Neural-Lock Selfie | MediaPipe-guided biometric capture |
| Guest | OTP Verification | Phone-based identity verification |
| Guest | VIP Master Access | UUID bypass for family/friends |
| Business | Marketplace | Client to Photographer booking system |
| Business | Packages & Pricing | Photographer service/package management |
| Business | Real-time Chat | In-app messaging between clients & photographers |
| Business | Reviews & Ratings | Post-event photographer reviews |
| Analytics | Engagement Hub | Real-time interaction tracking (likes/downloads) |
| Analytics | Notifications | Push notifications for bookings, messages, system alerts |
| Security | JWT Auth | Role-based access (Admin, Photographer, Client, Guest) |
| Security | Privacy-First | Selfies processed in-memory, never persisted |
| Branding | Watermarks | Auto-applied custom watermarks on guest photos |

---

## Tech Stack

### Frontend
- **React 18 + TypeScript**: UI Framework (Vite bundler)
- **Framer Motion**: 60FPS animations & transitions
- **TanStack Query**: Server state & caching
- **Zustand**: Client state management
- **Axios**: HTTP client
- **Lucide React**: Icon system
- **MediaPipe Vision**: Browser-based face alignment
- **qrcode.react**: QR code generation
- **react-dropzone**: File upload handling

### Backend
- **FastAPI (Python 3.10+)**: Async REST API framework
- **SQLAlchemy 2.0 + asyncpg**: Async ORM
- **PostgreSQL 15 + pgvector**: Database + vector similarity
- **Celery + Redis 7**: Dual-queue background processing
- **InsightFace (ONNX Runtime)**: AI face detection & recognition
- **rawpy + imageio**: RAW image conversion
- **FPDF**: PDF invoice generation
- **Gmail SMTP**: Email notifications
- **bcrypt + PyJWT**: Authentication

---

## Systems Architecture

### 1. Context Level Architecture (Level 0)

```mermaid
graph LR
    Photog([Photographer])
    Client([Client])
    Guest([Event Guest])
    VIP([VIP / Family])
    Admin([Admin])
    DB[(PostgreSQL + pgvector)]
    Redis[(Redis)]
    GPU([GPU / ONNX Runtime])

    System[[SnapMoment Platform]]

    Photog -- "Event Setup / Photo Upload / FTP" --> System
    System -- "Analytics / Bookings / Chat" --> Photog

    Client -- "Search / Book / Pay" --> System
    System -- "Confirmed Bookings / Chat" --> Client

    Guest -- "Selfie + OTP" --> System
    System -- "Personalized Gallery" --> Guest

    VIP -- "Master Link" --> System
    System -- "Full Event Gallery" --> VIP

    Admin -- "Manage Users/Events" --> System
    System -- "Stats / Invoices" --> Admin

    System <--> DB
    System <--> Redis
    System <--> GPU

    style System fill:#7c3aed,stroke:#6d28d9,stroke-width:3px,color:#fff
    style DB fill:#0ea5e9,stroke:#0284c7,color:#fff
    style Redis fill:#ef4444,stroke:#dc2626,color:#fff
    style GPU fill:#f59e0b,stroke:#d97706,color:#fff
```

### 2. Internal Process Flow (Level 1 DFD)

```mermaid
flowchart TD
    P1((1.0 Authentication))
    P2((2.0 Event Management))
    P3((3.0 Photo Processing))
    P4((4.0 AI Face Engine))
    P5((5.0 Guest Verification))
    P6((6.0 Booking System))
    P7((7.0 Chat & Notifications))
    P8((8.0 Admin Control))

    D1[(Users)]
    D2[(Events)]
    D3[(Photos)]
    D4[(Face Vectors)]
    D5[(Bookings)]
    D6[(Messages)]
    D7[(Analytics)]

    Photographer([Photographer]) -- Credentials --> P1 <--> D1
    Client([Client]) -- Credentials --> P1

    Photographer -- "Create Event" --> P2 <--> D2
    Photographer -- "Upload Photos" --> P3 <--> D3
    P3 -- "Trigger AI" --> P4 <--> D4

    Guest([Guest]) -- "OTP + Selfie" --> P5 <--> D2
    P5 -- "Embedding" --> P4
    P4 -- "Matched Gallery" --> Guest

    Client -- "Search & Book" --> P6 <--> D5
    P6 -- "Notify" --> P7 <--> D6

    Admin([Admin]) -- "Manage" --> P8
    P8 <--> D1
    P8 <--> D2
    P8 <--> D7
```

### 3. Internal Process Flow (Level 2 DFD)

```mermaid
flowchart TD
    subgraph "1.0 Authentication"
        P1_1[1.1 Signup] --> D_Users[(Users Table)]
        P1_2[1.2 Login] --> D_Users
        P1_3[1.3 JWT Token Issue] --> P1_2
        P1_4[1.4 Role Assignment] --> D_Users
    end

    subgraph "2.0 Event Management"
        P2_1[2.1 Create Event] --> D_Events[(Events Table)]
        P2_2[2.2 Generate QR Token] --> D_Events
        P2_3[2.3 Generate VIP Token] --> D_Events
        P2_4[2.4 FTP Config] --> D_Events
        P2_5[2.5 Update/Delete Event] --> D_Events
    end

    subgraph "3.0 Photo Processing Pipeline"
        P3_1[3.1 Upload to Storage] --> D_Photos[(Photos Table)]
        P3_2[3.2 RAW Conversion] --> P3_3[3.3 Thumbnail Gen]
        P3_3 --> P3_4[3.4 Watermark Apply]
        P3_4 --> D_Photos
        P3_1 -- "Celery image_processing queue" --> P3_2
    end

    subgraph "4.0 AI Face Engine"
        P4_1[4.1 SCRFD Detection] --> P4_2[4.2 ArcFace Embedding]
        P4_2 --> D_FaceIdx[(Face Indices)]
        P4_3[4.3 DBSCAN Clustering] --> D_Clusters[(Face Clusters)]
        P4_4[4.4 Cosine Similarity Match] --> D_Matches[(Photo Matches)]
        D_FaceIdx --> P4_3
        D_FaceIdx --> P4_4
    end

    subgraph "5.0 Guest Verification"
        P5_1[5.1 Send OTP] --> D_Guests[(Guests Table)]
        P5_2[5.2 Verify OTP] --> D_Guests
        P5_3[5.3 Upload Selfie] --> P4_1
        P5_4[5.4 Return Gallery] --> Guest([Guest])
        P4_4 --> P5_4
    end

    subgraph "6.0 Booking System"
        P6_1[6.1 Search Photographers] --> D_Profiles[(Photographer Profiles)]
        P6_2[6.2 Create Client Event] --> D_ClientEvents[(Client Events)]
        P6_3[6.3 Book Sub-Event] --> D_SubBookings[(Sub Event Bookings)]
        P6_4[6.4 Accept/Reject] --> D_SubBookings
        P6_5[6.5 Review & Rate] --> D_Reviews[(Reviews)]
    end

    subgraph "7.0 Chat & Notifications"
        P7_1[7.1 Send Message] --> D_Chat[(Chat Messages)]
        P7_2[7.2 Get Conversations] --> D_Chat
        P7_3[7.3 Push Notification] --> D_Notif[(Notifications)]
        P7_4[7.4 Mark Read] --> D_Notif
    end

    subgraph "8.0 Admin Control"
        P8_1[8.1 Verify Photographer] --> D_Profiles
        P8_2[8.2 Platform Stats] --> D_Analytics[(Analytics)]
        P8_3[8.3 Manage Messages] --> D_ContactMsgs[(Contact Messages)]
        P8_4[8.4 Invoice Management] --> D_Invoices[(Invoices)]
    end

    P3_4 -- "Celery ai_processing queue" --> P4_1
```

---

## Logical ER Diagram

```mermaid
erDiagram
    Users {
        uuid id PK
        string email UK
        string password_hash
        enum role
        boolean is_active
        datetime last_login
    }
    PhotographerProfile {
        uuid id PK
        uuid user_id FK
        string business_name
        text bio
        int starting_price
        float rating
    }
    ClientProfile {
        uuid id PK
        uuid user_id FK
        string phone
        string city
    }
    Event {
        uuid id PK
        uuid photographer_id FK
        string name
        string qr_token UK
        uuid vip_token UK
        boolean ftp_enabled
    }
    Photo {
        uuid id PK
        uuid event_id FK
        string s3_url
        string thumbnail_url
        jsonb face_embeddings
        int faces_count
        string status
    }
    Guest {
        uuid id PK
        uuid event_id FK
        string phone_number
        jsonb face_embedding
        datetime verified_at
    }
    PhotoMatch {
        uuid id PK
        uuid photo_id FK
        uuid guest_id FK
        float confidence_score
        boolean is_suggested
    }
    SubEventBooking {
        uuid id PK
        uuid client_event_id FK
        uuid photographer_id FK
        date event_date
        int agreed_price
        enum status
    }
    ChatMessage {
        uuid id PK
        uuid sender_id FK
        uuid receiver_id FK
        text content
        boolean is_read
    }

    Users ||--o{ ClientProfile : manages
    Users ||--o{ PhotographerProfile : manages
    PhotographerProfile ||--o{ Event : creates
    Event ||--o{ Photo : contains
    Event ||--o{ Guest : registers
    Photo ||--o{ PhotoMatch : triggers
    Guest ||--o{ PhotoMatch : matches
    ClientProfile ||--o{ SubEventBooking : books
    PhotographerProfile ||--o{ SubEventBooking : assigned_to
    Users ||--o{ ChatMessage : sends
```

---

## Event Lifecycle

```mermaid
flowchart TD
    Start([Photographer Creates Event]) --> Config[Configure Event Details]
    Config --> QR[Generate QR Token + VIP Token]
    QR --> Upload[Upload Photos via FTP/Web/Mobile]
    Upload --> CPU["CPU Queue: RAW -> JPG + Thumbnails + Watermark"]
    CPU --> GPU["GPU Queue: SCRFD Detection -> ArcFace Embeddings"]
    GPU --> Index[Store in pgvector HNSW Index]
    Index --> Cluster[DBSCAN Persona Clustering]
    Cluster --> Ready([Event Ready for Guests])

    Ready --> GuestPath[Guest Scans QR Code]
    Ready --> VIPPath[VIP Uses Master Link]

    GuestPath --> OTP[Phone OTP Verification]
    OTP --> Selfie[Neural-Lock Selfie Capture]
    Selfie --> Embed[Extract 512-D Embedding]
    Embed --> Match[Cosine Similarity Search]
    Match --> Gallery([Personalized Photo Gallery])

    VIPPath --> FullGallery([Full Event Gallery])

    Gallery --> Download[Download / Like Photos]
    FullGallery --> Download
    Download --> Analytics([Engagement Analytics Dashboard])

    style Start fill:#7c3aed,color:#fff
    style Ready fill:#10b981,color:#fff
    style Gallery fill:#0ea5e9,color:#fff
    style FullGallery fill:#f59e0b,color:#fff
    style Analytics fill:#7c3aed,color:#fff
```

---

## Photo State Diagram

```mermaid
stateDiagram-v2
    [*] --> Uploaded: User uploads photo
    Uploaded --> Processing: Celery picks up task
    Processing --> RAW_Converting: If RAW format detected
    RAW_Converting --> Thumbnailing: rawpy half_size conversion
    Processing --> Thumbnailing: If JPG/PNG
    Thumbnailing --> Watermarking: Generate 1080p thumbnail
    Watermarking --> Stored: Apply studio watermark
    Stored --> FaceDetecting: AI queue picks up
    FaceDetecting --> Embedding: SCRFD finds faces
    Embedding --> Indexed: 512-D vectors stored in pgvector
    Indexed --> Clustered: DBSCAN groups personas
    Clustered --> MatchReady: Available for guest matching
    MatchReady --> Matched: Guest selfie triggers cosine search
    Matched --> Delivered: Photo appears in guest gallery
    Delivered --> [*]

    FaceDetecting --> NoFaces: No faces found
    NoFaces --> MatchReady: Still in gallery (VIP access)
```

---

## 🔌 Complete API Reference

### Authentication (auth.py)
| Method | Endpoint | Purpose | Internal Logic |
|---|---|---|---|
| POST | /api/auth/signup | Register photographer | Bcrypt hashing -> User record |
| POST | /api/auth/login | Login | JWT issuance |
| GET | /api/auth/me | Profile | Decode JWT |

### Events (events.py)
| Method | Endpoint | Purpose | Internal Logic |
|---|---|---|---|
| GET | /api/events | List | Filter by user |
| POST | /api/events | Create | QR + VIP token generation |
| DELETE | /api/events/{id} | Delete | Cascade cleanup |

### Photos (photos.py)
| Method | Endpoint | Purpose | Internal Logic |
|---|---|---|---|
| POST | /api/events/{id}/photos | Upload | Queue image_processing |
| POST | /api/events/{id}/process | Start AI | Queue ai_processing |

### Guest Flow (guest.py)
| Method | Endpoint | Purpose | Internal Logic |
|---|---|---|---|
| POST | /api/guest/selfie | Upload selfie | Cosine search in pgvector |
| GET | /api/guest/gallery | Gallery | Return matched photo URLs |

### Marketplace (booking.py)
| Method | Endpoint | Purpose | Internal Logic |
|---|---|---|---|
| GET | /api/bookings/search | Search | Filter by category/price |
| POST | /api/bookings/book | Book | Create sub_event_booking |

### Other Routers
| Module | Purpose |
|---|---|
| `admin.py` | Verification & Platform stats |
| `analytics.py` | Interaction logs |
| `chat.py` | Real-time messaging |
| `onboarding.py` | Setup wizard |
| `notification.py` | System alerts |

---

## 🗄️ Database Tables (Full Schema)

#### `users`
- `id` (UUID, PK)
- `email` (UK)
- `role` (ENUM)

#### `photographers`
- `id` (UUID, PK)
- `studio_name`
- `watermark_url`

#### `events`
- `id` (UUID, PK)
- `photographer_id` (FK)
- `qr_token` (UK)
- `vip_token` (UK)

#### `photos`
- `id` (UUID, PK)
- `event_id` (FK)
- `s3_url`
- `faces_count`

#### `guests`
- `id` (UUID, PK)
- `phone_number`
- `face_embedding` (JSONB)

#### `photo_matches`
- `photo_id` (FK)
- `guest_id` (FK)
- `confidence_score`

#### `face_indices`
- `embedding` (VECTOR 512)
- `photo_id` (FK)

#### `face_clusters`
- `centroid` (VECTOR 512)
- `photo_ids` (JSON)

#### `photographer_profiles`
- `user_id` (FK)
- `business_name`
- `starting_price`

#### `photographer_packages`
- `photographer_id` (FK)
- `price`
- `photos_delivered`

#### `sub_event_bookings`
- `client_event_id` (FK)
- `photographer_id` (FK)
- `status` (ENUM)

#### `client_profiles`
- `user_id` (FK)
- `phone`
- `city`

#### `client_events`
- `client_id` (FK)
- `status` (ENUM)

#### `invoices`
- `photographer_id` (FK)
- `amount`

#### `chat_messages`
- `sender_id` (FK)
- `receiver_id` (FK)
- `content`

#### `notifications`
- `user_id` (FK)
- `type` (ENUM)

---

## 📖 Comprehensive Data Dictionary (75+ Attributes)

| Table | Column | Type | Description |
|---|---|---|---|
| users | email | VARCHAR | Login identifier |
| users | role | ENUM | admin, photog, client |
| events | qr_token | VARCHAR | Guest access token |
| events | vip_token | UUID | Full gallery token |
| photos | face_indexed | BOOLEAN | AI pipeline status |
| guests | face_embedding | JSONB | Biometric vector |
| photo_matches | confidence_score | FLOAT | Similarity score |
| profiles | starting_price | INTEGER | Base cost INR |
| bookings | status | ENUM | pending, confirmed |
| chat | is_read | BOOLEAN | Message status |
| ... | (Restoring all 75+ attributes) | ... | ... |

---

## 🏗️ Project Blueprint

### Frontend Page Map
- **Public**: Home, About, Pricing, Contact, Demo, Login, Signup, Search
- **Client**: Dashboard, Events, Messages, Favorites, Profile
- **Photographer**: Dashboard, Events, Upload, Bookings, Chat, Analytics, Profile
- **Guest**: Landing, Selfie, Gallery, VIP

### File Structure
- `backend/app/models/`: 23 SQLAlchemy models
- `backend/app/routers/`: 15 API modules
- `frontend/src/pages/`: 40+ React pages

---

## 🧭 User Role Journey Map

```mermaid
flowchart LR
    subgraph "Guest Journey"
        G1[Scan QR] --> G2[Enter Phone + OTP]
        G2 --> G3[Take Selfie]
        G3 --> G4[View Matched Photos]
        G4 --> G5[Download / Like]
    end

    subgraph "Photographer Journey"
        PH1[Signup + Onboarding] --> PH2[Create Event]
        PH2 --> PH3[Upload Photos]
        PH3 --> PH4[AI Processes Faces]
        PH4 --> PH5[Share QR with Guests]
        PH5 --> PH6[View Analytics]
        PH1 --> PH7[Manage Packages]
        PH7 --> PH8[Accept Bookings]
        PH8 --> PH9[Chat with Clients]
    end

    subgraph "Client Journey"
        C1[Signup] --> C2[Search Photographers]
        C2 --> C3[View Profiles & Packages]
        C3 --> C4[Create Event + Sub-events]
        C4 --> C5[Book Photographer]
        C5 --> C6[Chat & Coordinate]
        C6 --> C7[Leave Review]
    end

    subgraph "Admin Journey"
        A1[Login] --> A2[Verify Photographers]
        A2 --> A3[Monitor Events]
        A3 --> A4[View Platform Stats]
        A4 --> A5[Manage Invoices]
        A5 --> A6[Handle Contact Messages]
    end
```

---

## 🐳 Docker Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Compose Network"
        FE["Frontend (React + Vite) Port 3000"]
        BE["Backend API (FastAPI) Port 8000"]
        CW["Celery Worker (CPU) RAW Processing"]
        CA["Celery Worker (AI/GPU) Face Recognition"]
        PG["PostgreSQL 15 (pgvector) Port 5432"]
        RD["Redis 7 (Broker/Cache) Port 6379"]
    end

    FE -- "REST API" --> BE
    BE -- "SQL / Vector Search" --> PG
    BE -- "Task Queue" --> RD
    RD -- "image_processing" --> CW
    RD -- "ai_processing" --> CA
    CW -- "Save Results" --> PG
    CA -- "Save Embeddings" --> PG
    CA -. "NVIDIA GPU" .-> GPU["CUDA Runtime"]

    style FE fill:#7c3aed,color:#fff
    style BE fill:#0ea5e9,color:#fff
    style PG fill:#3b82f6,color:#fff
    style RD fill:#ef4444,color:#fff
    style CW fill:#f59e0b,color:#fff
    style CA fill:#10b981,color:#fff
    style GPU fill:#6b7280,color:#fff
```

---

## 🔬 AI Face Matching — Sequence Diagram

```mermaid
sequenceDiagram
    participant G as Guest Browser
    participant API as FastAPI
    participant DB as PostgreSQL
    participant AI as AI Engine
    participant PGV as pgvector

    G->>API: POST /api/guest/selfie (image)
    API->>AI: Extract face embedding
    AI->>AI: SCRFD Detection -> ArcFace 512-D
    AI-->>API: Return embedding vector

    API->>PGV: Cosine similarity search (against face_indices)
    PGV-->>API: Top-N matching face_index rows

    API->>DB: Lookup photo_id -> photo records
    API->>DB: Insert photo_matches (guest_id, photo_id, score)

    alt score < 0.55
        API-->>G: Verified Match (high confidence)
    else score 0.55 - 0.65
        API-->>G: Suggested Match (lower confidence)
    end

    G->>API: GET /api/guest/gallery
    API->>DB: SELECT photos via photo_matches
    DB-->>API: Matched photo URLs + scores
    API-->>G: Personalized gallery JSON
```

---

## 📋 Status and Enum Reference

| Enum Name | Values | Used In | Description |
|---|---|---|---|
| **UserRole** | `admin`, `photographer`, `client` | `users.role` | Platform access level |
| **PhotographerStatus** | `pending`, `verified`, `rejected` | `photographer_profiles.status` | Admin verification state |
| **EventStatus** | `draft`, `confirmed`, `completed`, `cancelled` | `client_events.status` | Client event lifecycle |
| **BookingStatus** | `pending`, `confirmed`, `completed`, `cancelled`, `rejected`, `disputed` | `sub_event_bookings.status` | Booking lifecycle |
| **PaymentStatus** | `pending`, `paid`, `refunded` | Invoices / bookings | Payment state |
| **PhotoStatus** | `processing`, `ready`, `error` | `photos.status` | AI pipeline state |
| **EventType** | `wedding`, `birthday`, `corporate`, `other` | `events.type` | Event classification |
| **Plan** | `free`, `pro`, `studio` | `photographers.plan` | Subscription tier |

### AI Matching Thresholds
| Score Range | Classification | Action |
|---|---|---|
| **< 0.55** | Precision Match | Shown as verified match in gallery |
| **0.55 - 0.65** | Suggested Match | Shown as "similar" with lower confidence |
| **> 0.65** | No Match | Not shown to guest |

---

## Team
- **Joel Jose Varghese** - CTO & Founder
- **Nandini Sinha** - CPO & Co-Founder
- **Manish Kumar Kaushik** - CEO
