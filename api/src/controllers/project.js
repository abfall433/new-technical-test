const express = require("express");
const passport = require("passport");
const router = express.Router();

const ProjectObject = require("../models/project");
const ExpenseObject = require("../models/expense");

const ERROR_CODES = require("../utils/errorCodes");


router.post("/", passport.authenticate("user", { session: false }), async (req, res) => {
    let { name, description, total, threshold } = req.body;
    if (!name || !description || total == null) {
        return res.status(400).send({ ok: false, code: ERROR_CODES.MISSING_PARAMETERS });
    }
    try {
        const budget = { total: total, spent: 0, remaining: total };
        const project = await ProjectObject.create({ user_id: req.user._id,name, description, budget, threshold });
        return res.status(200).send({ ok: true, data: project });
    } catch (error) {
        console.error("Error creating project:", error);
        return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
    }
});

router.get("/", passport.authenticate("user", { session: false }), async (req, res) => {
    try {
        const projects = await ProjectObject.find({ user_id: req.user._id });
        return res.status(200).send({ ok: true, data: projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
    }
});

router.get("/:id", passport.authenticate("user", { session: false }), async (req, res) => {
    try {
        const { id } = req.params;
        const project = await ProjectObject.findOne({ _id: id, user_id: req.user._id });
        
        if (!project) {
            return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
        }
        
        return res.status(200).send({ ok: true, data: project });
    } catch (error) {
        console.error("Error fetching project:", error);
        return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
    }
});

router.delete("/:id", passport.authenticate("user", { session: false }), async (req, res) => {
    try {
        const { id } = req.params;
        const project = await ProjectObject.findOneAndDelete({ _id: id, user_id: req.user._id });
        
        if (!project) {
            return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
        }
        
        await ExpenseObject.deleteMany({ project_id: id });
        
        return res.status(200).send({ ok: true, data: project });
    } catch (error) {
        console.error("Error deleting project:", error);
        return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
    }
});


router.post("/:projectId/expenses", passport.authenticate("user", { session: false }), async (req, res) => {
    try {
        const { projectId } = req.params;
        const { amount, title, description, incurred_at } = req.body;
        
        if (!amount || !title || !description || !incurred_at) {
            return res.status(400).send({ ok: false, code: ERROR_CODES.MISSING_PARAMETERS });
        }
        
        const project = await ProjectObject.findOne({ _id: projectId, user_id: req.user._id });
        if (!project) {
            return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
        }
        
        const expense = await ExpenseObject.create({
            project_id: projectId,
            amount,
            title,
            description,
            incurred_at
        });
        
        return res.status(200).send({ ok: true, data: expense });
    } catch (error) {
        console.error("Error creating expense:", error);
        return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
    }
});

router.get("/:projectId/expenses", passport.authenticate("user", { session: false }), async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const project = await ProjectObject.findOne({ _id: projectId, user_id: req.user._id });
        if (!project) {
            return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
        }
        
        const expenses = await ExpenseObject.find({ project_id: projectId });
        return res.status(200).send({ ok: true, data: expenses });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
    }
});

router.get("/:projectId/expenses/:expenseId", passport.authenticate("user", { session: false }), async (req, res) => {
    try {
        const { projectId, expenseId } = req.params;
        
        const expense = await ExpenseObject.findOne({ _id: expenseId, project_id: projectId });
        
        if (!expense) {
            return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
        }
        
        return res.status(200).send({ ok: true, data: expense });
    } catch (error) {
        console.error("Error fetching expense:", error);
        return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
    }
});

router.delete("/:projectId/expenses/:expenseId", passport.authenticate("user", { session: false }), async (req, res) => {
    try {
        const { projectId, expenseId } = req.params;
        
        const expense = await ExpenseObject.findOneAndDelete({ _id: expenseId, project_id: projectId });
        
        if (!expense) {
            return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
        }
        
        return res.status(200).send({ ok: true, data: expense });
    } catch (error) {
        console.error("Error deleting expense:", error);
        return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
    }
});


module.exports = router;
