import { useState } from 'react';
import {
  FileText,
  Eye,
  Download,
  MoreVertical,
  Trash2,
  Send,
} from 'lucide-react';
import { StatusBadge, InvoiceStatus } from './status-badge';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
} from '@automatize/ui/web';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onView?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8 rounded-md" />
      </TableCell>
    </TableRow>
  );
}

export function InvoiceTable({
  invoices,
  isLoading = false,
  onView,
  onDownload,
  onSend,
  onDelete,
}: InvoiceTableProps) {
  const [selectedId, _setSelectedId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="relative w-full overflow-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[120px]">
              <span className="sr-only">Invoice </span>Number
            </TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="w-[140px]">Amount</TableHead>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead className="w-[120px]">Due Date</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[60px]">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))}
            </>
          ) : (
            invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className="group"
                aria-selected={selectedId === invoice.id}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="font-mono">{invoice.invoiceNumber}</span>
                  </div>
                </TableCell>
                <TableCell>{invoice.client}</TableCell>
                <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(invoice.date)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(invoice.dueDate)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0"
                        aria-label={`Actions for invoice ${invoice.invoiceNumber}`}
                      >
                        <MoreVertical className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(invoice)}>
                          <Eye className="size-4 mr-2" aria-hidden="true" />
                          View Details
                        </DropdownMenuItem>
                      )}
                      {onDownload && (
                        <DropdownMenuItem onClick={() => onDownload(invoice)}>
                          <Download
                            className="size-4 mr-2"
                            aria-hidden="true"
                          />
                          Download PDF
                        </DropdownMenuItem>
                      )}
                      {onSend && invoice.status !== 'paid' && (
                        <DropdownMenuItem onClick={() => onSend(invoice)}>
                          <Send className="size-4 mr-2" aria-hidden="true" />
                          Send Invoice
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(invoice)}
                            className="text-[var(--destructive)] focus:text-[var(--destructive)]"
                          >
                            <Trash2
                              className="size-4 mr-2"
                              aria-hidden="true"
                            />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
