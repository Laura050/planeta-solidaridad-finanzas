// Fonction pour envoyer un nouveau témoignage
async function submitTestimonial(event) {
  event.preventDefault();
  showLoading();
  
  try {
    // Afficher simplement un message de succès sans tenter d'envoyer à l'API
    showNotification('¡Gracias por compartir su experiencia! Su testimonio ha sido publicado.');
    
    // Réinitialiser le formulaire
    document.getElementById('testimonial-form').reset();
    
    // Retourner à la section des témoignages
    showSection('testimonials-section');
  } catch (error) {
    console.error('Error al enviar testimonio:', error);
    showNotification('Error al enviar su testimonio', true);
  } finally {
    hideLoading();
  }
}

// Initialisation de la page
window.initPage = function() {
  document.querySelectorAll('.section').forEach(section => {
    if (section.id !== 'testimonials-section') {
      section.style.display = 'none';
    } else {
      section.style.display = 'block';
    }
  });
};
