// Fonction pour envoyer un nouveau témoignage
async function submitTestimonial(event) {
  event.preventDefault();
  showLoading();
  
  // Obtenir données du formulaire
  const name = document.getElementById('testimonial-name').value;
  const content = document.getElementById('testimonial-content').value;
  
  try {
    const testimonialData = {
      name,
      content
    };
    
    await fetchApi('testimonials', 'POST', testimonialData);
    
    // Resetear el formulario
    document.getElementById('testimonial-form').reset();
    
    // Mostrar notificación modificada
    showNotification('¡Gracias por compartir su experiencia! Su testimonio será revisado y publicado en breve.');
    
    // Volver a la sección de testimonios
    showSection('testimonials-section');
  } catch (error) {
    console.error('Error al enviar testimonio:', error);
    showNotification('Error al enviar su testimonio', true);
  } finally {
    hideLoading();
  }
}
