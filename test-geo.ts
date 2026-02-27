import { searchLocation } from './src/services/geocodingService';

searchLocation('Miami').then(console.log).catch(console.error);
