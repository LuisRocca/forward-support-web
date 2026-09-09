import { useParams } from 'react-router'
import { PagePlaceholder } from '../../shared/layout/PagePlaceholder.tsx'

export function TicketDetailPage() {
  const { ticketId } = useParams()

  return <PagePlaceholder title={`Ticket ${ticketId ?? ''}`} />
}
