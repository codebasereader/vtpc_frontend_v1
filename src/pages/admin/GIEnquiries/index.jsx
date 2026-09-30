import { getEnquiries, setEnquiryContacted } from '../../../api/enquiriesApi'
import { getGiProducts } from '../../../api/giProductsApi'
import EnquiriesBoard from '../../../components/EnquiriesBoard'

// Stable reference so the board only loads once.
const loadGiEnquiries = () =>
  Promise.all([getEnquiries(), getGiProducts()]).then(([enquiries, products]) => ({ enquiries, products }))

export default function GIEnquiries() {
  return (
    <EnquiriesBoard
      title="GI Enquiries"
      description="Enquiries submitted from “Enquire now” on Karnataka's GI Treasures, newest first. Mark each one as contacted once you have followed up."
      emptyTitle="No enquiries yet"
      emptyHint="New enquiries from the GI Treasures “Enquire now” form will appear here."
      filePrefix="gi-enquiries"
      hasProducts
      load={loadGiEnquiries}
      setContacted={setEnquiryContacted}
    />
  )
}
