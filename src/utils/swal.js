import Swal from 'sweetalert2'

// Toast para notificaciones rápidas (éxito, info, advertencia)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2800,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
})

// Modal base con el color del sistema
const Modal = Swal.mixin({
  confirmButtonColor: '#059669',   // emerald-600
  cancelButtonColor: '#64748b',    // slate-500
  reverseButtons: true,
  customClass: {
    confirmButton: 'swal-btn-confirm',
    cancelButton: 'swal-btn-cancel',
  },
})

export const sdgAlert = {
  /** Toast de éxito — se cierra solo */
  success: (title, text) =>
    Toast.fire({ icon: 'success', title, text }),

  /** Toast de error — se cierra solo */
  errorToast: (title, text) =>
    Toast.fire({ icon: 'error', title, text }),

  /** Modal de error con botón "Entendido" */
  error: (title, text) =>
    Modal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Entendido',
    }),

  /** Modal de advertencia */
  warning: (title, text) =>
    Modal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Aceptar',
    }),

  /** Modal de confirmación — devuelve true si el usuario confirma */
  confirm: async (title, text, confirmText = 'Confirmar') => {
    const result = await Modal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
    })
    return result.isConfirmed
  },
}
