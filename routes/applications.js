const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Application = require('../models/Application');
const Message = require('../models/Message');

// Crear una nueva solicitud de préstamo
router.post('/', async (req, res, next) => {
  try {
    req.upload.single('id-document')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un archivo de documento de identidad'
        });
      }

      // Obtener la fecha actual formateada
      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      const timeStr = `${dateStr} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Generar código de seguimiento
      const trackingCode = 'PSF-' + Math.floor(10000 + Math.random() * 90000);

      // Crear nueva aplicación
      const newApplication = new Application({
        id: trackingCode,
        type: req.body['loan-type'],
        name: req.body.nombre,
        email: req.body.email,
        phone: req.body.telefono,
        city: req.body.ciudad,
        address: req.body.direccion,
        dni: req.body.dni,
        documentUrl: req.file.path,
        amount: req.body.monto,
        term: req.body.plazo,
        payment: req.body.payment,
        income: req.body.ingresos,
        purpose: req.body.proposito,
        status: 'pending',
        date: dateStr
      });

      await newApplication.save();

      // Crear mensaje automático de bienvenida
      const welcomeMessage = new Message({
        applicationId: trackingCode,
        content: `Hola ${req.body.nombre}, hemos recibido su solicitud de préstamo ${req.body['loan-type']}. Actualmente está en proceso de estudio.`,
        from: 'admin',
        time: timeStr
      });

      await welcomeMessage.save();

      res.status(201).json({
        success: true,
        message: 'Solicitud creada con éxito',
        trackingCode
      });
    });
  } catch (error) {
    next(error);
  }
});

// Obtener una solicitud por código de seguimiento
router.get('/:trackingCode', async (req, res, next) => {
  try {
    const application = await Application.findOne({ id: req.params.trackingCode });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
