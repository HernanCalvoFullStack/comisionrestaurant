let cliente = {
  mesa: "",
  hora: "",
  pedido: []
};

const categorias = {
  1: "Comida",
  2: "Bebidas",
  3: "Postres"
}

const botonGuardaCliente = document.querySelector("#guardar-cliente");
botonGuardaCliente.addEventListener("click", guardarCliente);


function guardarCliente() {
  const mesa = document.querySelector("#mesa").value;
  const hora = document.querySelector("#hora").value;
  
  // Revisar si hay campos vacíos
  const camposVacios = [ mesa, hora ];
  
  if(camposVacios.includes("")) {
    // Verificar si ya hay una alerta
    const existeAlerta = document.querySelector(".invalid-feedback"); 
    
    if(!existeAlerta) {
      const alerta = document.createElement("DIV");
      alerta.classList.add("invalid-feedback", "d-block", "text-center");
      alerta.textContent = "Todos los campos son obligatorios";
      document.querySelector(".modal-body form").appendChild(alerta);

      setTimeout(() => {
        alerta.remove();
      }, 2000);
    }
    return; 
  }

  // Asignar datos del formulario a cliente
  cliente = { ...cliente, mesa, hora };
  
  // Ocultar Modal
  const modalFormulario = document.querySelector("#formulario");
  const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
  modalBootstrap.hide();

  // Mostrar las secciones
  mostrarSecciones();  

  // Obtener platos de la API de JSON-Server
  obtenerPlatos();
}

function mostrarSecciones() {
  const seccionesOcultas = document.querySelectorAll(".d-none");
  seccionesOcultas.forEach(seccion => seccion.classList.remove("d-none"))
}

function obtenerPlatos() {
  const url = "http://localhost:4000/platos";

  fetch(url)
    .then( respuesta => respuesta.json())
    .then( resultado => mostrarPlatos(resultado))
    .catch( error => console.log(error))
}

function mostrarPlatos(platos) {
  const contenido = document.querySelector("#platos .contenido");
  
  platos.forEach( plato => {
    const row = document.createElement("DIV");
    row.classList.add("row", "py-3", "border-top");

    const nombre = document.createElement("DIV");
    nombre.classList.add("col-md-4");
    nombre.textContent = plato.nombre;

    const precio = document.createElement("DIV");
    precio.classList.add("col-md-3", "fw-bold");
    precio.textContent = `$ ${plato.precio}`;   
    
    const categoria = document.createElement("DIV");
    categoria.classList.add("col-md-3");
    categoria.textContent = categorias[plato.categoria];

    const inputCantidad = document.createElement("INPUT");
    inputCantidad.type = "number";
    inputCantidad.min = 0;
    inputCantidad.value = 0;
    inputCantidad.id = `producto-${plato.id}`;
    inputCantidad.classList.add("form-control");

    // Función que detecta la cantidad y el plato que se está agregando
    inputCantidad.onchange = () => {
      const cantidad = Number(inputCantidad.value);
      agregarPlato({...plato, cantidad});
    }

    const agregar = document.createElement("DIV");
    agregar.classList.add("col-md-2");
    agregar.appendChild(inputCantidad)

    row.appendChild(nombre);
    row.appendChild(precio);
    row.appendChild(categoria);
    row.appendChild(agregar);
    
    contenido.appendChild(row);
  })
}

function agregarPlato(producto) {
  // Extraer el pedido actual
  let { pedido } = cliente;

  // Revisar que la cantidad sea mayor a 0
  if(producto.cantidad > 0) {

    // Comprueba si el elemeto ya existe en el array
    if( pedido.some( articulo => articulo.id === producto.id )) {
      // El artículo ya existe. Actualizar la cantidad
      const pedidoActualizado = pedido.map( articulo => {
        if( articulo.id === producto.id ) {
          articulo.cantidad = producto.cantidad;
        }
        return articulo;
      });
      // Se asigna el nuevo array a cliente.pedido
      cliente.pedido = [...pedidoActualizado]
    } else {
      // El articulo no existe, lo agregamos al array de pedido
      cliente.pedido = [...pedido, producto]
    }
  } else {
    // Eliminar elementos cuando la cantidad es 0
    const resultado = pedido.filter( articulo => articulo.id !== producto.id);
    cliente.pedido = [...resultado];
  }

  // Limpiar el código HTML previo
  limpiarHTML();

  if(cliente.pedido.length) {
    // Mostrar el Resumen
    actualizarResumen();
  } else {
    mensajePedidoVacio();
  }

}

function actualizarResumen() {
  const contenido = document.querySelector("#resumen .contenido");

  const resumen = document.createElement("DIV");
  resumen.classList.add("col-md-6", "card", "py-2", "px-3", "shadow");

  // Información de la mesa
  const mesa = document.createElement("P");
  mesa.textContent = "Mesa: ";
  mesa.classList.add("fw-bold");

  const mesaSpan = document.createElement("SPAN");
  mesaSpan.textContent = cliente.mesa;
  mesaSpan.classList.add("fw-normal");

  // Información de la hora
  const hora = document.createElement("P");
  hora.textContent = "Hora: ";
  hora.classList.add("fw-bold");

  const horaSpan = document.createElement("SPAN");
  horaSpan.textContent = cliente.hora;
  horaSpan.classList.add("fw-normal");

  // Agregar a los elementos padres
  mesa.appendChild(mesaSpan);
  hora.appendChild(horaSpan);

  // Título de la sección
  const heading = document.createElement("H3");
  heading.textContent = "Platos Consumidos";
  heading.classList.add("my-4", "text-center");

  // Iterar sobre el array de pedido
  const grupo = document.createElement("UL");
  grupo.classList.add("list-group");

  const { pedido } = cliente;
  pedido.forEach( articulo => {
    const { nombre, cantidad, precio, id } = articulo;

    const lista = document.createElement("LI");
    lista.classList.add("list-group-item");

    const nombreElemento = document.createElement("H4");
    nombreElemento.classList.add("my-4");
    nombreElemento.textContent = nombre;

    // Cantidad del Artículo
    const cantidadElemento = document.createElement("P");
    cantidadElemento.classList.add("fw-bold");
    cantidadElemento.textContent = "Cantidad: ";

    const cantidadValor = document.createElement("SPAN");
    cantidadValor.classList.add("fw-normal");
    cantidadValor.textContent = cantidad;

    // Precio del artículo
    const precioElemento = document.createElement("P");
    precioElemento.classList.add("fw-bold");
    precioElemento.textContent = "Precio: ";

    const precioValor = document.createElement("SPAN");
    precioValor.classList.add("fw-normal");
    precioValor.textContent = `$ ${precio}`;

    // Subtotal del artículo 
    const subtotalElemento = document.createElement("P");
    subtotalElemento.classList.add("fw-bold");
    subtotalElemento.textContent = "Subtotal: ";

    const subtotalValor = document.createElement("SPAN");
    subtotalValor.classList.add("fw-normal");
    subtotalValor.textContent = `$ ${precio * cantidad}`;

    // Botón para eliminar
    const botonEliminar = document.createElement("BUTTON");
    botonEliminar.classList.add("btn", "btn-danger");
    botonEliminar.textContent = "Eliminar del pedido";

    // Función para eliminar del pedido
    botonEliminar.onclick = () => {
      eliminarProducto(id);
    }

    // Agregar valores a sus contenedores
    cantidadElemento.appendChild(cantidadValor)
    precioElemento.appendChild(precioValor)
    subtotalElemento.appendChild(subtotalValor)


    // Agregar Elementos al LI
    lista.appendChild(nombreElemento);
    lista.appendChild(cantidadElemento);
    lista.appendChild(precioElemento);
    lista.appendChild(subtotalElemento);
    lista.appendChild(botonEliminar);
    


    // Agregar Lista al Grupo Principa
    grupo.appendChild(lista);
  })



  // Agregar al contenido
  resumen.appendChild(heading);
  resumen.appendChild(mesa);
  resumen.appendChild(hora);
  resumen.appendChild(grupo);

  contenido.appendChild(resumen);

  // Mostrar Formulario de Comisión
  formularioComision();
}

function eliminarProducto(id) {
  // Eliminar elementos cuando la cantidad es 0
  const { pedido } = cliente;
  const resultado = pedido.filter( articulo => articulo.id !== id);
  cliente.pedido = [...resultado];

   // Limpiar el código HTML previo
  limpiarHTML();

  if(cliente.pedido.length) {
    // Mostrar el Resumen
    actualizarResumen();
  } else {
    mensajePedidoVacio();
  }

  // El producto se eliminó, por lo tanto regresamos la cantidad a 0 en el Formulario
  const productoEliminado = `#producto-${id}`;
  const inputEliminado = document.querySelector(productoEliminado);
  inputEliminado.value = 0;
}

function mensajePedidoVacio() {
  const contenido = document.querySelector("#resumen .contenido");

  const texto = document.createElement("P");
  texto.classList.add("text-center");
  texto.textContent = "Añade los elementos al pedido";

  contenido.appendChild(texto);
}

function formularioComision() {
  const contenido = document.querySelector("#resumen .contenido");

  const formulario = document.createElement("DIV");
  formulario.classList.add("col-md-6", "formulario");

  const divFormulario = document.createElement("DIV");
  divFormulario.classList.add("card", "py-2", "px-3", "shadow");

  const heading = document.createElement("H3");
  heading.classList.add("my-4", "text-center");
  heading.textContent = "Comisión del Empleado";

  // Radio Button 10%
  const radio10 = document.createElement("INPUT");
  radio10.type = "radio";
  radio10.name = "comision";
  radio10.value = "10";
  radio10.classList.add("form-check-input");
  radio10.onclick = calcularComision;

  const radio10Label = document.createElement("LABEL");
  radio10Label.textContent = "10%";
  radio10Label.classList.add("form-check-label");

  const radio10Div = document.createElement("DIV");
  radio10Div.classList.add("form-check");

  radio10Div.appendChild(radio10);
  radio10Div.appendChild(radio10Label);

  // Radio Button 15%
  const radio15 = document.createElement("INPUT");
  radio15.type = "radio";
  radio15.name = "comision";
  radio15.value = "15";
  radio15.classList.add("form-check-input");
  radio15.onclick = calcularComision;

  const radio15Label = document.createElement("LABEL");
  radio15Label.textContent = "15%";
  radio15Label.classList.add("form-check-label");

  const radio15Div = document.createElement("DIV");
  radio15Div.classList.add("form-check");

  radio15Div.appendChild(radio15);
  radio15Div.appendChild(radio15Label);

  
  // Radio Button 20%
  const radio20 = document.createElement("INPUT");
  radio20.type = "radio";
  radio20.name = "comision";
  radio20.value = "20";
  radio20.classList.add("form-check-input");
  radio20.onclick = calcularComision;

  const radio20Label = document.createElement("LABEL");
  radio20Label.textContent = "20%";
  radio20Label.classList.add("form-check-label");

  const radio20Div = document.createElement("DIV");
  radio20Div.classList.add("form-check");

  radio20Div.appendChild(radio20);
  radio20Div.appendChild(radio20Label);


  // Agregar al div principal
  divFormulario.appendChild(heading);
  divFormulario.appendChild(radio10Div);
  divFormulario.appendChild(radio15Div);
  divFormulario.appendChild(radio20Div);
  
  // Agregarlo al formulario
  formulario.appendChild(divFormulario);

  contenido.appendChild(formulario);
}

function calcularComision() {

  const { pedido } = cliente;
  let subtotal = 0;

  // Calcular Subtotal a pagar
  pedido.forEach( articulo => {
    subtotal += articulo.cantidad * articulo.precio;
  });

  // Seleccionar el radio button con la comisión
  const comisionSeleccionada = Number(document.querySelector("[name='comision']:checked").value);


  // Calcular comisión
  const comision = (subtotal * comisionSeleccionada) / 100;

  // Calcular el total facturado
  const total = subtotal - comision;

  mostrarTotalHTML( subtotal, total, comision );
}

function mostrarTotalHTML (subtotal, total, comision ) {

  const divTotales = document.createElement("DIV");
  divTotales.classList.add("total-pagar", "my-5");

  // Subtotal
  const subtotalParrafo = document.createElement("P");
  subtotalParrafo.classList.add("fs-4", "fw-bold", "mt-2");
  subtotalParrafo.textContent = "Subtotal: ";

  const subtotalSpan = document.createElement("SPAN");
  subtotalSpan.classList.add("fw-normal");
  subtotalSpan.textContent = `$ ${subtotal}`;

  subtotalParrafo.appendChild(subtotalSpan);

  // Comisión
  const comisionParrafo = document.createElement("P");
  comisionParrafo.classList.add("fs-4", "fw-bold", "mt-2");
  comisionParrafo.textContent = "Comisión: ";

  const comisionSpan = document.createElement("SPAN");
  comisionSpan.classList.add("fw-normal");
  comisionSpan.textContent = `$ ${comision}`;

  comisionParrafo.appendChild(comisionSpan);

  // Total
  const totalParrafo = document.createElement("P");
  totalParrafo.classList.add("fs-4", "fw-bold", "mt-2");
  totalParrafo.textContent = "Facturado: ";

  const totalSpan = document.createElement("SPAN");
  totalSpan.classList.add("fw-normal");
  totalSpan.textContent = `$ ${subtotal - comision}`;

  totalParrafo.appendChild(totalSpan);

  // Eliminar el último resultado
  const totalPagarDiv = document.querySelector(".total-pagar");
  if(totalPagarDiv) {
    totalPagarDiv.remove();
  }


  divTotales.appendChild(subtotalParrafo);
  divTotales.appendChild(comisionParrafo);
  divTotales.appendChild(totalParrafo);

  const formulario = document.querySelector(".formulario > div");
  formulario.appendChild(divTotales);

}

function limpiarHTML() {
  const contenido = document.querySelector("#resumen .contenido");

  while( contenido.firstChild ) {
    contenido.removeChild(contenido.firstChild);
  }
}