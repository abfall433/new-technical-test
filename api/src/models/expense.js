const mongoose = require("mongoose");

const MODELNAME = "expense";
const ProjectObject = require('./project');
const { sendEmail } = require("../services/brevo");


const Schema = new mongoose.Schema({
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: "project", required: true },
    amount: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    incurred_at: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
});

// validate expense against project budget before saving
Schema.pre('save', async function() {
    const project = await ProjectObject.findById(this.project_id);
    if (!project) {
        throw new Error("Projet non trouvé");
    }
    
    const newRemaining = project.budget.remaining - this.amount;
    
    if (newRemaining < 0) {
        throw new Error("Budget insuffisant ! Solde restant : " + project.budget.remaining + "€");
    }
});

// update project budget and status on expense creation
Schema.post('save', async function() {
    const project = await ProjectObject.findById(this.project_id);
    if (project) {
        const oldStatus = project.status;
        project.budget.spent = (project.budget.spent || 0) + this.amount;
        project.budget.remaining = project.budget.total - project.budget.spent;
        
        if (project.budget.remaining === 0) {
            project.status = "out_of_budget";
        } else if (project.budget.remaining / project.budget.total < project.threshold) {
            project.status = "warning";
        }
        
        await project.save();

        if (oldStatus !== project.status) {
            const UserObject = require('./user');
            const user = await UserObject.findById(project.user_id);
            
            if (user && user.email) {
                if (project.status === "warning") {
                    await sendEmail(
                        [{ email: user.email, name: user.name }],
                        " Attention : Budget bientôt épuisé",
                        `<p>Bonjour ${user.name},</p><p>Votre projet "${project.name}" sera bientot a cours de budget.</p><p>Budget restant : ${project.budget.remaining}€ sur ${project.budget.total}€</p><p>Cordialement</p>`
                    );
                } else if (project.status === "out_of_budget") {
                    await sendEmail(
                        [{ email: user.email, name: user.name}],
                        "Budget épuisé",
                        `<p>Bonjour ${user.name},</p><p>Votre projet "${project.name}" a épuisé son budget.</p><p>Budget total : ${project.budget.total}€<br>Dépensé : ${project.budget.spent}€</p><p>Cordialement</p>`
                    );
                }
            }
        }

    }
});

// rollback budget on expense deletion
Schema.post('findOneAndDelete', async function(doc) {
    if (!doc) return;
    const project = await ProjectObject.findById(doc.project_id);

    if (project) {
        project.budget.spent = Math.max(0, (project.budget.spent || 0) - doc.amount);
        project.budget.remaining = project.budget.total - project.budget.spent;
        
        if (project.budget.remaining === 0) {
            project.status = "out_of_budget";
        } else if (project.budget.remaining / project.budget.total < project.threshold) {
            project.status = "warning";
        } else {
            project.status = "ok";
        }
        await project.save();
    }
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
