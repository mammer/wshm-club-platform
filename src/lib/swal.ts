import Swal from "sweetalert2";

const theme = {
  confirmButtonColor: "#CC0000",
  cancelButtonColor: "#6b7280",
  customClass: {
    popup: "rounded-2xl font-sans",
    confirmButton: "rounded-lg font-semibold text-sm px-5 py-2.5",
    cancelButton: "rounded-lg font-semibold text-sm px-5 py-2.5",
    title: "text-[#1a1a1a] font-bold",
  },
};

export const swal = {
  confirm: (title: string, text?: string, confirmText = "Confirmer") =>
    Swal.fire({
      ...theme,
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Annuler",
    }),

  confirmDelete: (name?: string) =>
    Swal.fire({
      ...theme,
      title: "Confirmer la suppression",
      html: name
        ? `<p class="text-gray-600">Supprimer <strong>${name}</strong> ?<br/><span class="text-sm text-red-500">Cette action est irréversible.</span></p>`
        : `<p class="text-gray-600">Cette action est irréversible.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#CC0000",
    }),

  success: (title: string, text?: string) =>
    Swal.fire({ ...theme, title, text, icon: "success", timer: 2200, showConfirmButton: false }),

  error: (title: string, text?: string) =>
    Swal.fire({ ...theme, title, text, icon: "error" }),

  toast: (title: string, icon: "success" | "error" | "warning" | "info" = "success") =>
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      customClass: { popup: "rounded-xl font-sans text-sm" },
    }),

  progress: async <T>(
    promise: Promise<T>,
    loadingTitle: string,
    successTitle: string
  ): Promise<T> => {
    Swal.fire({
      title: loadingTitle,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      customClass: { popup: "rounded-2xl font-sans" },
    });
    try {
      const result = await promise;
      await Swal.fire({
        ...theme,
        title: successTitle,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
      return result;
    } catch (e) {
      Swal.fire({ ...theme, title: "Erreur", text: "Une erreur est survenue.", icon: "error" });
      throw e;
    }
  },
};
