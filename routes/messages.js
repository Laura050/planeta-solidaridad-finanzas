const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Application = require('../models/Application');

// Obtener mensajes de una aplicación
router.get('/:applicationId', async (req, res, next) => {
  try {
    const messages = await Message.find({ 
      applicationId: req.params.applicationId 
    }).sort({ createdAt: 1 });
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    next(error);
  }
});

// Enviar mensaje como usuario
router.post('/', async (req, res, next) => {
  try {
    req.upload.single('attachment')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      const { applicationId, content, from } = req.body;
      
      // Verificar que la aplicación existe
      const application = await Application.findOne({ id: applicationId });
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }
      
      // Obtener fecha actual formateada
      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      const timeStr = `${dateStr} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Procesar archivo adjunto si existe
      let attachmentUrl = null;
      if (req.file) {
        attachmentUrl = req.file.originalname;
      }
      
      // Crear y guardar el mensaje
      const message = new Message({
        applicationId,
        content,
        from,
        attachmentUrl,
        time: timeStr
      });
      
      await message.save();
      
      res.status(201).json({
        success: true,
        message: 'Mensaje enviado correctamente',
        data: message
      });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
