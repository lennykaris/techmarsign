import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Phase {
  id: string;
  course_id: string;
  phase_number: number;
  title: string;
  description: string | null;
  duration: string | null;
  price: number | null;
}

interface PhaseFormData {
  phase_number: string;
  title: string;
  description: string;
  duration: string;
  price: string;
}

const defaultFormData: PhaseFormData = {
  phase_number: "",
  title: "",
  description: "",
  duration: "",
  price: ""
};

interface PhaseManagerProps {
  courseId: string;
  courseTitle: string;
  onBack: () => void;
}

export function PhaseManager({ courseId, courseTitle, onBack }: PhaseManagerProps) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [deletingPhase, setDeletingPhase] = useState<Phase | null>(null);
  const [formData, setFormData] = useState<PhaseFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPhases();
  }, [courseId]);

  const fetchPhases = async () => {
    const { data, error } = await supabase
      .from("course_phases")
      .select("*")
      .eq("course_id", courseId)
      .order("phase_number", { ascending: true });

    if (error) {
      toast.error("Failed to fetch phases");
    } else {
      setPhases(data || []);
    }
    setLoading(false);
  };

  const handleOpenCreate = () => {
    setEditingPhase(null);
    const nextPhaseNumber = phases.length > 0 
      ? Math.max(...phases.map(p => p.phase_number)) + 1 
      : 1;
    setFormData({ ...defaultFormData, phase_number: nextPhaseNumber.toString() });
    setDialogOpen(true);
  };

  const handleOpenEdit = (phase: Phase) => {
    setEditingPhase(phase);
    setFormData({
      phase_number: phase.phase_number.toString(),
      title: phase.title,
      description: phase.description || "",
      duration: phase.duration || "",
      price: phase.price?.toString() || ""
    });
    setDialogOpen(true);
  };

  const handleOpenDelete = (phase: Phase) => {
    setDeletingPhase(phase);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.phase_number) {
      toast.error("Title and phase number are required");
      return;
    }

    const phaseNumber = parseInt(formData.phase_number);
    if (isNaN(phaseNumber) || phaseNumber < 1) {
      toast.error("Phase number must be a positive number");
      return;
    }

    // Check for duplicate phase numbers (excluding current phase when editing)
    const isDuplicate = phases.some(
      p => p.phase_number === phaseNumber && p.id !== editingPhase?.id
    );
    if (isDuplicate) {
      toast.error("A phase with this number already exists");
      return;
    }

    setSaving(true);

    const phaseData = {
      course_id: courseId,
      phase_number: phaseNumber,
      title: formData.title,
      description: formData.description || null,
      duration: formData.duration || null,
      price: formData.price ? parseFloat(formData.price) : null
    };

    if (editingPhase) {
      const { error } = await supabase
        .from("course_phases")
        .update(phaseData)
        .eq("id", editingPhase.id);

      if (error) {
        toast.error("Failed to update phase");
      } else {
        toast.success("Phase updated successfully");
        setDialogOpen(false);
        fetchPhases();
      }
    } else {
      const { error } = await supabase
        .from("course_phases")
        .insert(phaseData);

      if (error) {
        toast.error("Failed to create phase");
      } else {
        toast.success("Phase created successfully");
        setDialogOpen(false);
        fetchPhases();
      }
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingPhase) return;

    const { error } = await supabase
      .from("course_phases")
      .delete()
      .eq("id", deletingPhase.id);

    if (error) {
      toast.error("Failed to delete phase. It may have associated data.");
    } else {
      toast.success("Phase deleted successfully");
      setDeleteDialogOpen(false);
      fetchPhases();
    }
  };

  const totalPrice = phases.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Phase Management</h3>
            <p className="text-sm text-muted-foreground">{courseTitle}</p>
          </div>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Phase
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading phases...</p>
      ) : phases.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No phases defined for this course yet.</p>
          <p className="text-sm">Add phases to structure your course content and pricing.</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Phase #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phases.map((phase) => (
                <TableRow key={phase.id}>
                  <TableCell className="font-medium">Phase {phase.phase_number}</TableCell>
                  <TableCell>{phase.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{phase.description || "-"}</TableCell>
                  <TableCell>{phase.duration || "-"}</TableCell>
                  <TableCell>{phase.price ? `$${phase.price}` : "Free"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(phase)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(phase)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end p-4 bg-muted/50 rounded-lg">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Course Price (all phases)</p>
              <p className="text-xl font-bold">${totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPhase ? "Edit Phase" : "Create Phase"}</DialogTitle>
            <DialogDescription>
              {editingPhase ? "Update phase details" : "Add a new phase to this course"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phase_number">Phase Number *</Label>
                <Input
                  id="phase_number"
                  type="number"
                  min="1"
                  value={formData.phase_number}
                  onChange={(e) => setFormData({ ...formData, phase_number: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction, Advanced Topics"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will students learn in this phase?"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 2 weeks, 10 hours"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingPhase ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Phase</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "Phase {deletingPhase?.phase_number}: {deletingPhase?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
