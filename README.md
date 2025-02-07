# Real-Time Push Notification System

A full-stack real-time notification system that includes a **backend server**, **frontend dashboard**, and **Android app**. The system allows users to send and receive notifications in real-time using WebSocket.


<img width="1522" alt="Screenshot 2025-01-20 at 6 37 12 PM" src="https://github.com/user-attachments/assets/41d04b9b-54b3-4e27-984b-0e5c2310341a" />
<img width="1530" alt="Screenshot 2025-01-20 at 6 37 23 PM" src="https://github.com/user-attachments/assets/0a93ed2c-3786-45d9-bf1a-a2ae0860dd33" />



---

## Features

### Backend
- **WebSocket Server**: Handles real-time communication between the frontend and Android app.
- **REST API**: Provides endpoints for sending and scheduling notifications.
- **MongoDB Integration**: Stores device tokens and notification history (optional).

### Frontend
- **Notification Dashboard**: A React-based dashboard to send and schedule notifications.
- **Device Preview**: Displays a preview of how notifications will look on Android and iOS devices.
- **Past Notifications**: Shows a history of sent notifications in a table.

### Android App
- **Real-Time Notifications**: Receives notifications instantly via WebSocket.
- **Notification Display**: Shows notifications with titles, messages, and timestamps.

---

## Technologies Used

### Backend
- **Node.js**: JavaScript runtime for the backend server.
- **Express.js**: Web framework for building REST APIs.
- **WebSocket**: Real-time communication protocol.
- **MongoDB**: Database for storing device tokens and notification history (optional).

### Frontend
- **React**: JavaScript library for building the frontend dashboard.
- **Material-UI**: UI component library for a modern and responsive design.
- **WebSocket**: Real-time communication with the backend.

### Android App
- **Kotlin**: Primary programming language.
- **Jetpack Compose**: Modern UI toolkit for building native Android UIs.
- **OkHttp**: HTTP client for WebSocket communication.

---

## Installation

### Prerequisites

- **Node.js** (v16 or higher) for the backend and frontend.
- **Android Studio** (latest version) for the Android app.
- **MongoDB** (optional) for storing data.

### Backend

1. Clone the repository:
   ```bash
   git clone https://github.com/SatyamkrJha85/Push-Notification.git
