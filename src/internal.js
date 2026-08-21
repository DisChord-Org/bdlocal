export function obtenerEnRuta(objeto, partes) {
    if (partes.length == 0) {
        return objeto;
    }
    if (objeto == undefined) {
        return undefined;
    }
    return obtenerEnRuta(objeto[partes[0]], partes.slice(1));
}
export function establecerEnRuta(objeto, partes, valor) {
    let clave = partes[0];
    if (partes.length == 1) {
        objeto[clave] = valor;
        return objeto;
    }
    if (objeto[clave] == undefined) {
        objeto[clave] = {};
    }
    establecerEnRuta(objeto[clave], partes.slice(1), valor);
    return objeto;
}
