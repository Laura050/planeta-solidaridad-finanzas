const express = require('express');
const router = express.Router();
const Testimonial = require('./models/Testimonial');

// Fonction pour réinitialiser les témoignages
async function resetTestimonials() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Supprimer tous les témoignages
    await Testimonial.deleteMany({});
    
    // Ajouter les témoignages de départ
    const initialTestimonials = [
      {name: 'Carlos Ruiz', content: 'Gracias a PSF pude financiar mis estudios de máster. El proceso fue rápido y transparente.', date: '15/12/2023', approved: true},
      {name: 'Laura Fernández', content: 'Solicité un préstamo para reformar mi casa y me lo concedieron en menos de 48 horas.', date: '23/01/2024', approved: true},
      {name: 'Miguel Ángel', content: 'Mi experiencia con PSF ha sido inmejorable. Un trato personalizado y condiciones competitivas.', date: '18/03/2024', approved: true},
      {name: 'Elena Torres', content: 'Recomiendo PSF a todos mis amigos. Gracias a su préstamo pude comprar mi primer coche.', date: '05/05/2024', approved: true},
      {name: 'Javier Moreno', content: 'Elegí PSF por su transparencia y su atención al cliente. No me he arrepentido en absoluto.', date: '12/07/2024', approved: true},
      {name: 'Patricia Sánchez', content: 'PSF me dio una solución en tiempo récord para mi negocio. Muy satisfecha.', date: '03/09/2024', approved: true},
      {name: 'Roberto Díaz', content: 'El proceso de solicitud online es muy sencillo e intuitivo. Excelente servicio.', date: '22/10/2024', approved: true},
      {name: 'Carmen Navarro', content: 'Me gusta la transparencia de PSF. La calculadora de préstamos es muy útil y precisa.', date: '17/11/2024', approved: true},
      {name: 'Francisco López', content: 'Mi gestor me ayudó a elegir el préstamo que mejor se adaptaba a mis necesidades.', date: '08/12/2024', approved: true},
      {name: 'Isabel Martín', content: 'Ya he solicitado tres préstamos con PSF y siempre ha sido una experiencia positiva.', date: '14/01/2025', approved: true},
      {name: 'David González', content: 'PSF me ha permitido financiar mis proyectos con condiciones inmejorables.', date: '27/02/2025', approved: true},
      {name: 'Sofía Ramírez', content: 'Gracias a PSF pude hacer frente a un imprevisto económico. Excelente servicio.', date: '19/03/2025', approved: true},
      {name: 'Alejandro Serrano', content: 'La mejor entidad financiera con la que he trabajado. Su compromiso se nota.', date: '01/04/2025', approved: true},
      {name: 'Maria Diaz', content: 'Bien', date: '04/04/2025', approved: true}
    ];
    
    await Testimonial.insertMany(initialTestimonials);
    console.log('Témoignages réinitialisés avec succès');
    mongoose.disconnect();
  } catch (error) {
    console.error('Erreur:', error);
    mongoose.disconnect();
  }
}

resetTestimonials();
