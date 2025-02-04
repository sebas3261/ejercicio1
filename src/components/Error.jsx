import React from "react";

export default function Error({ type }) {
  let error = "";

  switch (type) {
    case 1:
      error = "La contraseña debe tener más de 6 caracteres";
      break;
    case 2:
      error = "Las contraseñas deben ser iguales";
      break;
    case 3:
        error = "La contraseña no puede contener espacios."
        break;
    case 4:
        error = "El correo es inválido. Recuerde que no puede tener espacios"
        break;
    case 5:
        error = "La contraseña no puede estar vacia"
        break;
    case 6:
        error = "Correo en uso"
        break;
    case 7:
        error = "LLene todos los campos"
        break;
    case 8:
        error = "La fecha de nacimiento debe estar en el rango de 5 a 100 años.";
        break;
    case 9:
        error = "El numero debe ser de 10 caracteres";
        break;
    default:
      error = "test";
  }

  return error ? <p className="signup-error">{error}</p> : null;
}
