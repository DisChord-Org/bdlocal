# bdlocal
`bdlocal` es una base de datos local en JSON para el ecosistema DisChord, al estilo megadb: guarda claves en notación de punto (`usuario.nombre`), persiste automáticamente en disco en cada escritura, y soporta varios ficheros abiertos a la vez.

Escrita íntegramente en **DisChord** (`.chord`), sobre la librería oficial `sf`. Separada en `index.chord` (API pública) e `internal.chord` (utilidades de rutas anidadas), como el resto de librerías del ecosistema.

## Uso rápido
```chord
importar { cargar, establecer, obtener, empujar, sumar } desde "lib:bdlocal"

cargar("usuarios.json")
cargar("config.json")

establecer("usuarios.json", "victor.rol", "admin")
establecer("config.json", "tema", "oscuro")

consola.imprimir(obtener("usuarios.json", "victor.rol")) // 'admin'

empujar("usuarios.json", "tags", "beta")
sumar("config.json", "contador", 5)
```

## API
Todas las funciones reciben `ruta` como primer argumento — el fichero al que apuntan. Puedes tener tantos abiertos como quieras a la vez, y todas admiten notación de punto (`"usuario.perfil.rol"`) para leer/escribir dentro de objetos anidados.

| Función | Descripción |
| --- | --- |
| [`cargar(ruta)`](#cargarruta) | Carga (o crea) el fichero JSON en memoria. |
| [`guardar(ruta)`](#guardarruta) | Persiste el estado actual de ese fichero en disco. |
| [`obtener(ruta, clave)`](#obtenerruta-clave) | Lee un valor por clave. |
| [`tiene(ruta, clave)`](#tieneruta-clave) | Comprueba si una clave tiene valor. |
| [`establecer(ruta, clave, valor)`](#establecerruta-clave-valor) | Escribe un valor y persiste. |
| [`borrar(ruta, clave)`](#borrarruta-clave) | Elimina una clave y persiste. |
| [`empujar(ruta, clave, valor)`](#empujarruta-clave-valor) | Añade un valor a un array en esa clave. |
| [`quitar(ruta, clave, valor)`](#quitarruta-clave-valor) | Quita las coincidencias de un valor de un array. |
| [`sumar(ruta, clave, cantidad)`](#sumarruta-clave-cantidad) | Incrementa un valor numérico. |
| [`restar(ruta, clave, cantidad)`](#restarruta-clave-cantidad) | Decrementa un valor numérico. |
| [`todo(ruta)`](#todoruta) | Devuelve el objeto completo de ese fichero en memoria. |

---

### `cargar(ruta)`
Lo primero que haces con cualquier fichero. Si no existe, lo trata como una base vacía (no lo crea en disco hasta el primer `establecer`). Hay que llamarlo una vez por fichero antes de usar cualquier otra función sobre esa `ruta`.

```chord
importar { cargar } desde "lib:bdlocal"

cargar("usuarios.json")
```

### `guardar(ruta)`
Persiste en disco el estado actual en memoria de ese fichero. No hace falta llamarlo a mano casi nunca — `establecer`/`borrar`/`empujar`/`quitar`/`sumar`/`restar` ya guardan por ti tras cada cambio. Solo es útil si necesitas forzar una escritura sin cambiar nada.

```chord
importar { cargar, guardar } desde "lib:bdlocal"

cargar("usuarios.json")
guardar("usuarios.json")
```

### `obtener(ruta, clave)`
Lee un valor. Devuelve `indefinido` si la clave no existe. Admite notación de punto para bajar por objetos anidados.

```chord
importar { cargar, establecer, obtener } desde "lib:bdlocal"

cargar("usuarios.json")
establecer("usuarios.json", "victor.rol", "admin")

consola.imprimir(obtener("usuarios.json", "victor.rol")) // 'admin'
consola.imprimir(obtener("usuarios.json", "victor.edad")) // indefinido
```

### `tiene(ruta, clave)`
Igual que `obtener`, pero devuelve `verdadero`/`falso` en vez del valor.

```chord
importar { cargar, establecer, tiene } desde "lib:bdlocal"

cargar("usuarios.json")
establecer("usuarios.json", "victor.rol", "admin")

si (tiene("usuarios.json", "victor.rol")) {
    consola.imprimir("victor tiene rol asignado")
}
```

### `establecer(ruta, clave, valor)`
Escribe (o sobrescribe) un valor y persiste inmediatamente. Si la clave usa notación de punto, crea los objetos intermedios que hagan falta.

```chord
importar { cargar, establecer } desde "lib:bdlocal"

cargar("usuarios.json")
establecer("usuarios.json", "victor.rol", "admin")
establecer("usuarios.json", "victor.perfil.tema", "oscuro")
```

### `borrar(ruta, clave)`
Elimina el valor de una clave (y persiste). La clave deja de aparecer al serializar a JSON.

```chord
importar { cargar, establecer, borrar, tiene } desde "lib:bdlocal"

cargar("usuarios.json")
establecer("usuarios.json", "victor.rol", "admin")

borrar("usuarios.json", "victor.rol")

consola.imprimir(tiene("usuarios.json", "victor.rol")) // falso
```

### `empujar(ruta, clave, valor)`
Añade un valor a un array en esa clave. Si la clave no existe todavía, crea el array.

```chord
importar { cargar, empujar, obtener } desde "lib:bdlocal"

cargar("usuarios.json")
empujar("usuarios.json", "victor.tags", "admin")
empujar("usuarios.json", "victor.tags", "beta")

consola.imprimir(obtener("usuarios.json", "victor.tags")) // [ 'admin', 'beta' ]
```

### `quitar(ruta, clave, valor)`
Quita del array todas las apariciones que coincidan con `valor`.

```chord
importar { cargar, empujar, quitar, obtener } desde "lib:bdlocal"

cargar("usuarios.json")
empujar("usuarios.json", "victor.tags", "admin")
empujar("usuarios.json", "victor.tags", "beta")

quitar("usuarios.json", "victor.tags", "admin")

consola.imprimir(obtener("usuarios.json", "victor.tags")) // [ 'beta' ]
```

### `sumar(ruta, clave, cantidad)`
Incrementa un valor numérico. Si la clave no existe todavía, parte de `0`.

```chord
importar { cargar, sumar, obtener } desde "lib:bdlocal"

cargar("economia.json")
sumar("economia.json", "victor.saldo", 100)
sumar("economia.json", "victor.saldo", 50)

consola.imprimir(obtener("economia.json", "victor.saldo")) // 150
```

### `restar(ruta, clave, cantidad)`
Decrementa un valor numérico. Igual que `sumar`, pero en negativo, y también parte de `0` si la clave no existe.

```chord
importar { cargar, sumar, restar, obtener } desde "lib:bdlocal"

cargar("economia.json")
sumar("economia.json", "victor.saldo", 100)
restar("economia.json", "victor.saldo", 30)

consola.imprimir(obtener("economia.json", "victor.saldo")) // 70
```

### `todo(ruta)`
Devuelve el objeto completo en memoria de ese fichero, tal cual está en ese momento.

```chord
importar { cargar, establecer, todo } desde "lib:bdlocal"

cargar("usuarios.json")
establecer("usuarios.json", "victor.rol", "admin")

consola.imprimir(todo("usuarios.json")) // { victor: { rol: 'admin' } }
```

## Dependencias
- [`sf`](https://github.com/DisChord-Org/sf) — lectura/escritura de los ficheros JSON.
