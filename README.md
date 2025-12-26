# 📋 Trello Clone (Kanban Task Manager)

A robust and responsive task management application built with **React** and **TypeScript**. This project replicates the core functionality of Trello, featuring secure authentication, dynamic board management, and a modern UI.

The application demonstrates advanced frontend patterns including JWT handling, protected routes, and strict type safety.

## 🚀 Live Demo
> *[Insert link to your Vercel/Netlify deploy here if available, or remove this line]*

## ✨ Features

* **🔐 Secure Authentication:**
    * User Registration with password strength validation (zxcvbn).
    * Login/Logout functionality.
    * **JWT Implementation:** Access tokens are securely handled via **Axios Interceptors** for seamless user experience.
* **📂 Board Management:**
    * View personal dashboards.
    * Create new boards (dynamic API integration).
    * Real-time UI updates.
* **🛡️ Protected Routes:**
    * Access control for authorized users only.
    * Auto-redirect to login for guests.
* **🎨 UI/UX:**
    * Responsive design for mobile and desktop.
    * Interactive forms with validation.

## 🛠️ Tech Stack

* **Core:** React, TypeScript
* **Routing:** React Router DOM (v6)
* **HTTP Client:** Axios (Custom instance with Request/Response Interceptors)
* **Styling:** CSS3 (Flexbox/Grid), CSS Modules
* **Utilities:** zxcvbn (Password strength estimation)

## ⚙️ Installation & Running

Follow these steps to set up the project locally:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/trello-clone.git](https://github.com/yourusername/trello-clone.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd trello-clone
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Configure Environment:**
    Create a `.env.local` file in the root directory and add your API URL:
    ```env
    REACT_APP_API_URL=[https://trello-back.shpp.me/YourNickname/api/v1](https://trello-back.shpp.me/YourNickname/api/v1)
    ```

5.  **Start the application:**
    ```bash
    npm start
    ```

## 🧠 Key Learnings & Implementation Details

This project was built to master modern React patterns:

* **TypeScript Integration:** Fully typed components, props, and API responses (no `any` types) to ensure code reliability.
* **Axios Interceptors:** Implemented a scalable HTTP layer that automatically attaches the `Authorization: Bearer <token>` header to requests and handles global `401 Unauthorized` errors.
* **State Management:** effective use of `useState` and `useEffect` for data fetching and UI synchronization.

## 🔮 Future Improvements

* [ ] Drag-and-drop functionality for cards and lists.
* [ ] User profile editing.
* [ ] Dark mode support.

---

**Author:** Roman Diachenko
