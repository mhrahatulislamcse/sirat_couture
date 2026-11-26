export interface ThanaItem {
  id: string;
  name: string;
}

export interface DistrictItem {
  id: string;
  name: string;
  isDhakaCity?: boolean;
  thanas: ThanaItem[];
}

export interface DivisionItem {
  id: string;
  name: string;
  districts: DistrictItem[];
}

export const BANGLADESH_DIVISIONS: DivisionItem[] = [
  {
    id: 'div_dhaka',
    name: 'Dhaka',
    districts: [
      {
        id: 'dist_dhaka_city',
        name: 'Dhaka (Metropolitan)',
        isDhakaCity: true,
        thanas: [
          { id: 'thana_gulshan', name: 'Gulshan 1 & 2' },
          { id: 'thana_banani', name: 'Banani' },
          { id: 'thana_dhanmondi', name: 'Dhanmondi' },
          { id: 'thana_uttara', name: 'Uttara Model Town' },
          { id: 'thana_bashundhara', name: 'Bashundhara R/A' },
          { id: 'thana_mirpur', name: 'Mirpur (DOHS / Sections 1-14)' },
          { id: 'thana_mohammadpur', name: 'Mohammadpur' },
          { id: 'thana_badda', name: 'Badda / Baridhara DOHS' },
          { id: 'thana_tejgaon', name: 'Tejgaon Industrial Area' },
          { id: 'thana_motijheel', name: 'Motijheel / Dilkusha' },
          { id: 'thana_shahbagh', name: 'Shahbagh / Ramna' },
          { id: 'thana_lalbagh', name: 'Lalbagh / Old Dhaka' },
          { id: 'thana_paltan', name: 'Paltan / Bijoynagar' },
          { id: 'thana_khilgaon', name: 'Khilgaon / Malibagh' },
          { id: 'thana_cantonment', name: 'Cantonment' }
        ]
      },
      {
        id: 'dist_gazipur',
        name: 'Gazipur',
        isDhakaCity: false,
        thanas: [
          { id: 'thana_tongi', name: 'Tongi' },
          { id: 'thana_gazipur_sadar', name: 'Gazipur Sadar' },
          { id: 'thana_kaliakair', name: 'Kaliakair' },
          { id: 'thana_sreepur', name: 'Sreepur' }
        ]
      },
      {
        id: 'dist_narayanganj',
        name: 'Narayanganj',
        isDhakaCity: false,
        thanas: [
          { id: 'thana_fatullah', name: 'Fatullah' },
          { id: 'thana_siddhirganj', name: 'Siddhirganj' },
          { id: 'thana_bandar', name: 'Bandar' },
          { id: 'thana_sonargaon', name: 'Sonargaon' }
        ]
      }
    ]
  },
  {
    id: 'div_chittagong',
    name: 'Chittagong',
    districts: [
      {
        id: 'dist_ctg',
        name: 'Chittagong (Chattogram)',
        isDhakaCity: false,
        thanas: [
          { id: 'thana_agrabad', name: 'Agrabad Commercial Area' },
          { id: 'thana_nasirabad', name: 'Nasirabad / GEC' },
          { id: 'thana_khulshi', name: 'Khulshi' },
          { id: 'thana_panchlaish', name: 'Panchlaish' },
          { id: 'thana_halishahar', name: 'Halishahar' },
          { id: 'thana_kotwali_ctg', name: 'Kotwali' }
        ]
      },
      {
        id: 'dist_cox',
        name: "Cox's Bazar",
        isDhakaCity: false,
        thanas: [
          { id: 'thana_cox_sadar', name: "Cox's Bazar Sadar" },
          { id: 'thana_teknaf', name: 'Teknaf' }
        ]
      },
      {
        id: 'dist_comilla',
        name: 'Cumilla',
        isDhakaCity: false,
        thanas: [
          { id: 'thana_comilla_sadar', name: 'Cumilla Adarsha Sadar' },
          { id: 'thana_daudkandi', name: 'Daudkandi' }
        ]
      }
    ]
  },
  {
    id: 'div_sylhet',
    name: 'Sylhet',
    districts: [
      {
        id: 'dist_sylhet',
        name: 'Sylhet',
        isDhakaCity: false,
        thanas: [
          { id: 'thana_zindabazar', name: 'Zindabazar' },
          { id: 'thana_amberkhana', name: 'Amberkhana' },
          { id: 'thana_uposhohor', name: 'Shahjalal Uposhohor' },
          { id: 'thana_beanibazar', name: 'Beanibazar' }
        ]
      },
      {
        id: 'dist_moulvibazar',
        name: 'Moulvibazar',
        isDhakaCity: false,
        thanas: [
          { id: 'thana_sreemangal', name: 'Sreemangal' },
          { id: 'thana_moulvibazar_sadar', name: 'Moulvibazar Sadar' }
        ]
      }
    ]
  },
  {
    id: 'div_rajshahi',
    name: 'Rajshahi',
    districts: [
      {
        id: 'dist_rajshahi',
        name: 'Rajshahi',
        isDhakaCity: false,
        thanas: [
          { id: 'thana_boalia', name: 'Boalia' },
          { id: 'thana_motihar', name: 'Motihar' },
          { id: 'thana_rajpara', name: 'Rajpara' }
        ]
      },
      {
        id: 'dist_bogra',
        name: 'Bogura',
        isDhakaCity: false,
        thanas: [
          { id: 'thana_bogra_sadar', name: 'Bogura Sadar' }
        ]
      }
    ]
  },
  {
    id: 'div_khulna',
    name: 'Khulna',
    districts: [
      {
        id: 'dist_khulna',
        name: 'Khulna',
        isDhakaCity: false,
        thanas: [
          { id: 'thana_sonadanga', name: 'Sonadanga' },
          { id: 'thana_khalishpur', name: 'Khalishpur' },
          { id: 'thana_daulatpur', name: 'Daulatpur' }
        ]
      }
    ]
  }
];

export const DELIVERY_RATES = {
  INSIDE_DHAKA: {
    fee: 80,
    estimatedDays: '1-2 Days (Steadfast / Pathao Express)',
    label: 'Inside Dhaka (৳80)'
  },
  OUTSIDE_DHAKA: {
    fee: 150,
    estimatedDays: '2-4 Days (Steadfast Nationwide)',
    label: 'Outside Dhaka (৳150)'
  }
};
