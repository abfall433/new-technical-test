import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "@/services/api"

    export default function ProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = useState(null)
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        amount: "",
        incurred_at: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        try {
            const [projectRes, expensesRes] = await Promise.all([
                api.getProject(id),
                api.getExpenses(id)
            ])
            setProject(projectRes.data)
            setExpenses(expensesRes.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors du chargement")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.createExpense(id, formData)
            toast.success("Dépense ajoutée !")
            setShowForm(false)
            setFormData({ title: "", description: "", amount: "", incurred_at: new Date().toISOString().split('T')[0] })
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de la création")
        }
    }

    const handleDelete = async (expenseId) => {
        if (!confirm("Supprimer cette dépense ?")) return
        try {
            await api.deleteExpense(id, expenseId)
            toast.success("Dépense supprimée")
            fetchData()
        } catch (error) {
            toast.error("Erreur lors de la suppression")
        }
    }

    if (loading) return <div className="p-8">Chargement...</div>

    if (!project) return <div className="p-8">Projet non trouvé</div>

    return (
        <div className="p-8 max-w-4xl mx-auto">
        <button onClick={() => navigate('/projects')} className="mb-4 text-blue-500 hover:underline">
            ← Retour aux projets
        </button>

        
        <div className="mb-6 p-6 border rounded bg-white shadow">
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="text-gray-600 mb-4">{project.description}</p>
            
        
            {project.status === "warning" && (
            <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                Bientôt à cours de budget
            </div>
            )}
            {project.status === "out_of_budget" && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                À cours de budget
            </div>
            )}
            
            <div className="grid grid-cols-3 gap-4">
            <div>
                <p className="text-sm text-gray-500">Budget Total</p>
                <p className="text-2xl font-bold">{project.budget?.total || 0}€</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Dépensé</p>
                <p className="text-2xl font-bold text-red-500">{project.budget?.spent || 0}€</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Restant</p>
                <p className="text-2xl font-bold text-green-500">{project.budget?.remaining || 0}€</p>
            </div>
            </div>
        </div>

        
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Dépenses</h2>
            <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
            {showForm ? "Annuler" : "Ajouter une dépense"}
            </button>
        </div>

        {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
            <div className="space-y-3">
                <input
                type="text"
                placeholder="Titre"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                placeholder="Montant"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full p-2 border rounded"
                required
                />
                <input
                type="date"
                value={formData.incurred_at}
                onChange={(e) => setFormData({ ...formData, incurred_at: e.target.value })}
                className="w-full p-2 border rounded"
                required
                />
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Ajouter
                </button>
            </div>
            </form>
        )}

        <div className="space-y-3">
            {expenses.length === 0 ? (
            <p className="text-gray-500">Aucune dépense pour ce projet.</p>
            ) : (
            expenses.map((expense) => (
                <div key={expense._id} className="p-4 border rounded bg-white flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg">{expense.title}</h3>
                    <p className="text-gray-600 text-sm">{expense.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Montant: <strong className="text-black">{expense.amount}€</strong></span>
                    <span>Date: {new Date(expense.incurred_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <button
                    onClick={() => handleDelete(expense._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                    Supprimer
                </button>
                </div>
            ))
            )}
        </div>
        </div>
    )
}
