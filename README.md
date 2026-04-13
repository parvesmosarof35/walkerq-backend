# Luggage Transfer System (LTS) Backend

A specialized and robust TypeScript-based backend for high-security luggage transfer logistics, featuring real-time tracking, intelligent warehouse management, and synchronized staff operations.

## 🚀 Key LTS Features

- **RBAC Security** - Domain-specific roles: `user`, `admin`, `staff_port`, `staff_warehouse`, `driver`, `helper`.
- **Intelligent Inbound Batching** - Automated 120-bag capacity logic with Mongoose atomicity.
- **Smart Warehouse Allocation** - Prioritizes luggage storage based on Flight Departure Time (Early vs. Late Flights).
- **Real-time Driver-Helper Sync** - Socket.io rooms for synchronized luggage scanning progress.
- **Real-time Tracking** - Live GPS coordinate updates for drivers and luggage tracking for users.
- **Instant Alerts** - FCM Push Notifications for status changes and staff coordination.
- **Damage Reporting** - Multimedia (photo/video) reporting system for damaged luggage.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose (Atomic Transactions)
- **Real-time Communication**: Socket.io (with JWT authentication)
- **Push Notifications**: Firebase Admin SDK (FCM)
- **File & Media Storage**: Cloudinary (Image & Video support)
- **User Authentication**: JWT (Access & Refresh tokens)
- **Validation**: Zod (Type-safe request validation)

## 📦 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (v7 or higher) or yarn

## 🚀 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/parvesmosarof35/walkerq-backend.git
   cd walkerq-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

## 🏃‍♂️ Running the Application

### Development

```bash
npm run dev






#  PS C:\New folder\spark-tech\walkerq\walkerq-backend> cd src
# PS C:\New folder\spark-tech\walkerq\walkerq-backend\src> tree
# Folder PATH listing
# Volume serial number is 88E7-76FD
# C:.
# ├───app
# │   ├───builder
# │   ├───config
# │   ├───errors
# │   ├───helper
# │   ├───interface
# │   ├───middlewares
# │   ├───modules
# │   │   ├───auth
# │   │   ├───batch
# │   │   ├───dashboardstats
# │   │   ├───faq
# │   │   ├───issue_report
# │   │   ├───luggage
# │   │   ├───notification
# │   │   ├───order
# │   │   ├───payment
# │   │   ├───rack
# │   │   ├───settings
# │   │   └───user
# │   ├───routes
# │   ├───shared
# │   ├───socket
# │   └───utils
# │       └───emailcontext
# └───public
#     └───images
# PS C:\New folder\spark-tech\walkerq\walkerq-backend\src>

```

### Production

```bash
npm run build
npm start
```

## 🧪 Running Tests

```bash
npm test
```

## 🧹 Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run prettier
```

## 📂 Project Structure

```
src/
├── app/
│   ├── config/         # Configuration files
│   ├── errors/         # Custom error classes
│   ├── helper/         # Helper functions
│   ├── interface/      # TypeScript interfaces
│   ├── middlewares/    # Express middlewares
│   ├── modules/        # Feature modules (Auth, Luggage, Batch, etc.)
│   ├── routes/         # Route definitions
│   ├── socket/         # Real-time synchronization logic
│   └── utils/          # Utility functions
└── server.ts           # Application entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- Built with ❤️ using TypeScript and Express
- Special thanks to all contributors
