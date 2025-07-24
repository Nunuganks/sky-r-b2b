# SKY-R B2B Platform (Monorepo)

This is a monorepo that contains both the **frontend** (Next.js) and **backend** (Payload CMS) of the SKY-R B2B platform.

---

## 📁 Folder Structure

```
sky-r-b2b/
├── frontend/   # Next.js application
└── backend/    # Payload CMS + API backend
```

---

## 🚀 Quick Start

### Clone the repo

```bash
git clone https://github.com/Nunuganks/sky-r-b2b.git
cd sky-r-b2b
```

---

## 🧪 Local Development

### Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Then open: [http://localhost:3000](http://localhost:3000)

### Backend (Payload CMS)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Then open: [http://localhost:3001](http://localhost:3001) (or your configured port)

---

## 🐳 Docker (Optional - Backend)

If you prefer to use Docker for the backend instead of installing MongoDB locally, use the provided `docker-compose.yml`:

```bash
cd backend
cp .env.example .env
docker-compose up
```

> Make sure your `.env` contains:
```env
MONGODB_URI=mongodb://127.0.0.1/<your_db>
```

---

## 🔧 Environment Variables

### Frontend

- Located in `/frontend/.env.local`
- See `/frontend/.env.example` for required keys

### Backend

- Located in `/backend/.env`
- Contains Payload + MongoDB config

---

## 🧱 How It Works (Payload Overview)

The Payload CMS backend is configured with:

- **Users Collection** — for admin authentication
- **Media Collection** — with upload, image resizing, and focal point enabled

See [Payload Collections](https://payloadcms.com/docs/configuration/collections) for how to extend.

---

## 🌍 Deployment

- Frontend can be deployed to Vercel or another platform of your choice.
- Backend can be containerized or hosted on a Node server (with MongoDB and optionally S3 for media).

---

## 🙋 Questions & Support

- Payload CMS Community: [Discord](https://discord.com/invite/payload)
- GitHub Discussions: [Payload GitHub](https://github.com/payloadcms/payload/discussions)

---

## ✨ Credits

This project is based on the [Payload Blank Template](https://github.com/payloadcms/payload) with monorepo enhancements for production use.
