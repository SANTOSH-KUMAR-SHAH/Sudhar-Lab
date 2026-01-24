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
    getAllUsers
} = require("../controllers/admin.controller");

// All admin routes must be protected and restricted to ADMIN role
router.use(auth);
// Note: You might need to add logic to your role.middleware to handle "ADMIN" if it doesn't already.
// Since we added ADMIN to the Enum, let's assume checkRole can handle it or we update it next.
router.get("/applications/pending", checkRole("ADMIN"), getPendingApplications);
router.get("/providers", checkRole("ADMIN"), getAllProviders);
router.put("/applications/:id/approve", checkRole("ADMIN"), approveApplication);
router.put("/applications/:id/reject", checkRole("ADMIN"), rejectApplication);
router.put("/providers/:id/demote", checkRole("ADMIN"), demoteProvider);
router.put("/providers/:id/promote", checkRole("ADMIN"), promoteProvider);
router.get("/users", checkRole("ADMIN"), getAllUsers);
module.exports = router;
