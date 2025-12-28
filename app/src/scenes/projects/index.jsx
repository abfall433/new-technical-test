import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/api";

export default function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        total: "",
        threshold: ""
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.getProjects();
            setProjects(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Erreur lors du chargement des projets");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId) => {
        if (!confirm("Supprimer ce projet ?")) return;
        try {
            await api.deleteProject(projectId);
            toast.success("Projet supprimé");
            fetchProjects();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.createProject(formData);
            toast.success("Projet créé !");
            setShowForm(false);
            setFormData({ name: "", description: "", total: "", threshold: "" });
            fetchProjects();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la création");
        }
    };

    const checkThresholdValue = (e) => {
        let value = e.target.value;

        if (value === "") {
            setFormData({ ...formData, threshold: value });
            return;
        }

        value = Number(value);

        if (value >= 0 && value <= 1) {
            setFormData({ ...formData, threshold: value });
        }
    };

    if (loading) return <div className="p-8">Chargement...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Mes Projets</h1>
            <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
            {showForm ? "Annuler" : "Nouveau Projet"}
            </button>
        </div>

        {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
            <div className="space-y-3">
                <input
                type="text"
                placeholder="Nom du projet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
                />
                <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded"
                required
                />
                <input
                type="number"
                placeholder="Budget total"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                className="w-full p-2 border rounded"
                required
                />
                <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                placeholder="Seuil d'alerte (ex: 0.8 pour 80%)"
                value={formData.threshold}
                onChange={checkThresholdValue}
                className="w-full p-2 border rounded"
                required
                />
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Créer le projet
                </button>
            </div>
            </form>
        )}

        <div className="space-y-4">
            {projects.length === 0 ? (
            <p className="text-gray-500">Aucun projet. Créez-en un !</p>
            ) : (
            projects.map((project) => (
                <div
                key={project._id}
                className="p-4 border rounded hover:shadow-md transition flex justify-between items-start"
                >
                <div>
                    <h3 className="text-xl font-semibold">{project.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                    <div className="flex gap-4 text-sm">
                    <span>Budget: {project.budget?.total || 0}€</span>
                    <span>Dépensé: {project.budget?.spent || 0}€</span>
                    <span>Restant: {project.budget?.remaining || 0}€</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="text-white border border-blue-500 bg-blue-500 hover:bg-blue-600 rounded px-3 py-1 text-sm"
                    >
                    Détail
                    </button>
                    <button
                    className="text-white border border-red-500 bg-red-500 hover:bg-red-600 rounded px-3 py-1 text-sm"
                    onClick={() => handleDelete(project._id)}
                    >
                    Supprimer
                    </button>
                </div>
                </div>
            ))
            )}
        </div>
        </div>
    );
}
