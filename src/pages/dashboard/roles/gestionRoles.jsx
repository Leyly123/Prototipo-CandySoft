import React, { useState } from "react";
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { AiOutlineEye } from "react-icons/ai";
import "../../../css/gestionar.css";
import "../../../css/rolesForm.css";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTheme } from "../../tema/ThemeContext";
const GestionRoles = () => {

    const [roles, setRoles] = useState([
        { id: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema', modulos: ["Cliente", "Compra", "Proveedor"], estado: true },
        { id: 2, nombre: 'Editor', descripcion: 'Puede editar contenido pero no administrar usuarios', modulos: ["Cliente", "Compra", "Proveedor"], estado: false },
        { id: 3, nombre: 'Visualizador', descripcion: 'Solo puede ver información, sin permisos de edición', modulos: ["Cliente", "Compra", "Proveedor"], estado: true },
        { id: 4, nombre: 'Supervisor', descripcion: 'Controla los procesos internos', estado: true },
        { id: 5, nombre: 'Recepcionista', descripcion: 'Atiende a los clientes', estado: true },
        { id: 6, nombre: 'Contador', descripcion: 'Gestiona la parte financiera', estado: false },
    ]);

    const [rolSeleccionado, setRolSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const rolesPorPagina = 4;

    const [isCrearModalOpen, setCrearModalOpen] = useState(false);
    const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
    const [errores, setErrores] = useState({});
    const [modulosSeleccionados, setModulosSeleccionados] = useState([]);
    const modulosDisponibles = [
        "Cliente",
        "Compra",
        "Proveedor",
        "Insumo",
        "Servicio",
        "Venta",
        "Horario",
        "Cita",
        "Manicurista",
        "Abastecimiento",
        "Novedades",
        "Usuario",
    ];

    const validarCampo = (name, value) => {
        let error = "";
        if (!value.trim()) {
            error = name === "nombre" ? "El nombre del rol es obligatorio" : "La descripción del rol es obligatoria";
        }
        setErrores((prev) => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errores[name]) validarCampo(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validarCampo(name, value);
    };

    const handleModuloChange = (modulo) => {
        setModulosSeleccionados((prev) =>
            prev.includes(modulo)
                ? prev.filter((m) => m !== modulo)
                : [...prev, modulo]
        );
    };

    const handleCrear = (e) => {
        e.preventDefault();

        let nuevosErrores = {};
        const nombresCampos = {
            nombre: "El nombre",
            correo: "El correo",
            contraseña: "La contraseña",
        };

        Object.entries(formData).forEach(([campo, valor]) => {
            if (!valor.trim()) {
                const nombreCampo = nombresCampos[campo] || "Este campo";
                nuevosErrores[campo] = `${nombreCampo} es obligatorio`;
            }
        });

        if (modulosSeleccionados.length === 0) {
            nuevosErrores.modulos = "Debe seleccionar al menos un módulo";
        }

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length === 0) {
            closeCrearModal();
        }

        const hayErrores =
            Object.values(nuevosErrores).some((e) => e) ||
            Object.values(formData).some((val) => val.trim() === "");

        if (!hayErrores) {
            closeCrearModal();
        } else {
            alert("Por favor completa todos los campos correctamente.");
        }
    };

    const openCrearModal = () => setCrearModalOpen(true);
    const closeCrearModal = () => setCrearModalOpen(false);

    const [isEditarModalOpen, setEditarModalOpen] = useState(false);
    const [rolEditando, setRolEditando] = useState(null);

    const openEditarModal = (rol) => {
        setRolEditando(rol);
        setEditarModalOpen(true);
    };

    const closeEditarModal = () => {
        setRolEditando(null);
        setEditarModalOpen(false);
    };

    const handleEditarRol = (id) => {
        const rol = roles.find(u => u.id === id);
        setModulosSeleccionados(rol.modulos || []);
        openEditarModal(rol);
    };

    const [erroresEditar, setErroresEditar] = useState({});


    const [isVerModalOpen, setVerModalOpen] = useState(false);
    const openVerModal = (rol) => {
        setRolSeleccionado(rol);
        setVerModalOpen(true);
    };

    const closeVerModal = () => {
        setRolSeleccionado(null);
        setVerModalOpen(false);
    };

    const handleToggleEstado = (id) => {
        setRoles(roles.map(rol =>
            rol.id === id ? { ...rol, estado: !rol.estado } : rol
        ));
    };

    const MySwal = withReactContent(Swal);

    const handleEliminarRol = (rol) => {
        if (rol.nombre.toLowerCase() === 'administrador') {
            MySwal.fire({
                title: 'Acción no permitida',
                text: 'El rol de Administrador no puede ser eliminado.',
                icon: 'error',
                confirmButtonColor: '#7e2952',
                confirmButtonText: 'Entendido',
                customClass: {
                    popup: 'swal-rosado'
                }
            });
            return;
        }

        MySwal.fire({
            title: `¿Eliminar el rol ${rol.nombre}?`,
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#7e2952',
            cancelButtonColor: '#d8d6d7',
            reverseButtons: true,
            customClass: {
                popup: 'swal-rosado'
            }
        })
    };

    const handleBuscar = (e) => {
        setBusqueda(e.target.value.toLowerCase());
        setPaginaActual(1);
    };

    const rolesFiltrados = roles.filter(rol => {
        const nombreMatch = rol.nombre.toLowerCase().includes(busqueda);
        const estadoMatch = (rol.estado ? 'activo' : 'inactivo').includes(busqueda);
        return nombreMatch || estadoMatch;
    });


    const indexUltimoRol = paginaActual * rolesPorPagina;
    const indexPrimerRol = indexUltimoRol - rolesPorPagina;
    const rolesActuales = rolesFiltrados.slice(indexPrimerRol, indexUltimoRol);
    const totalPaginas = Math.ceil(rolesFiltrados.length / rolesPorPagina);

    const cambiarPagina = (numero) => {
        if (numero < 1 || numero > totalPaginas) return;
        setPaginaActual(numero);
    };

    const { darkMode } = useTheme();

    return (
        <div className={`roles-container ${darkMode ? "dark" : ""}`}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de roles</h1>
            </div>

            <button onClick={openCrearModal} className="crear-btn mb-4">
                Crear rol
            </button>

            {/* Barra de búsqueda */}
            <div className="busqueda-container mb-4">
                <input
                    type="text"
                    placeholder="Buscar rol..."
                    value={busqueda}
                    onChange={handleBuscar}
                    className="busqueda-input"
                />
            </div>

            <div className="overflow-hidden">
                <table className="roles-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rolesActuales.length > 0 ? (
                            rolesActuales.map((rol) => (
                                <tr key={rol.id}>
                                    <td>{rol.nombre}</td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleEstado(rol.id)}
                                            className={`estado-btn ${rol.estado ? 'estado-activo' : 'estado-inactivo'}`}>
                                            {rol.estado ? "Activo" : "Inactivo"}
                                        </button>
                                    </td>
                                    <td className="text-center space-x-2">
                                        <button
                                            onClick={() => handleEditarRol(rol.id)}
                                            className="acciones-btn editar-btn flex items-center justify-center p-2"
                                            title="Editar el rol"
                                        >
                                            <FiEdit size={16} className="text-pink-500 hover:text-pink-700" />
                                        </button>

                                        <button
                                            onClick={() => openVerModal(rol)}
                                            className="acciones-btn ver-btn flex items-center justify-center p-2"
                                            title="Ver detalles del rol"
                                        >
                                            <AiOutlineEye size={18} className="text-pink-500 hover:text-pink-700" />
                                        </button>

                                        <button
                                            onClick={() => handleEliminarRol(rol)}
                                            className="acciones-btn eliminar-btn flex items-center justify-center p-2"
                                            title="Eliminar el rol"
                                        >
                                            <FiTrash2 size={18} className="text-red-500 hover:text-red-700" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">No se encontraron roles</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="paginacion-container">
                <div
                    className={`flecha ${paginaActual === 1 ? 'flecha-disabled' : ''}`}
                    onClick={() => cambiarPagina(paginaActual - 1)}
                >
                    &#8592;
                </div>

                <span className="texto-paginacion">
                    Página {paginaActual} de {totalPaginas}
                </span>

                <div
                    className={`flecha ${paginaActual === totalPaginas ? 'flecha-disabled' : ''}`}
                    onClick={() => cambiarPagina(paginaActual + 1)}
                >
                    &#8594;
                </div>
            </div>

            {isCrearModalOpen && (
                <div className="overlay-popup" onClick={closeCrearModal}>
                    <div className="ventana-popup " onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup2">
                            <h2 className="text-xl font-semibold mb-4">Crear rol</h2>
                            <form onSubmit={handleCrear} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="fila-formulario">
                                        <div className="campo relative">
                                            <input
                                                type="text"
                                                className="input-nombre"
                                                name="nombre"
                                                placeholder="Nombre del Rol *"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            {errores.nombre && <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">{errores.nombre}</p>}
                                        </div>
                                        <div className="campo relative">
                                            <input
                                                type="text"
                                                className="input-nombre"
                                                name="descripcion"
                                                placeholder="Descripción del Rol *"
                                                value={formData.descripcion}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            {errores.descripcion && <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">{errores.descripcion}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-roles">
                                    {[0, 1, 2].map((columna) => (
                                        <div key={columna} className="grid-column">
                                            {modulosDisponibles
                                                .slice(columna * 4, columna === 2 ? 14 : (columna + 1) * 4)
                                                .map((modulo) => (
                                                    <label
                                                        key={modulo}
                                                        className="border checkbox-label rounded-lg p-4 shadow-md flex items-center justify-between cursor-pointer"
                                                    >
                                                        <span className="permiso-info">{modulo}</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={modulosSeleccionados.includes(modulo)}
                                                            onChange={() => handleModuloChange(modulo)}
                                                            className="checkbox-input"
                                                        />
                                                    </label>
                                                ))}
                                        </div>
                                    ))}
                                </div>
                                {errores.modulos && <p className="error-texto text-red-600">{errores.modulos}</p>}
                                <div className="button-container">
                                    <button type="button" className="btn-cancelar" onClick={closeCrearModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-crear">
                                        Crear rol
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isEditarModalOpen && rolEditando && (
                <div className="overlay-popup" onClick={closeEditarModal}>
                    <div className="ventana-popup max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup2">
                            <h2 className="text-xl font-semibold mb-4">Editar rol</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    let isValid = true;
                                    let errors = {};

                                    if (rolEditando.nombre.trim() === '') {
                                        errors.nombre = 'Este campo es obligatorio';
                                        isValid = false;
                                    }
                                    if (rolEditando.descripcion.trim() === '') {
                                        errors.descripcion = 'Este campo es obligatorio';
                                        isValid = false;
                                    }
                                    if (modulosSeleccionados.length === 0) {
                                        errors.modulos = 'Debes seleccionar al menos un módulo';
                                        isValid = false;
                                    }

                                    if (isValid) {
                                        setRoles(prev =>
                                            prev.map(u => u.id === rolEditando.id ? rolEditando : u)
                                        );
                                        closeEditarModal();
                                    } else {
                                        setErroresEditar(errors);
                                    }
                                }}
                                className="space-y-3"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="fila-formulario">
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Nombre:</label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                value={rolEditando.nombre}
                                                onChange={(e) => {
                                                    setRolEditando({ ...rolEditando, nombre: e.target.value });
                                                    if (e.target.value.trim() === '') {
                                                        setErroresEditar((prev) => ({ ...prev, nombre: 'Este campo es obligatorio' }));
                                                    } else {
                                                        setErroresEditar((prev) => ({ ...prev, nombre: null }));
                                                    }
                                                }}
                                                placeholder="Nombre"
                                                className="input-texto"
                                            />
                                            {erroresEditar?.nombre && (
                                                <div style={{ textAlign: 'left' }}>
                                                    <p className="error-mensaje-rol">{erroresEditar.nombre}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Descripción:</label>
                                            <input
                                                type="text"
                                                name="descripcion"
                                                value={rolEditando.descripcion}
                                                onChange={(e) => {
                                                    setRolEditando({ ...rolEditando, descripcion: e.target.value });
                                                    if (e.target.value.trim() === '') {
                                                        setErroresEditar((prev) => ({ ...prev, descripcion: 'Este campo es obligatorio' }));
                                                    } else {
                                                        setErroresEditar((prev) => ({ ...prev, descripcion: null }));
                                                    }
                                                }}
                                                placeholder="Descripción"
                                                className="input-texto"
                                            />
                                            {erroresEditar?.descripcion && (
                                                <div style={{ textAlign: 'left' }}>
                                                    <p className="error-mensaje-rol">{erroresEditar.descripcion}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid-roles">

                                    {[0, 1, 2].map((columna) => (
                                        <div key={columna} className="grid-column">
                                            {modulosDisponibles
                                                .slice(columna * 4, columna === 2 ? 14 : (columna + 1) * 4)
                                                .map((modulo) => (
                                                    <label
                                                        key={modulo}
                                                        className="border checkbox-label rounded-lg p-4 shadow-md flex items-center justify-between cursor-pointer"
                                                    >
                                                        <span className="permiso-info">{modulo}</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={modulosSeleccionados.includes(modulo)}
                                                            onChange={() => {
                                                                handleModuloChange(modulo);
                                                                if (modulosSeleccionados.length > 0) {
                                                                    setErroresEditar(prev => ({ ...prev, modulos: null }));
                                                                }
                                                            }}
                                                            className="checkbox-input"
                                                        />
                                                    </label>
                                                ))}
                                        </div>
                                    ))}
                                </div>
                                {erroresEditar?.modulos && (
                                    <div style={{ textAlign: 'left' }}>
                                        <p className="error-mensaje-rol">{erroresEditar.modulos}</p>
                                    </div>
                                )}
                                <div className="campo">
                                    <label className="subtitulo-editar-todos">Estado:</label>
                                    <select
                                        name="estado"
                                        value={rolEditando.estado ? "activo" : "inactivo"}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setRolEditando({ ...rolEditando, estado: value === "activo" });
                                            setErroresEditar(prev => ({
                                                ...prev,
                                                estado: value.trim() === "" ? "Este campo es obligatorio" : "",
                                            }));
                                        }}
                                        className="input-select"
                                    >
                                        <option value="">Selecciona el estado</option>
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                    {erroresEditar.estado && <p className="error-mensaje">{erroresEditar.estado}</p>}
                                </div>

                                <div className="button-container">
                                    <button type="button" className="btn-cancelar" onClick={closeEditarModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-crear">
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}


            {isVerModalOpen && rolSeleccionado && (
                <div className="overlay-popup" onClick={closeVerModal}>
                    <div className="ventana-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup2">
                            <h2 className="titulo-usuario">Detalles del rol</h2>

                            <div className="info-usuario space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="fila-formulario">
                                        <p><strong>Nombre del rol:</strong> {rolSeleccionado.nombre}</p>
                                        <p><strong>Descripción del rol:</strong> {rolSeleccionado.descripcion}</p>
                                    </div>
                                    <p><strong>Estado:</strong> {rolSeleccionado.estado ? "Activo" : "Inactivo"}</p>
                                </div>
                            </div>
                            <div className="tabla-liq">
                                <table className="liq-table">
                                    <thead>
                                        <tr>
                                            <th>Módulo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rolSeleccionado.modulos && rolSeleccionado.modulos.length > 0 ? (
                                            rolSeleccionado.modulos.map((modulo) => (
                                                <tr key={modulo}>
                                                    <td>{modulo}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="text-center">Este rol no tiene módulos asignados</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div >
                                <button className="btn-volver" onClick={closeVerModal}>
                                    Volver
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionRoles;