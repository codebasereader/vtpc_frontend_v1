import { getContactEnquiries, setContactEnquiryContacted } from '../../../api/contactEnquiriesApi'
import EnquiriesBoard from '../../../components/EnquiriesBoard'

// Stable reference so the board only loads once.
const loadContactEnquiries = () => getContactEnquiries().then((enquiries) => ({ enquiries }))

export default function ContactEnquiries() {
  return (
    <EnquiriesBoard
      title="Contact Enquiries"
      description="Messages sent through the “Contact Us” button on the website, newest first. Mark each one as contacted once you have followed up."
      emptyTitle="No contact enquiries yet"
      emptyHint="Messages from the website's “Contact Us” button will appear here."
      filePrefix="contact-enquiries"
      load={loadContactEnquiries}
      setContacted={setContactEnquiryContacted}
    />
  )
}
