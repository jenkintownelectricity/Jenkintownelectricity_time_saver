import { EstimateForm } from '@/components/estimates/estimate-form'

export default function EditEstimatePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <EstimateForm estimateId={params.id} />
    </div>
  )
}
