const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Message = require('../models/Message');

// Obtener todas las aplicaciones (solo administrador)
router.get('/applications', async (req, res, next) => {
  try {
    // Verificación de código admin simplificada - en producción, usar una autenticación adecuada
    const applications = await Application.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      applications
    });
  } catch (error) {
    next(error);
  }
});

// Aprobar una solicitud
router.put('/applications/:id/approve', async (req, res, next) => {
  try {
    const application = await Application.findOne({ id: req.params.id });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }
    
    application.status = 'approved';
    await application.save();
    
    // Añadir mensaje automático
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const timeStr = `${dateStr} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const message = new Message({
      applicationId: application.id,
      content: '¡Felicidades! Su solicitud de préstamo ha sido aprobada. Pronto nos pondremos en contacto con usted para continuar con el proceso.',
      from: 'admin',
      time: timeStr
    });
    
    await message.save();
    
    res.json({
      success: true,
      message: 'Solicitud aprobada con éxito'
    });
  } catch (error) {
    next(error);
  }
});

// Rechazar una solicitud
router.put('/applications/:id/reject', async (req, res, next) => {
  try {
    const application = await Application.findOne({ id: req.params.id });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }
    
    application.status = 'rejected';
    await application.save();
    
    // Añadir mensaje automático
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const timeStr = `${dateStr} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const message = new Message({
      applicationId: application.id,
      content: 'Lo sentimos, su solicitud de préstamo ha sido rechazada. Si desea más información, por favor contacte con nosotros a través de este chat.',
      from: 'admin',
      time: timeStr
    });
    
    await message.save();
    
    res.json({
      success: true,
      message: 'Solicitud rechazada con éxito'
    });
  } catch (error) {
    next(error);
  }
});

// Obtener mensajes de una aplicación (vista de administrador)
router.get('/messages/:applicationId', async (req, res, next) => {
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

// Enviar mensaje como administrador
router.post('/messages', async (req, res, next) => {
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
      from: 'admin',
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
