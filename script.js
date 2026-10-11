// Panel de Gestion de Usuarios
// Archivo JavaScript externo con toda la logica del panel

// 1. Array principal donde se almacenan los usuarios
let usuarios = [];

// Variable para controlar si se esta editando un usuario existente (guarda el id o null)
let editandoId = null;

// 2. Elementos del DOM
const formulario = document.getElementById("formulario-usuario");
const inputId = document.getElementById("id");
const inputNombre = document.getElementById("nombre");
const inputCorreo = document.getElementById("correo");
const inputCiudad = document.getElementById("ciudad");
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");
const tituloFormulario = document.getElementById("titulo-formulario");

const inputBuscar = document.getElementById("buscar");
const tablaCuerpo = document.getElementById("tabla-usuarios");
const mensajeEstado = document.getElementById("mensaje-estado");

// 3. Funcion para mostrar mensajes de estado (cargando, error, exito)
// Usa condicional switch para seleccionar la clase segun el tipo de mensaje
const mostrarMensaje = (tipo, texto) => {
    mensajeEstado.textContent = texto;
    mensajeEstado.className = "mensaje"; // Limpiar clases previas

    switch (tipo) {
        case "cargando":
            mensajeEstado.classList.add("cargando");
            break;
        case "error":
            mensajeEstado.classList.add("error");
            break;
        case "exito":
            mensajeEstado.classList.add("exito");
            break;
        default:
            mensajeEstado.style.display = "none";
            return;
    }

    // Si es un mensaje de exito o error, ocultarlo automaticamente despues de 4 segundos
    if (tipo !== "cargando") {
        setTimeout(() => {
            mensajeEstado.style.display = "none";
            mensajeEstado.className = "mensaje";
            mensajeEstado.textContent = "";
        }, 4000);
    }
};

// 4. Funcion para renderizar (dibujar) la tabla en el DOM
// Recibe una lista de usuarios (puede ser la lista completa o una filtrada)
const renderizarTabla = (lista) => {
    // Si la lista esta vacia, se muestra un mensaje en la tabla
    if (lista.length === 0) {
        tablaCuerpo.innerHTML = `<tr><td colspan="5" class="sin-datos">No se encontraron usuarios.</td></tr>`;
        return;
    }

    // Construccion de las filas utilizando template strings y destructuring
    let filasHtml = "";
    lista.forEach((usuario) => {
        const { id, nombre, correo, ciudad } = usuario;
        filasHtml += `
            <tr>
                <td>${id}</td>
                <td>${nombre}</td>
                <td>${correo}</td>
                <td>${ciudad}</td>
                <td>
                    <button class="btn-editar" data-id="${id}">Editar</button>
                    <button class="btn-eliminar" data-id="${id}">Eliminar</button>
                </td>
            </tr>
        `;
    });

    tablaCuerpo.innerHTML = filasHtml;
};

// 5. Funcion para registrar cambios en consola y redibujar
const actualizarEstadoYConsola = () => {
    console.log("Array completo de usuarios actualizado:", usuarios);
    renderizarTabla(usuarios);
};

// 6. Carga inicial de datos desde la API usando async/await, fetch y try/catch
const cargarUsuariosDesdeApi = async () => {
    const url = "https://jsonplaceholder.typicode.com/users";
    mostrarMensaje("cargando", "Cargando usuarios desde la API...");

    try {
        const respuesta = await fetch(url);

        // Validar si la respuesta HTTP es exitosa
        if (!respuesta.ok) {
            throw new Error(`Error en la peticion HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        // Transformar los datos de la API al formato requerido usando map y destructuring
        usuarios = datos.map((item) => {
            const { id, name, email, address } = item;
            const { city } = address;
            return {
                id: Number(id),
                nombre: name,
                correo: email,
                ciudad: city
            };
        });

        // Bucle for para contar y verificar el total de usuarios cargados
        let totalCargados = 0;
        for (let i = 0; i < usuarios.length; i++) {
            totalCargados++;
        }
        console.log(`Total de usuarios cargados inicialmente: ${totalCargados}`);

        mostrarMensaje("exito", "Usuarios cargados con exito.");
        actualizarEstadoYConsola();
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        mostrarMensaje("error", "No se pudieron cargar los datos de la API. Verifique su conexion.");
    }
};

// 7. Busqueda en vivo utilizando el metodo filter()
inputBuscar.addEventListener("input", () => {
    const termino = inputBuscar.value.trim().toLowerCase();

    // Filtra los usuarios por nombre sin modificar el array original
    const filtrados = usuarios.filter((usuario) => {
        return usuario.nombre.toLowerCase().includes(termino);
    });

    renderizarTabla(filtrados);
});

// 8. Restablecer el formulario a su estado original (modo agregar)
const restablecerFormulario = () => {
    formulario.reset();
    editandoId = null;
    inputId.disabled = false;
    btnGuardar.textContent = "Agregar";
    tituloFormulario.textContent = "Registrar Usuario";
    btnCancelar.style.display = "none";
};

// Boton para cancelar la edicion si el usuario no desea guardar
btnCancelar.addEventListener("click", () => {
    restablecerFormulario();
    mostrarMensaje("exito", "Edicion cancelada.");
});

// 9. Manejo del envio del formulario (Agregar o Modificar)
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const idValor = inputId.value.trim();
    const nombreValor = inputNombre.value.trim();
    const correoValor = inputCorreo.value.trim();
    const ciudadValor = inputCiudad.value.trim();

    // Validacion 1: Bucle for para verificar que ningun campo este vacio
    const campos = [
        { nombre: "ID", valor: idValor },
        { nombre: "Nombre", valor: nombreValor },
        { nombre: "Correo", valor: correoValor },
        { nombre: "Ciudad", valor: ciudadValor }
    ];

    for (let i = 0; i < campos.length; i++) {
        if (campos[i].valor === "") {
            mostrarMensaje("error", `El campo ${campos[i].nombre} no puede estar vacio.`);
            return;
        }
    }

    // Validacion 2: Comprobar que el correo contenga el caracter @
    if (!correoValor.includes("@")) {
        mostrarMensaje("error", "El correo electronico debe contener un '@'.");
        return;
    }

    const idNumero = Number(idValor);

    // Validacion 3: Comprobar que el ID sea un numero valido mayor a cero
    if (isNaN(idNumero) || idNumero <= 0) {
        mostrarMensaje("error", "El ID debe ser un numero valido y mayor que 0.");
        return;
    }

    // Caso A: Modo Modificar
    if (editandoId !== null) {
        // Buscar el indice del usuario a modificar por su ID
        const indice = usuarios.findIndex((u) => u.id === editandoId);

        if (indice !== -1) {
            usuarios[indice] = {
                id: editandoId,
                nombre: nombreValor,
                correo: correoValor,
                ciudad: ciudadValor
            };

            mostrarMensaje("exito", `Usuario con ID ${editandoId} modificado exitosamente.`);
            actualizarEstadoYConsola();
            restablecerFormulario();
        } else {
            mostrarMensaje("error", "No se encontro el usuario a modificar.");
        }
        return;
    }

    // Caso B: Modo Agregar
    // Validacion 4: Comprobar que el ID NO exista ya en el array de usuarios
    const idExiste = usuarios.some((u) => u.id === idNumero);
    if (idExiste) {
        mostrarMensaje("error", `Ya existe un usuario con el id ${idNumero}.`);
        return;
    }

    // Crear el nuevo objeto usuario
    const nuevoUsuario = {
        id: idNumero,
        nombre: nombreValor,
        correo: correoValor,
        ciudad: ciudadValor
    };

    // Agregar al array principal
    usuarios.push(nuevoUsuario);

    mostrarMensaje("exito", `Usuario con ID ${idNumero} agregado exitosamente.`);
    actualizarEstadoYConsola();
    restablecerFormulario();
});

// 10. Delegacion de eventos sobre el tbody para los botones Editar y Eliminar
tablaCuerpo.addEventListener("click", (evento) => {
    const elemento = evento.target;

    // Accion: Editar usuario
    if (elemento.classList.contains("btn-editar")) {
        const idSeleccionado = Number(elemento.getAttribute("data-id"));
        const usuarioAEditar = usuarios.find((u) => u.id === idSeleccionado);

        if (usuarioAEditar) {
            // Destructuring de los datos del usuario para cargarlos en los campos
            const { id, nombre, correo, ciudad } = usuarioAEditar;
            inputId.value = id;
            inputNombre.value = nombre;
            inputCorreo.value = correo;
            inputCiudad.value = ciudad;

            // Bloquear el ID para no permitir su cambio durante la modificacion
            inputId.disabled = true;
            editandoId = id;

            // Cambiar texto del boton y encabezado
            btnGuardar.textContent = "Guardar cambios";
            tituloFormulario.textContent = `Modificar Usuario (ID: ${id})`;
            btnCancelar.style.display = "inline-block";

            // Scroll hacia el formulario
            formulario.scrollIntoView({ behavior: "smooth" });
        }
    }

    // Accion: Eliminar usuario
    if (elemento.classList.contains("btn-eliminar")) {
        const idAEliminar = Number(elemento.getAttribute("data-id"));

        // Confirmacion previa a la eliminacion
        const confirmacion = confirm(`Desea eliminar al usuario con ID ${idAEliminar}?`);
        if (confirmacion) {
            // Eliminar del array principal utilizando filter()
            usuarios = usuarios.filter((u) => u.id !== idAEliminar);

            // Si se estaba editando justamente el usuario que se elimino, cancelar edicion
            if (editandoId === idAEliminar) {
                restablecerFormulario();
            }

            mostrarMensaje("exito", `Usuario con ID ${idAEliminar} eliminado correctamente.`);
            actualizarEstadoYConsola();
        }
    }
});

// 11. Ejecutar la carga inicial al cargar la pagina
cargarUsuariosDesdeApi();
