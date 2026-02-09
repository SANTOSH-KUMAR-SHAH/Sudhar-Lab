# 🏡 LocalHelp – Home Services Marketplace

LocalHelp is a **full-stack home-services platform** inspired by **Urban Company**. It serves as a comprehensive two-sided marketplace allowing **customers** to book local service providers and **providers** to manage their availability, bookings, and earnings. The platform has an **Admin** to manage providers and customers, check reports and feedbacks, and manage services.

The system includes a complete booking flow, robust authentication, dedicated dashboards for every role, dynamic slot management, and a mock payment system.

---

## 🔗 Live Links

| Platform | Link |
| :--- | :--- |
| **Frontend** (Next.js) | https://localhelpfrontendv2.vercel.app/ |
| **Backend API** (Express.js) | https://localhelp-hu2d.onrender.com |
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

##  Features

### Customer Features
* Secure **login and signup** using JWT.
* Explore categories and subcategories.
* View provider services, pricing, and duration.
* **Real-time slot availability** with conflict detection.
* Book services with a **mock payment workflow**.

**Customer Dashboard:**
* View bookings with statuses (**Pending / Accepted / Rejected / Completed**).
* View booking history.
* Provide feedback for completed services or report against the bad service.
* Manage saved addresses (Create, Edit, Delete).
* Update profile information.

### Provider Features
* Mock Aadhar system to verify customers to become a provider.
* Add services, defining duration and price.
* **New Dedicated Slot Management**: Separate "Slots" tab for weekly schedule editing.
* **Separated Profile Management**: Dedicated read-only view for personal and account details.
* Manage availability through **dynamic time-slot JSON**.
* View **real-time booking requests**.
* **Accept or reject** requests (rejection automatically frees up the slot).
* View customer details **after accepting** the request.
* **Mark completed services** proactively via the dashboard.

**Provider Dashboard:**
* Live and Completed requests.
* Earnings summary.
* Profile management & Dedicated Slot Manager.
* Add services, defining duration and price or Edit existing services.

---

##  Intelligent Slot and Availability System

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
- **Manual Completion Control**: Providers can mark services as complete immediately after finishing the job.

This system is designed to be more flexible compared to platforms with rigid, pre-defined time blocks.

### Why LocalHelp Improves Upon Urban Company

- **Flexible Time Slot Scheduling**
  - LocalHelp supports custom durations (30 min, 45 min, 2 hrs, etc.) and adjusts slots dynamically.
  - Urban Company typically uses fixed blocks (e.g., 9–11, 11–1).

- **Transparent Provider Details**
  - LocalHelp shows provider name, contact details (after acceptance), experience, bio, and real-time availability.

- **Faster, Developer-Friendly Onboarding**
  - Providers can start offering services immediately on LocalHelp.

- **Real-Time System Updates**
  - Slot availability, booking conflicts, and earnings update instantly and automatically.

- **Fully Extensible**
  - Categories, services, and availability can be expanded without UI changes.

### Future Enhancements

- Real payment gateway integration
- Advanced provider verification workflows
- Customer–service chat system
- Real-time notifications (WebSockets)
- Map-based provider discovery
- Service rating and review system
- Subscription plans for providers
- AI-driven provider recommendations
- GST invoice generation for customers

---

## API Endpoints

| Resource | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/register` | Register a new user |
| | POST | `/api/auth/login` | Login user |
| | GET | `/api/auth/me` | Get current user details |
| **Providers** | POST | `/api/become-provider` | Apply to become a provider |
| | GET | `/api/providers/me` | Get own provider profile |
| | PATCH | `/api/providers/availability` | Toggle online/offline status |
| | PATCH | `/api/providers/schedule` | Update weekly slots |
| | PATCH | `/api/providers/bookings/:id/complete` | Mark booking as complete |
| | GET | `/api/providers/earnings` | Get total earnings |
| **Services** | GET | `/api/services` | GetAll / Filter services |
| | POST | `/api/services` | Add new service |
| | PUT | `/api/services/:id` | Update service |
| **Bookings** | GET | `/api/bookings/providers/bookings` | Get requests for provider |
| | POST | `/api/bookings` | Create a new booking |
| | PATCH | `/api/bookings/:id/status` | Update booking status (Accept/Reject) |
| **Categories** | GET | `/api/categories` | List all categories |
| **Admin** | GET | `/api/admin/stats` | Get platform statistics |
| | PATCH | `/api/admin/providers/:id/verify` | Verify provider application |

---

## Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/paramkhodiyar/LocalHelpv2.git
```
2. Install dependencies
```bash
npm install
```
3. Set up environment variables
```bash
.env
```
4. Run the development server
```bash
npm run dev
```

---

## Note

I am glad you are reading this README. If you find any issues or have suggestions for improvement, please let me know. I am always open to feedback and suggestions.

# Made with ❤️ by Param Khodiyar
- GitHub: [ParamKhodiyar](https://github.com/paramkhodiyar)
- LinkedIn: [paramkhodiyar](https://www.linkedin.com/in/paramkhodiyar/)