import { searchLocation } from './src/services/geocodingService.js';

searchLocation('Miami').then(console.log).catch(console.error);
