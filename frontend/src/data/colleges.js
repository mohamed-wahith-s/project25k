export const colleges = [
  {
    id: 1,
    name: "Anna University, CEG Campus",
    location: "Guindy, Chennai",
    course: "CSE",
    cutoff: 199.5,
    type: "Government",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "PSG College of Technology",
    location: "Peelamedu, Coimbatore",
    course: "ECE",
    cutoff: 198.0,
    type: "Govt-Aided",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=800&auto=format&fit=crop",
    seatDetails: [
      {
        course: "ECE",
        totalSeats: 120,
        availableSeats: { OC: 37, BC: 32, BCM: 4, MBC: 24, SC: 18, SCA: 4, ST: 1 },
        cutoffs: { OC: 198.5, BC: 196.0, BCM: 195.5, MBC: 193.0, SC: 185.0, SCA: 178.0, ST: 170.0 }
      },
      {
        course: "CSE",
        totalSeats: 120,
        availableSeats: { OC: 35, BC: 30, BCM: 3, MBC: 20, SC: 15, SCA: 3, ST: 1 },
        cutoffs: { OC: 199.0, BC: 197.5, BCM: 196.0, MBC: 194.5, SC: 188.0, SCA: 180.0, ST: 175.0 }
      },
      {
        course: "Mechanical Engineering",
        totalSeats: 60,
        availableSeats: { OC: 18, BC: 16, BCM: 2, MBC: 12, SC: 9, SCA: 2, ST: 1 },
        cutoffs: { OC: 195.0, BC: 192.5, BCM: 190.0, MBC: 188.0, SC: 175.0, SCA: 165.0, ST: 150.0 }
      }
    ]
  },
  {
    id: 3,
    name: "Anna University, MIT Campus",
    location: "Chromepet, Chennai",
    course: "IT",
    cutoff: 197.5,
    type: "Government",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "SSN College of Engineering",
    location: "Kalavakkam, Chennai",
    course: "AI & DS",
    cutoff: 196.0,
    type: "Private",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1523050335192-ce11558cd97d?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Thiagarajar College of Engineering",
    location: "Thiruparankundram, Madurai",
    course: "EEE",
    cutoff: 195.5,
    type: "Govt-Aided",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1498243639351-a6c9af99aef3?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "Coimbatore Institute of Technology",
    location: "Coimbatore",
    course: "Chemical Engineering",
    cutoff: 194.0,
    type: "Govt-Aided",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 7,
    name: "Government College of Technology",
    location: "Coimbatore",
    course: "Mechanical Engineering",
    cutoff: 192.5,
    type: "Government",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1574363228394-06788aef6a3d?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 8,
    name: "Sri Krishna College of Engg & Tech",
    location: "Kuniamuthur, Coimbatore",
    course: "CSE",
    cutoff: 193.5,
    type: "Private",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 9,
    name: "Kumaraguru College of Technology",
    location: "Coimbatore",
    course: "Data Science",
    cutoff: 191.0,
    type: "Private",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 10,
    name: "Government College of Engineering",
    location: "Salem",
    course: "Civil Engineering",
    cutoff: 188.0,
    type: "Government",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1525921429624-479b6a29d840?q=80&w=800&auto=format&fit=crop"
  }
];

export const courses = [
  "CSE",
  "ECE",
  "EEE",
  "IT",
  "AI & DS",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Data Science"
];
