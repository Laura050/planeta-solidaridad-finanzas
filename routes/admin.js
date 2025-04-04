// Enviar mensaje como administrador
router.post('/messages', async (req, res, next) => {
  try {
    req.upload.single('attachment')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

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
      
      // Procesar archivo adjunto si existe
      let attachmentUrl = null;
      if (req.file) {
        attachmentUrl = req.file.originalname;
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
    });
  } catch (error) {
    next(error);
  }
});
