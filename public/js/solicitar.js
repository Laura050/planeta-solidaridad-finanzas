// Función para mostrar el formulario de préstamo
function showLoanForm(loanType) {
  document.getElementById('loan-type-title').textContent = loanType;
  document.getElementById('loan-type').value = loanType;
  showSection('loan-form-section');
}

// Función para calcular la mensualidad
function calcularMensualidad() {
  const monto = parseFloat(document.getElementById('monto').value) || 0;
  const plazo = parseInt(document.getElementById('plazo').value) || 0;
  
  if (monto > 0 && plazo > 0) {
    // Tasa de interés anual del 3,5%
    const tasaMensual = 0.035 / 12;
    
    // Fórmula de amortización
    const mensualidad = monto * tasaMensual * Math.pow(1 + tasaMensual, plazo) / (Math.pow(1 + tasaMensual, plazo) - 1);
    
    document.getElementById('mensualidad').textContent = '€ ' + mensualidad.toFixed(2);
    return mensualidad.toFixed(2);
  } else {
    document.getElementById('mensualidad').textContent = '€ 0.00';
    return 0;
  }
}

// Función para enviar la solicitud de préstamo
async function submitLoanApplication(event) {
  event.preventDefault();
  showLoading();
  
  try {
    // Obtener los datos del formulario
    const formData = new FormData(document.getElementById('loan-application-form'));
    
    // Calcular la mensualidad
    const payment = calcularMensualidad();
    formData.append('payment', payment);
    
    // Enviar los datos al servidor
    const response = await fetchApi('applications', 'POST', formData, true);
    
    // Mostrar código de seguimiento
    document.getElementById('tracking-code').textContent = response.trackingCode;
    
    // Mostrar mensaje de éxito
    showSection('success-section');
    
    // Resetear el formulario
    document.getElementById('loan-application-form').reset();
    
  } catch (error) {
    console.error('Error al enviar solicitud:', error);
    // El manejo de errores ya está en fetchApi
  }
}

// Inicialización específica para esta página
window.initPage = function() {
  // Asegurarse de que los elementos de sección estén correctamente configurados
  // Esto es necesario para las páginas específicas que cargan directamente
  document.querySelectorAll('.section').forEach(section => {
    if (section.id !== 'loan-types-section') {
      section.style.display = 'none';
    } else {
      section.style.display = 'block';
    }
  });
};
