# 🏡 LocalHelp – Home Services Marketplace

LocalHelp is a **full-stack home-services platform** inspired by **Urban Company**. It serves as a comprehensive two-sided marketplace allowing **customers** to book local service providers and **providers** to manage their availability, bookings, and earnings.

The system includes a complete booking flow, robust authentication, dedicated dashboards for both roles, dynamic slot management, and a mock payment system.

---

## 🔗 Live Links

| Platform | Link |
| :--- | :--- |
| **Frontend** (Next.js) | https://localhelpfrontendv2.vercel.app/ |
| **Backend API** (Express.js) | https://localhelpbackendv2.onrender.com |
| *Please note: These links are for the deployed versions.* |

---

## 💻 Tech Stack

### Frontend
* **Next.js 14** (App Router)
* **React**
* **Tailwind CSS**
* Axios
* React Hot Toast
* React Icons

### Backend
* **Node.js**
* **Express.js**
* **Prisma ORM**
* **PostgreSQL** (NeonDB)
* **JWT Authentication** and Cookie-based sessions
* Role-based authorization

### Additional Tools
* Bcrypt (Password hashing)
* CORS
* Structured controllers, routes, and middlewares
* Seed scripts for demo providers and customers

---

## ✨ Features

### Customer Features
* Secure **login and signup** using JWT.
* Explore categories and subcategories.
* View provider services, pricing, and duration.
* **Real-time slot availability** with conflict detection.
* Book services with a **mock payment workflow**.

**Customer Dashboard:**
* View bookings with statuses (**Pending / Accepted / Rejected / Completed**).
* Manage saved addresses (Create, Edit, Delete).
* Update profile information.

### Provider Features
* Simple **onboarding** to become a provider.
* Add services, defining duration and price.
* Manage availability through **dynamic time-slot JSON**.
* View **real-time booking requests**.
* **Accept or reject** requests (rejection automatically frees up the slot).
* View customer details **after accepting** the request.
* **Mark completed services** (logic based on service end-time).

**Provider Dashboard:**
* Live and Completed requests.
* Earnings summary.
* Profile management.

---

## 🧠 Intelligent Slot and Availability System

LocalHelp uses a structured and flexible availability format:

```json
{
  "monday": {
    "09:00": [],
    "09:30": ["bookingId"],
    "10:00": []
  },
  "tuesday": { ... }
}
```
### Key Behaviors

- Full conflict detection using time-range overlap:
  - `existingStart < newEnd AND existingEnd > newStart`
- Automatic slot marking when bookings are created.
- Automatic slot opening when a provider rejects a booking.
- Dynamic booking duration based on service settings.
- Completion button appears only when the booking end-time has passed.

This system is designed to be more flexible compared to platforms with rigid, pre-defined time blocks.

### Why LocalHelp Improves Upon Urban Company

- **Flexible Time Slot Scheduling**
  - LocalHelp supports custom durations (30 min, 45 min, 2 hrs, etc.) and adjusts slots dynamically.
  - Urban Company typically uses fixed blocks (e.g., 9–11, 11–1).

- **Transparent Provider Details**
  - LocalHelp shows provider name, contact details (after acceptance), experience, bio, and real-time availability.
  - Urban Company restricts most provider information before payment.

- **Faster, Developer-Friendly Onboarding**
  - Providers can start offering services immediately on LocalHelp.
  - Urban Company often requires slower verification processes.

- **Real-Time System Updates**
  - Slot availability, booking conflicts, and earnings update instantly and automatically.

- **Fully Extensible**
  - Categories, services, and availability can be expanded without UI changes.

### Future Enhancements

- Admin dashboard for full platform control
- Real payment gateway integration
- Advanced provider verification workflows
- Customer–service chat system
- Real-time notifications (WebSockets)
- Map-based provider discovery
- Service rating and review system
- Subscription plans for providers
- AI-driven provider recommendations
- GST invoice generation for customers
