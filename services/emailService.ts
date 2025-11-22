
import { BookingDraft, BookingTotals, PricingSettings } from '../types';

export const sendConfirmationEmail = async (
  draft: BookingDraft,
  totals: BookingTotals,
  settings: PricingSettings
): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const accommodationName = settings.accommodations.find(a => a.id === draft.selectedAccommodationId)?.name || 'No Accommodation';
  
  const subject = `Booking Confirmation: ${draft.guestName} - Shark Island Dive Center`;
  
  const body = `
Dear ${draft.guestName},

Thank you for choosing Shark Island Dive Center Fuvahmulah! 
We have received your booking request and are excited to welcome you to the Tiger Shark capital of the world.

Here is a summary of your booking details:

------------------------------------------------
BOOKING REFERENCE: SID-${Date.now().toString().slice(-6)}
------------------------------------------------

DATES:
Check-in:  ${draft.checkIn}
Check-out: ${draft.checkOut}
Duration:  ${totals.nights} Nights

GUESTS:
Divers:      ${draft.divers}
Non-Divers:  ${draft.nonDivers}
Nationality: ${draft.nationality}

DIVING PACKAGE:
Total Dives: ${draft.totalDives * draft.divers} dives (${draft.totalDives} per diver)
Gear Rental: ${draft.includeGearRental ? 'Yes, included' : 'No, bringing own gear'}

ACCOMMODATION:
Property: ${accommodationName}

LOGISTICS:
Domestic Flights: ${draft.includeDomesticFlight ? 'Included (We will arrange)' : 'Not included'}
Transfers:        ${settings.groundTransferType === 'PER_VEHICLE' ? 'Private Vehicle' : 'Standard Transfer'}

------------------------------------------------
ESTIMATED TOTAL: $${totals.grandTotal.toLocaleString()} (USD)
------------------------------------------------
Breakdown:
- Accommodation: $${totals.accommodationCost.toLocaleString()}
- Diving:        $${totals.diveCost.toLocaleString()}
- Gear:          $${totals.gearCost.toLocaleString()}
- Transfers/Air: $${totals.transferCost.toLocaleString()}
- Green Tax:     $${totals.taxCost.toLocaleString()}
------------------------------------------------

PAYMENT INSTRUCTIONS:
You have selected to pay via: ${draft.paymentMethod.replace('_', ' ')}.

Since we do not process automatic payments, our reservations team will contact you shortly via ${draft.whatsapp ? 'WhatsApp' : 'Email'} with the invoice and transfer details.

If you have any immediate questions, please reply to this email or contact us on WhatsApp at +960 778-6655.

Warm Regards,
The Team at Shark Island Dive Center
Fuvahmulah, Maldives
www.sharkislanddive.com
  `;

  // In a real app, you would use fetch() here to call an API like EmailJS, SendGrid, or AWS SES.
  // Example: emailjs.send('service_id', 'template_id', { to_email: draft.email, message: body })
  
  console.group('%c 📧 EMAIL SENT (SIMULATION)', 'color: #0d9488; font-weight: bold; font-size: 14px;');
  console.log(`%cTo: ${draft.email}`, 'font-weight: bold');
  console.log(`%cSubject: ${subject}`, 'font-weight: bold');
  console.log(body);
  console.groupEnd();

  return true;
};
