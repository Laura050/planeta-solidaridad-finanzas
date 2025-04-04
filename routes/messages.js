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
    const { applicationId, content } = req.body;
    
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
    
    // Procesamiento del archivo adjunto si existe
    let attachmentUrl = null;
    if (req.files && req.files.attachment) {
      const file = req.files.attachment;
      attachmentUrl = `/uploads/${file.name}`;
      await file.mv(`.${attachmentUrl}`);
    }
    
    // Crear y guardar el mensaje
    const message = new Message({
      applicationId,
      content,
      from: 'user',
      attachmentUrl,
      time: timeStr
    });
    
    await message.save();
    
    res.status(201).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: message
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
