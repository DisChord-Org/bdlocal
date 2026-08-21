import { obtenerEnRuta, establecerEnRuta } from './internal.js';
import { existe, leer, escribir } from '../lib/sf/src/index.js';
let bases = {};
async function archivoExiste(ruta) {
    return existe(ruta);
}
async function leerArchivo(ruta) {
    return leer(ruta);
}
async function escribirArchivo(ruta, contenido) {
    return escribir(ruta, contenido);
}
export async function cargar(ruta) {
    let existeArchivo = await archivoExiste(ruta);
    if (!existeArchivo) {
        bases[ruta] = {};
        return bases[ruta];
    }
    let contenido = await leerArchivo(ruta);
    bases[ruta] = JSON.parse(contenido);
    return bases[ruta];
}
export async function guardar(ruta) {
    return await escribirArchivo(ruta, JSON.stringify(bases[ruta], undefined, 2));
}
export function obtener(ruta, clave) {
    return obtenerEnRuta(bases[ruta], clave.split('.'));
}
export function tiene(ruta, clave) {
    return obtener(ruta, clave) != undefined;
}
export async function establecer(ruta, clave, valor) {
    establecerEnRuta(bases[ruta], clave.split('.'), valor);
    return await guardar(ruta);
}
export async function borrar(ruta, clave) {
    return await establecer(ruta, clave, undefined);
}
export async function empujar(ruta, clave, valor) {
    let actual = obtener(ruta, clave);
    if (actual == undefined) {
        actual = [];
    }
    actual.push(valor);
    return await establecer(ruta, clave, actual);
}
export async function quitar(ruta, clave, valor) {
    let actual = obtener(ruta, clave);
    let resultado = [];
    if (actual != undefined) {
        for (let elemento of Array.isArray(actual) ? actual : Object.keys(actual)) {
            if (elemento != valor) {
                resultado.push(elemento);
            }
        }
    }
    return await establecer(ruta, clave, resultado);
}
export async function sumar(ruta, clave, cantidad) {
    let actual = obtener(ruta, clave);
    let base = actual;
    if (actual == undefined) {
        base = 0;
    }
    return await establecer(ruta, clave, base + cantidad);
}
export async function restar(ruta, clave, cantidad) {
    let actual = obtener(ruta, clave);
    let base = actual;
    if (actual == undefined) {
        base = 0;
    }
    return await establecer(ruta, clave, base - cantidad);
}
export function todo(ruta) {
    return bases[ruta];
}
