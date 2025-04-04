const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');

// Obtener todos los testimonios
router.get('/', async (req, res, next) => {
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
    
    // Crear y guardar el testimonio
    const testimonial = new Testimonial({
      name,
      content,
      date: dateStr
    });
    
    await testimonial.save();
    
    res.status(201).json({
      success: true,
      message: 'Testimonio creado con éxito',
      testimonial
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
