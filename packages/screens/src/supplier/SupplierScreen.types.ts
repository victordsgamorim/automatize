export interface SupplierRow {
  id: string;
  name: string;
}

export interface SupplierScreenProps {
  suppliers: SupplierRow[];
  onAdd: (name: string) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}
