# 🏥 MedLink - Real-time Healthcare Companion

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.0-646CFF?logo=vite)](https://vitejs.dev/)

MedLink is a real-time healthcare platform that connects users with life-saving medications and healthcare services. Built with modern web technologies, it provides an intuitive interface for finding nearby pharmacies, checking medication availability, and accessing telehealth services.

## ✨ Features

- **Real-time Pharmacy Locator** - Find nearby pharmacies with live inventory status
- **Medication Search** - Voice-enabled search in multiple languages (English/Hindi)
- **Health Dashboard** - Track vital statistics and health metrics
- **Telehealth Integration** - Connect with healthcare professionals instantly
- **Trust System** - Verified pharmacies with trust scores and user reviews
- **Responsive Design** - Works seamlessly across all devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- PostgreSQL 14.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/medlink.git
   cd medlink
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd medlink-frontend
   npm install
   
   # Install backend dependencies
   cd ../medlink-backend
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in both frontend and backend directories with the required environment variables.

4. **Start Development Servers**
   ```bash
   # Start frontend (from medlink-frontend directory)
   npm run dev
   
   # Start backend (from medlink-backend directory)
   npm run dev
   ```

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Realtime**: Liveblocks
- **Maps**: Mapbox
- **Authentication**: JWT

## 📂 Project Structure

```
medlink/
├── medlink-frontend/      # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.tsx        # Main application component
│   └── ...
│
├── medlink-backend/       # Backend server
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   └── routes/        # API routes
│   └── ...
└── README.md              # Project documentation
```

## 🌐 API Documentation

API documentation is available at `/api-docs` when running the development server.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Mapbox](https://www.mapbox.com/)
- [Liveblocks](https://liveblocks.io/)

---

<div align="center">
  Made with ❤️ by Your Name
</div>
