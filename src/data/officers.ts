export interface Officer {
  id: string
  name: string
  departmentId: string
}

export const officers: Officer[] = [
  // Field Operations Division (fod)
  { id: 'rohit-malhotra', name: 'Rohit Malhotra', departmentId: 'fod' },
  { id: 'ananya-krishnan', name: 'Ananya Krishnan', departmentId: 'fod' },
  { id: 'vikram-desai', name: 'Vikram Desai', departmentId: 'fod' },
  { id: 'sunita-rao', name: 'Sunita Rao', departmentId: 'fod' },
  { id: 'manoj-tiwari', name: 'Manoj Tiwari', departmentId: 'fod' },
  // Survey Design & Methodology (sdm)
  { id: 'deepika-menon', name: 'Deepika Menon', departmentId: 'sdm' },
  { id: 'aakash-chatterjee', name: 'Aakash Chatterjee', departmentId: 'sdm' },
  { id: 'nandini-pillai', name: 'Nandini Pillai', departmentId: 'sdm' },
  { id: 'suresh-kulkarni', name: 'Suresh Kulkarni', departmentId: 'sdm' },
  { id: 'ritu-bansal', name: 'Ritu Bansal', departmentId: 'sdm' },
  // Data Processing & Analytics (dpa)
  { id: 'karthik-iyengar', name: 'Karthik Iyengar', departmentId: 'dpa' },
  { id: 'shreya-agarwal', name: 'Shreya Agarwal', departmentId: 'dpa' },
  { id: 'vivek-handa', name: 'Vivek Handa', departmentId: 'dpa' },
  { id: 'pooja-ramachandran', name: 'Pooja Ramachandran', departmentId: 'dpa' },
  { id: 'naveen-choudhary', name: 'Naveen Choudhary', departmentId: 'dpa' },
  // Regional Training Centre - South (rtcs)
  { id: 'lakshmi-venkataraman', name: 'Lakshmi Venkataraman', departmentId: 'rtcs' },
  { id: 'arjun-mehta', name: 'Arjun Mehta', departmentId: 'rtcs' },
  { id: 'divya-shenoy', name: 'Divya Shenoy', departmentId: 'rtcs' },
  { id: 'rahul-bose', name: 'Rahul Bose', departmentId: 'rtcs' },
  { id: 'swathi-reddy', name: 'Swathi Reddy', departmentId: 'rtcs' },
  // Digital Governance Cell (dgc)
  { id: 'neha-kapoor', name: 'Neha Kapoor', departmentId: 'dgc' },
  { id: 'siddharth-rane', name: 'Siddharth Rane', departmentId: 'dgc' },
  { id: 'meera-balakrishnan', name: 'Meera Balakrishnan', departmentId: 'dgc' },
  { id: 'gopal-krishnan', name: 'Gopal Krishnan', departmentId: 'dgc' },
  { id: 'isha-thakur', name: 'Isha Thakur', departmentId: 'dgc' },
  // Quality Assurance Wing (qaw)
  { id: 'amitabh-saxena', name: 'Amitabh Saxena', departmentId: 'qaw' },
  { id: 'ritika-sinha', name: 'Ritika Sinha', departmentId: 'qaw' },
  { id: 'faisal-ansari', name: 'Faisal Ansari', departmentId: 'qaw' },
  { id: 'bhavna-joshi', name: 'Bhavna Joshi', departmentId: 'qaw' },
  { id: 'tarun-gokhale', name: 'Tarun Gokhale', departmentId: 'qaw' },
]

export const FEATURED_OFFICER_ID = 'rohit-malhotra'
