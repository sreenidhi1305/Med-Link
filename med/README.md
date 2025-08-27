## 💻 MedLink: Your Real-time Healthcare Companion 🩺

MedLink is a real-time healthcare platform that seamlessly connects you with essential medications and healthcare services. Our modern and intuitive platform makes it easy to find nearby pharmacies, check live medication availability, and access telehealth services with a few clicks.

### ✨ Features

  * **Real-time Pharmacy Locator:** Find nearby pharmacies and view their live inventory status instantly.
  * **Medication Search:** Search for medications effortlessly using voice commands in multiple languages (English/Hindi).
  * **Health Dashboard:** A personalized dashboard to track vital statistics and key health metrics.
  * **Telehealth Integration:** Connect with certified healthcare professionals instantly for virtual consultations.
  * **Trust System:** A user-driven trust system with verified pharmacies, trust scores, and user reviews to help you make informed decisions.
  * **Responsive Design:** A consistent and seamless user experience across all your devices, from mobile to desktop.

-----

### 🚀 Getting Started

Follow these steps to set up and run the MedLink project locally.

#### Prerequisites

Make sure you have the following installed on your system:

  * Node.js version **18.0.0** or higher
  * npm version **9.0.0** or higher
  * PostgreSQL version **14.0** or higher

#### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/medlink.git
    cd medlink
    ```

2.  **Install dependencies:**

    ```bash
    # Install frontend dependencies
    cd medlink-frontend
    npm install

    # Install backend dependencies
    cd ../medlink-backend
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in both the `medlink-frontend` and `medlink-backend` directories. Populate them with the required environment variables. Refer to the `.env.example` files in each directory for the necessary variables.

#### Start Development Servers

You'll need to run both the frontend and backend servers concurrently.

```bash
# Start the frontend server (from the medlink-frontend directory)
npm run dev

# Start the backend server (from the medlink-backend directory)
npm run dev
```

-----

### 🛠️ ESLint Configuration

This project is built on the **React + TypeScript + Vite** template, which provides a minimal setup for development with Hot Module Replacement (HMR) and some basic ESLint rules. Two official plugins are available for Vite:

  * `@vitejs/plugin-react`: Uses [Babel](https://babeljs.io/) for Fast Refresh
  * `@vitejs/plugin-react-swc`: Uses [SWC](https://swc.rs/) for Fast Refresh

#### Expanding the ESLint Configuration

For production applications, it's recommended to update the configuration to enable more robust, type-aware lint rules. You can update your `eslint.config.js` file as follows:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install **eslint-plugin-react-x** and **eslint-plugin-react-dom** for React-specific lint rules to ensure code quality:

```bash
npm install eslint-plugin-react-x eslint-plugin-react-dom
```

Then, update your `eslint.config.js` with the following:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

-----

### 💻 Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion

**Backend:** Node.js, Express, TypeScript

**Database:** PostgreSQL with Prisma ORM

**Real-time:** Liveblocks

**Maps:** Mapbox

**Authentication:** JWT

-----

### 📁 Project Structure

```
medlink/
├── medlink-frontend/               # Frontend React application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API services
│   │   └── App.tsx                 # Main application component
│   └── ...
│
├── medlink-backend/                # Backend server
│   ├── src/
│   │   ├── controllers/            # Route controllers
│   │   ├── middleware/             # Express middleware
│   │   ├── models/                 # Database models
│   │   └── routes/                 # API routes
│   └── ...
└── README.md                       # Project documentation
```

-----

### 📄 API Documentation

Detailed API documentation is automatically generated and available at the `/api-docs` endpoint when the development server is running.

-----

### 👋 Contributing

We welcome and appreciate your contributions\! To get started, please follow these steps:

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

-----

### 📜 License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.

-----

### 🙏 Acknowledgments

  * React
  * Vite
  * Tailwind CSS
  * Mapbox
  * Liveblocks
