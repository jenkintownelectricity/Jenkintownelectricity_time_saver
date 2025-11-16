import { EstimateDetail } from '@/components/estimates/estimate-detail'

export default function EstimateDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <EstimateDetail estimateId={params.id} />
    </div>
  )
}
