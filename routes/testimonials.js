const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');

// Obtener todos los testimonios (incluidos los aprobados y los antiguos sin campo approved)
router.get('/', async (req, res, next) => {
  try {
    // Cette requête récupère les témoignages soit approuvés, soit sans champ 'approved'
    const testimonials = await Testimonial.find({
      $or: [
        { approved: true },
        { approved: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      testimonials
    });
  } catch (error) {
    next(error);
  }
});

// Le reste du code pour créer des témoignages reste le même
// Les nouveaux témoignages auront approved: false par défaut

// Crear un nuevo testimonio
router.post('/', async (req, res, next) => {
  try {
    const { name, content } = req.body;
    
    if (!name || !content) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y el contenido son obligatorios'
      });
    }
    
    // Obtener fecha actual formateada
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    
    // Crear y guardar el testimonio (sin aprobar por defecto)
    const testimonial = new Testimonial({
      name,
      content,
      date: dateStr,
      approved: false // Nouveaux témoignages non approuvés par défaut
    });
    
    await testimonial.save();
    
    res.status(201).json({
      success: true,
      message: 'Testimonio enviado con éxito. Será revisado por un administrador antes de ser publicado.',
      testimonial
    });
  } catch (error) {
    next(error);
  }
});

// Obtener todos los testimonios para administrador (aprobados y pendientes)
router.get('/admin', async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      testimonials
    });
  } catch (error) {
    next(error);
  }
});

// Aprobar un testimonio
router.put('/admin/:id/approve', async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonio no encontrado'
      });
    }
    
    testimonial.approved = true;
    await testimonial.save();
    
    res.json({
      success: true,
      message: 'Testimonio aprobado con éxito'
    });
  } catch (error) {
    next(error);
  }
});

// Rechazar un testimonio
router.delete('/admin/:id', async (req, res, next) => {
  try {
    const result = await Testimonial.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Testimonio no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Testimonio rechazado y eliminado con éxito'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
