require('dotenv').config();

console.log('=== Variables de Base de Datos ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NO DEFINIDA');

console.log('\n=== Variables de Cloudinary ===');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'NO DEFINIDA');

console.log('\n=== Variables de IA ===');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Encontrada (longitud: ' + process.env.GEMINI_API_KEY.length + ')' : 'NO DEFINIDA');
