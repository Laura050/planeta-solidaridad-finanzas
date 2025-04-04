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

// Verificar si hay nuevos mensajes
router.get('/:applicationId/new', async (req, res, next) => {
  try {
    // Obtener el timestamp del último chequeo del parámetro de consulta
    const lastCheck = req.query.lastCheck || 0;
    
    // Buscar mensajes más recientes que el último chequeo
    const newMessages = await Message.countDocuments({
      applicationId: req.params.applicationId,
      createdAt: { $gt: new Date(parseInt(lastCheck)) }
    });
    
    res.json({
      success: true,
      hasNewMessages: newMessages > 0,
      count: newMessages
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
        // Guardar el nombre de archivo generado por multer, no el nombre original
        attachmentUrl = req.file.filename;
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
