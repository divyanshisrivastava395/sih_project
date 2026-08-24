import { SOSRequest, ResourceRequest } from '../types/disaster';

// RESEARCH-GROUNDED SYNTHETIC PROTOTYPE SOS REQUESTS FOR SIH26191
export const INITIAL_SOS_REQUESTS: SOSRequest[] = [
  {
    id: 'SOS-1042',
    habitation: 'Village Dhekial (North Ward, Near Riverbank)',
    latitude: 26.6210,
    longitude: 93.3140,
    people: 6,
    request_type: 'trapped',
    priority: 'HIGH',
    status: 'PENDING',
    timestamp: '14 mins ago',
    notes: 'Water level reached 4 feet on ground floor. 2 elderly members and 1 infant require boat evacuation.',
    contactPhone: '+91 98641 XXXXX',
  },
  {
    id: 'SOS-1039',
    habitation: 'Kamalabari Choti Ghat (Island Pocket)',
    latitude: 26.7480,
    longitude: 93.5820,
    people: 4,
    request_type: 'medical',
    priority: 'CRITICAL',
    status: 'VERIFIED',
    timestamp: '28 mins ago',
    notes: 'Severe injury from falling tin roof; immediate medical dressing & oxygen support needed.',
    contactPhone: '+91 94351 XXXXX',
    verifiedBy: 'Relief Coordinator (Sri P. Bora)',
  },
  {
    id: 'SOS-1035',
    habitation: 'Tilwara Riverside Settlement',
    latitude: 30.4820,
    longitude: 79.1230,
    people: 8,
    request_type: 'evacuation',
    priority: 'CRITICAL',
    status: 'FORWARDED_FOR_RESCUE',
    timestamp: '52 mins ago',
    notes: 'Landslide debris accumulated behind houses. Road NH-107 cutoff.',
    contactPhone: '+91 97580 XXXXX',
    verifiedBy: 'Relief Coordinator (Shri B. S. Rawat)',
    forwardedTo: 'Simulated SDRF 2nd Team (Demo Handoff)',
    forwardedAt: '40 mins ago',
  }
];

export const INITIAL_RESOURCE_REQUESTS: ResourceRequest[] = [
  {
    id: 'REQ-501',
    from_site: 'site_assam_02',
    from_site_name: 'Bokakhat Community Hall (Centre B)',
    to_site: 'site_assam_01',
    to_site_name: 'Golaghat Higher Secondary School (Centre A)',
    resource: 'water',
    quantity: '2,000 Litres RO Canisters',
    priority: 'HIGH',
    status: 'REQUESTED',
    timestamp: '22 mins ago',
  }
];
