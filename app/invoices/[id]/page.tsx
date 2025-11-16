import { InvoiceDetail } from '@/components/invoices/invoice-detail'

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <InvoiceDetail invoiceId={params.id} />
    </div>
  )
}
