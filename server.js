require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Importar rutas
const applicationRoutes = require('./routes/applications');
const messageRoutes = require('./routes/messages');
const testimonialRoutes = require('./routes/testimonials');
const adminRoutes = require('./routes/admin');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Asegurarse de que el directorio uploads exista
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Directorio de uploads creado:', uploadsDir);
}

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Middleware global para upload
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
  .then(async () => {
  console.log('Conectado a MongoDB');
  
  // Inicializar testimonios si no existen
  try {
    const Testimonial = require('./models/Testimonial');
    const count = await Testimonial.countDocuments();
    
    if (count === 0) {
      console.log('Inicializando testimonios...');
      
      const initialTestimonials = [
        {name: 'Carlos Ruiz', content: 'Gracias a PSF pude financiar mis estudios de máster. El proceso fue rápido y transparente.', date: '15/12/2023'},
        {name: 'Laura Fernández', content: 'Solicité un préstamo para reformar mi casa y me lo concedieron en menos de 48 horas.', date: '23/01/2024'},
        {name: 'Miguel Ángel', content: 'Mi experiencia con PSF ha sido inmejorable. Un trato personalizado y condiciones competitivas.', date: '18/03/2024'},
        {name: 'Elena Torres', content: 'Recomiendo PSF a todos mis amigos. Gracias a su préstamo pude comprar mi primer coche.', date: '05/05/2024'},
        {name: 'Javier Moreno', content: 'Elegí PSF por su transparencia y su atención al cliente. No me he arrepentido en absoluto.', date: '12/07/2024'},
        {name: 'Patricia Sánchez', content: 'PSF me dio una solución en tiempo récord para mi negocio. Muy satisfecha.', date: '03/09/2024'},
        {name: 'Roberto Díaz', content: 'El proceso de solicitud online es muy sencillo e intuitivo. Excelente servicio.', date: '22/10/2024'},
        {name: 'Carmen Navarro', content: 'Me gusta la transparencia de PSF. La calculadora de préstamos es muy útil y precisa.', date: '17/11/2024'},
        {name: 'Francisco López', content: 'Mi gestor me ayudó a elegir el préstamo que mejor se adaptaba a mis necesidades.', date: '08/12/2024'},
        {name: 'Isabel Martín', content: 'Ya he solicitado tres préstamos con PSF y siempre ha sido una experiencia positiva.', date: '14/01/2025'},
        {name: 'David González', content: 'PSF me ha permitido financiar mis proyectos con condiciones inmejorables.', date: '27/02/2025'},
        {name: 'Sofía Ramírez', content: 'Gracias a PSF pude hacer frente a un imprevisto económico. Excelente servicio.', date: '19/03/2025'},
        {name: 'Alejandro Serrano', content: 'La mejor entidad financiera con la que he trabajado. Su compromiso se nota.', date: '01/04/2025'}
      ];
      
      await Testimonial.insertMany(initialTestimonials);
      console.log(`${initialTestimonials.length} testimonios añadidos con éxito.`);
    }
  } catch (error) {
    console.error('Error al inicializar testimonios:', error);
  }
})
.catch(err => console.error('Error al conectar con MongoDB:', err));

// Rutas API
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/admin', adminRoutes);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Asegurarse de que los archivos uploads son accesibles
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir la aplicación React en producción
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
