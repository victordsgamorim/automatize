export interface TechnicianRow {
  id: string;
  name: string;
  /** ISO date string — "YYYY-MM-DD" */
  entryDate: string;
}

export interface TechnicianScreenProps {
  /** List of technicians to display */
  technicians: TechnicianRow[];
  /** Called when a new technician is submitted via the add form */
  onAdd: (name: string, entryDate: string) => void;
  /** Called when a technician row is saved after inline editing */
  onEdit: (id: string, name: string, entryDate: string) => void;
  /** Called when a technician row delete icon is pressed */
  onDelete: (id: string) => void;
}
