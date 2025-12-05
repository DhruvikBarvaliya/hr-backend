const express = require("express");

const router = express.Router();

/**
 * @swagger
 * /api/v1/ping:
 *   get:
 *     summary: Ping the server
 *     responses:
 *       200:
 *         description: pong
 */
router.get("/ping", (req, res) => res.json({ pong: true }));

// mount feature routers
router.use("/auth", require("./auth"));
router.use("/employees", require("./employees"));
router.use("/leaves", require("./leaves"));
router.use("/holidays", require("./holidays"));
router.use("/clients", require("./clients"));

module.exports = router;
