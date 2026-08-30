const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/role.middleware");
const {
    getPendingApplications,
    getAllProviders,
    approveApplication,
    rejectApplication,
    demoteProvider,
    promoteProvider,
    getAllUsers,
    updateUserStatus,
    getAllBookings
} = require("../controllers/admin.controller");

router.use(auth);
router.get("/applications/pending", checkRole("ADMIN"), getPendingApplications);
router.get("/providers", checkRole("ADMIN"), getAllProviders);
router.put("/applications/:id/approve", checkRole("ADMIN"), approveApplication);
router.put("/applications/:id/reject", checkRole("ADMIN"), rejectApplication);
router.put("/providers/:id/demote", checkRole("ADMIN"), demoteProvider);
router.put("/providers/:id/promote", checkRole("ADMIN"), promoteProvider);
router.get("/users", checkRole("ADMIN"), getAllUsers);
router.patch("/users/:id/status", checkRole("ADMIN"), updateUserStatus);
router.get("/bookings/all", checkRole("ADMIN"), getAllBookings);
module.exports = router;
