export interface DistrictInfo {
  id: string;
  name: string;
  coords: [number, number];
  zoom: number;
}

export interface StateInfo {
  id: string;
  name: string;
  hindiName?: string;
  coords: [number, number];
  zoom: number;
  primaryDisasterType: 'Landslide / Cloudburst' | 'Monsoon Flood' | 'Cyclone / Storm Surge' | 'River Flood';
  districts: DistrictInfo[];
}

export const INDIAN_STATES: StateInfo[] = [
  {
    id: 'uttarakhand',
    name: 'Uttarakhand',
    hindiName: 'उत्तराखंड',
    coords: [30.285, 78.981],
    zoom: 8,
    primaryDisasterType: 'Landslide / Cloudburst',
    districts: [
      { id: 'all', name: 'All Districts', coords: [30.285, 78.981], zoom: 8 },
      { id: 'rudraprayag', name: 'Rudraprayag (Mandakini Valley)', coords: [30.285, 78.981], zoom: 11 },
      { id: 'chamoli', name: 'Chamoli (Alaknanda Basin)', coords: [30.41, 79.33], zoom: 10 },
      { id: 'pauri_garhwal', name: 'Pauri Garhwal (Srinagar)', coords: [30.15, 78.78], zoom: 10 },
      { id: 'uttarkashi', name: 'Uttarkashi (Bhagirathi Gorge)', coords: [30.73, 78.44], zoom: 10 },
      { id: 'dehradun', name: 'Dehradun', coords: [30.3165, 78.0322], zoom: 10 },
    ],
  },
  {
    id: 'assam',
    name: 'Assam',
    hindiName: 'असम',
    coords: [26.518, 93.966],
    zoom: 8,
    primaryDisasterType: 'Monsoon Flood',
    districts: [
      { id: 'all', name: 'All Districts', coords: [26.518, 93.966], zoom: 8 },
      { id: 'golaghat', name: 'Golaghat (Dhansiri Basin)', coords: [26.518, 93.966], zoom: 11 },
      { id: 'jorhat', name: 'Jorhat', coords: [26.758, 94.215], zoom: 11 },
      { id: 'majuli', name: 'Majuli Island', coords: [26.95, 94.17], zoom: 11 },
      { id: 'nagaon', name: 'Nagaon (Kopili River)', coords: [26.35, 92.68], zoom: 10 },
      { id: 'kamrup', name: 'Kamrup (Guwahati)', coords: [26.18, 91.74], zoom: 10 },
    ],
  },
  {
    id: 'odisha',
    name: 'Odisha',
    hindiName: 'ओडिशा',
    coords: [19.813, 85.831],
    zoom: 8,
    primaryDisasterType: 'Cyclone / Storm Surge',
    districts: [
      { id: 'all', name: 'All Districts', coords: [19.813, 85.831], zoom: 8 },
      { id: 'puri', name: 'Puri Coastal Belt', coords: [19.813, 85.831], zoom: 11 },
      { id: 'kendrapara', name: 'Kendrapara (Marshaghai)', coords: [20.502, 86.422], zoom: 11 },
      { id: 'jagatsinghpur', name: 'Jagatsinghpur (Paradip)', coords: [20.27, 86.17], zoom: 11 },
      { id: 'khordha', name: 'Khordha / Bhubaneswar', coords: [20.296, 85.824], zoom: 10 },
      { id: 'balasore', name: 'Balasore', coords: [21.49, 86.93], zoom: 10 },
    ],
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    hindiName: 'महाराष्ट्र',
    coords: [19.138, 77.321],
    zoom: 7,
    primaryDisasterType: 'River Flood',
    districts: [
      { id: 'all', name: 'All Districts', coords: [19.138, 77.321], zoom: 7 },
      { id: 'nanded', name: 'Nanded (Godavari Basin)', coords: [19.138, 77.321], zoom: 11 },
      { id: 'kolhapur', name: 'Kolhapur (Panchganga)', coords: [16.705, 74.243], zoom: 10 },
      { id: 'sangli', name: 'Sangli (Krishna River)', coords: [16.852, 74.581], zoom: 10 },
      { id: 'raigad', name: 'Raigad (Mahad / Savitri)', coords: [18.23, 73.44], zoom: 10 },
      { id: 'pune', name: 'Pune', coords: [18.5204, 73.8567], zoom: 10 },
    ],
  },
  {
    id: 'kerala',
    name: 'Kerala',
    hindiName: 'केरल',
    coords: [9.85, 76.97],
    zoom: 8,
    primaryDisasterType: 'Landslide / Cloudburst',
    districts: [
      { id: 'all', name: 'All Districts', coords: [9.85, 76.97], zoom: 8 },
      { id: 'idukki', name: 'Idukki (Munnar Highlands)', coords: [9.85, 76.97], zoom: 11 },
      { id: 'wayanad', name: 'Wayanad (Meppadi / Chooralmala)', coords: [11.685, 76.132], zoom: 11 },
      { id: 'ernakulam', name: 'Ernakulam (Periyar River)', coords: [9.9816, 76.2999], zoom: 10 },
      { id: 'alappuzha', name: 'Alappuzha (Kuttanad Waterway)', coords: [9.4981, 76.3388], zoom: 10 },
      { id: 'pathanamthitta', name: 'Pathanamthitta (Pamba Basin)', coords: [9.2648, 76.787], zoom: 10 },
    ],
  },
  {
    id: 'bihar',
    name: 'Bihar',
    hindiName: 'बिहार',
    coords: [25.88, 86.6],
    zoom: 8,
    primaryDisasterType: 'Monsoon Flood',
    districts: [
      { id: 'all', name: 'All Districts', coords: [25.88, 86.6], zoom: 8 },
      { id: 'saharsa', name: 'Saharsa (Kosi Embankment)', coords: [25.88, 86.6], zoom: 11 },
      { id: 'supaul', name: 'Supaul', coords: [26.12, 86.6], zoom: 11 },
      { id: 'darbhanga', name: 'Darbhanga (Kamala Balan)', coords: [26.15, 85.9], zoom: 10 },
      { id: 'patna', name: 'Patna', coords: [25.5941, 85.1376], zoom: 10 },
    ],
  },
  {
    id: 'himachal',
    name: 'Himachal Pradesh',
    hindiName: 'हिमाचल प्रदेश',
    coords: [31.70, 76.93],
    zoom: 8,
    primaryDisasterType: 'Landslide / Cloudburst',
    districts: [
      { id: 'all', name: 'All Districts', coords: [31.70, 76.93], zoom: 8 },
      { id: 'mandi', name: 'Mandi (Beas River Gorge)', coords: [31.70, 76.93], zoom: 11 },
      { id: 'kullu', name: 'Kullu Valley', coords: [31.95, 77.10], zoom: 11 },
      { id: 'shimla', name: 'Shimla', coords: [31.10, 77.17], zoom: 10 },
      { id: 'kangra', name: 'Kangra (Dharamshala)', coords: [32.10, 76.27], zoom: 10 },
    ],
  },
];
