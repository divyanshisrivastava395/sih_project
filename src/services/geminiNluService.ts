import { ResidentVoiceQuery, ResourceType } from '../types/disaster';

/**
 * Intelligent client-side fallback extractor for resident voice queries
 * Handles multilingual keywords (Hindi, Hinglish, Bengali, Marathi, Assamese, Odia, English)
 */
export function extractStructuredFiltersFallback(transcript: string): ResidentVoiceQuery {
  const lower = transcript.toLowerCase();
  
  // 1. Detect Intent
  let intent: ResidentVoiceQuery['intent'] = 'relocation';
  if (
    lower.includes('sos') ||
    lower.includes('bachao') ||
    lower.includes('bachaoo') ||
    lower.includes('trapped') ||
    lower.includes('emergency help') ||
    lower.includes('madad chahiye') ||
    lower.includes('sahayata') ||
    lower.includes('fas gaye') ||
    lower.includes('faans gaye') ||
    lower.includes('rescue')
  ) {
    intent = 'sos';
  } else if (
    lower.includes('where is') ||
    lower.includes('kahan milega') ||
    lower.includes('kahan milegi') ||
    lower.includes('kothay') ||
    lower.includes('kuthe') ||
    lower.includes('pani kahan') ||
    lower.includes('dawa kahan') ||
    lower.includes('get water') ||
    lower.includes('get medical') ||
    lower.includes('get food') ||
    (lower.includes('resource') && !lower.includes('shelter'))
  ) {
    intent = 'resource_search';
  } else if (
    lower.includes('hazard') ||
    lower.includes('khatra') ||
    lower.includes('flood warning') ||
    lower.includes('cyclone')
  ) {
    intent = 'hazard_check';
  } else {
    intent = 'relocation';
  }

  // 2. Extract People Count
  let people = 4; // default
  const numMatches = lower.match(/\b(\d+)\s*(people|log|vyakti|members|parivaar|family|parivar|jon)?\b/);
  if (numMatches && numMatches[1]) {
    people = parseInt(numMatches[1], 10);
  } else if (lower.includes('one') || lower.includes('ek') || lower.includes('single')) {
    people = 1;
  } else if (lower.includes('two') || lower.includes('do') || lower.includes('doh')) {
    people = 2;
  } else if (lower.includes('three') || lower.includes('teen') || lower.includes('tin')) {
    people = 3;
  } else if (lower.includes('four') || lower.includes('chaar') || lower.includes('char')) {
    people = 4;
  } else if (lower.includes('five') || lower.includes('paanch') || lower.includes('panch')) {
    people = 5;
  } else if (lower.includes('six') || lower.includes('chhah') || lower.includes('chhe') || lower.includes('che')) {
    people = 6;
  } else if (lower.includes('seven') || lower.includes('saat')) {
    people = 7;
  } else if (lower.includes('eight') || lower.includes('aath')) {
    people = 8;
  } else if (lower.includes('nine') || lower.includes('nau')) {
    people = 9;
  } else if (lower.includes('ten') || lower.includes('das')) {
    people = 10;
  }

  // 3. Extract Resource Requirements
  const water_required =
    lower.includes('water') ||
    lower.includes('paani') ||
    lower.includes('pani') ||
    lower.includes('jal') ||
    lower.includes('drinking');

  const medical_required =
    lower.includes('medical') ||
    lower.includes('doctor') ||
    lower.includes('hospital') ||
    lower.includes('dawai') ||
    lower.includes('dawa') ||
    lower.includes('aushadh') ||
    lower.includes('health') ||
    lower.includes('injured') ||
    lower.includes('chot');

  const food_required =
    lower.includes('food') ||
    lower.includes('khana') ||
    lower.includes('bhojan') ||
    lower.includes('ration') ||
    lower.includes('meals') ||
    lower.includes('rice');

  const sanitation_required =
    lower.includes('toilet') ||
    lower.includes('washroom') ||
    lower.includes('sanitation') ||
    lower.includes('shauchalay');

  const safety_required =
    lower.includes('safe') ||
    lower.includes('surakshit') ||
    lower.includes('high ground') ||
    lower.includes('bina khatra') ||
    true; // Default to true in disaster context

  // 4. Resource type for resource search
  let resource_type: ResourceType | undefined = undefined;
  if (water_required) resource_type = 'water';
  else if (medical_required) resource_type = 'medical';
  else if (food_required) resource_type = 'food';
  else if (lower.includes('shelter') || lower.includes('rahat')) resource_type = 'shelter';
  else if (lower.includes('rescue') || lower.includes('boat')) resource_type = 'emergency_help';

  return {
    raw_transcript: transcript,
    intent,
    people,
    water_required,
    medical_required,
    food_required,
    sanitation_required,
    safety_required,
    resource_type,
  };
}

/**
 * Calls Server-side Gemini NLU endpoint with client-side fallback
 */
export async function parseResidentVoiceQuery(
  transcript: string,
  userLocationName = 'Golaghat, Assam'
): Promise<ResidentVoiceQuery> {
  if (!transcript || transcript.trim().length === 0) {
    return {
      raw_transcript: '',
      intent: 'relocation',
      people: 4,
      water_required: true,
      medical_required: false,
      food_required: false,
      sanitation_required: false,
      safety_required: true,
    };
  }

  try {
    const res = await fetch('/api/parse-resident-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, userLocationName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.parsed) {
        return {
          raw_transcript: transcript,
          ...data.parsed,
        };
      }
    }
  } catch (err) {
    console.warn('Backend Gemini call failed or offline, using robust client parser:', err);
  }

  // Resilient fallback
  return extractStructuredFiltersFallback(transcript);
}
