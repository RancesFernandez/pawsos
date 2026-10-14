export const starterPet = {
  id: 'luna-demo',
  name: 'Luna',
  species: 'Perro',
  speciesOther: '',
  animalType: 'Mascota doméstica',
  animalTypeOther: '',
  breed: 'Mestiza',
  birthDate: '2022-04-18',
  sex: 'Hembra',
  weight: '12.4',
  color: 'Canela y blanco',
  microchip: '',
  photo: '',
  temperament: 'Curiosa, mimosa y un poquito glotona',
  bio: 'Mi lugar favorito es el sillón y nunca digo que no a un paseo.',
  ownerName: 'Alex',
  phone: '+598 99 123 456',
  whatsapp: '+59899123456',
  email: '',
  city: 'Montevideo, Uruguay',
  vetName: 'Clínica Vet del Parque',
  vetPhone: '',
  allergies: 'Ninguna conocida',
  conditions: '',
  medication: '',
  food: 'Ración de adulto',
  foodAmount: '180 g',
  foodSchedule: '08:00 y 19:00',
  walkNotes: 'Paseos tranquilos. Usar arnés.',
  fears: 'Se asusta con los fuegos artificiales',
  emergencyNotes: 'Si está nerviosa, hablarle suave y darle espacio.',
  updatedAt: new Date().toISOString()
};

export const starterEntries = [
  { id: 'e1', type: 'walk', title: 'Paseo de la mañana', note: '25 minutos por la plaza 🌿', date: new Date(Date.now() - 86400000).toISOString() },
  { id: 'e2', type: 'health', title: 'Chequeo de bienestar', note: 'Buen ánimo y apetito normal.', date: new Date(Date.now() - 2 * 86400000).toISOString() }
];